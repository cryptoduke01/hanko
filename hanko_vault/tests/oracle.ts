/**
 * Prove settle_with_oracle end to end on devnet: configure a vault's Pyth feed,
 * post a FRESH SOL/USD price via the Pyth receiver, then settle permissionlessly
 * from that signed price.
 *
 * Standalone (its deps are kept out of package.json so they can't destabilize
 * the main test's dependency tree). To run:
 *   npm i --no-save --legacy-peer-deps \
 *     @pythnetwork/pyth-solana-receiver @pythnetwork/hermes-client rpc-websockets@7.11.0
 *   RPC_URL=<devnet> npx ts-node --transpile-only tests/oracle.ts
 *
 * Needs network access to Pyth's Hermes (hermes.pyth.network); some sandboxed
 * environments get a 401 from it. The on-chain half (set_feed) is proven live
 * by this script even when the Hermes fetch is blocked.
 */
import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PythSolanaReceiver } from "@pythnetwork/pyth-solana-receiver";
import { HermesClient } from "@pythnetwork/hermes-client";
import assert from "assert";
import fs from "fs";

const IDL = require("../target/idl/hanko_vault.json");
const PROGRAM_ID = new PublicKey(IDL.address);
const DECIMALS = 6;
const ONE = 10 ** DECIMALS;
const b = (n: number) => new anchor.BN(n);

// Pyth SOL/USD feed id (same id we verified the on-chain deserializer against).
const SOL_USD = "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";

async function main() {
  const RPC = process.env.RPC_URL || "http://127.0.0.1:8899";
  const connection = new Connection(RPC, "confirmed");
  const payer = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(".deployer.json", "utf8")))
  );
  const wallet = new anchor.Wallet(payer);
  const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
  anchor.setProvider(provider);
  const program = new anchor.Program(IDL as anchor.Idl, provider);
  console.log(`cluster: ${RPC}`);

  // 1. Mock underlying + vault, matured in the past so we can settle now.
  const underlyingMint = await createMint(connection, payer, payer.publicKey, null, DECIMALS);
  await getOrCreateAssociatedTokenAccount(connection, payer, underlyingMint, payer.publicKey);
  const [vault] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), underlyingMint.toBuffer()],
    PROGRAM_ID
  );
  const [shieldMint] = PublicKey.findProgramAddressSync([Buffer.from("shield"), vault.toBuffer()], PROGRAM_ID);
  const [coreMint] = PublicKey.findProgramAddressSync([Buffer.from("core"), vault.toBuffer()], PROGRAM_ID);
  const [edgeMint] = PublicKey.findProgramAddressSync([Buffer.from("edge"), vault.toBuffer()], PROGRAM_ID);
  const vaultUnderlying = getAssociatedTokenAddressSync(underlyingMint, vault, true);

  await program.methods
    .initializeVault(b(100 * ONE), b(300 * ONE), b(Math.floor(Date.now() / 1000) - 5))
    .accountsStrict({
      authority: payer.publicKey, underlyingMint, vault, shieldMint, coreMint, edgeMint,
      vaultUnderlying, tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID, systemProgram: SystemProgram.programId,
    })
    .rpc();
  console.log("vault initialized (matured), L $100 U $300");

  // 2. Configure the SOL/USD feed on the vault.
  const [oracleFeed] = PublicKey.findProgramAddressSync([Buffer.from("feed"), vault.toBuffer()], PROGRAM_ID);
  const feedBytes = Array.from(Buffer.from(SOL_USD.replace(/^0x/, ""), "hex"));
  await program.methods
    .setFeed(feedBytes)
    .accountsStrict({
      authority: payer.publicKey, underlyingMint, vault, oracleFeed,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  console.log("feed set: SOL/USD");

  // 3. Post a FRESH SOL/USD price via the Pyth receiver.
  const hermes = new HermesClient("https://hermes.pyth.network", {});
  const updates = await hermes.getLatestPriceUpdates([SOL_USD]);
  const receiver = new PythSolanaReceiver({ connection, wallet });
  const builder = receiver.newTransactionBuilder({ closeUpdateAccounts: false });
  await builder.addPostPriceUpdates(updates.binary.data);
  const priceUpdate = builder.getPriceFeedAccount(0, SOL_USD);
  console.log(`posting price update account ${priceUpdate.toBase58().slice(0, 8)}…`);
  const txs = await builder.buildVersionedTransactions({ tightComputeBudget: true });
  await provider.sendAll(txs.map((t) => ({ tx: t.tx, signers: t.signers })));
  console.log("fresh SOL/USD price posted");

  // 4. Settle permissionlessly from the signed price.
  await program.methods
    .settleWithOracle()
    .accountsStrict({ caller: payer.publicKey, underlyingMint, vault, oracleFeed, priceUpdate })
    .rpc();

  const v: any = await (program.account as any).vault.fetch(vault);
  assert.ok(v.settled === true, "vault settled via oracle");
  console.log(`✓ settled via Pyth: settlement_price = ${v.settlementPrice.toNumber() / ONE} (= live SOL/USD)`);
  console.log("\nORACLE SETTLEMENT PROVEN, permissionless settle from a signed Pyth price, on devnet.");
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
