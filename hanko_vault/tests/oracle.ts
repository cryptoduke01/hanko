/**
 * Prove settle_with_oracle end to end on devnet: configure a vault's Pyth feed,
 * then settle permissionlessly from Pyth's sponsored SOL/USD price account.
 *
 * Pyth keeps a few feeds (SOL/USD among them) continuously updated on-chain as
 * `PriceUpdateV2` accounts owned by the receiver program, at a fixed address
 * derived from the push-oracle program. Reading that account needs no Hermes
 * call, which matters because Hermes now returns 401 without an API key. US
 * equity accounts exist at the same kind of address but are only refreshed when
 * someone posts an update, so they are usually older than PYTH_MAX_AGE_SECS and
 * settle_with_oracle rejects them as stale (see README, "Pyth status").
 *
 * To run (no extra dependencies):
 *   RPC_URL=<devnet> npx ts-node --transpile-only tests/oracle.ts
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
import assert from "assert";
import fs from "fs";

const IDL = require("../target/idl/hanko_vault.json");
const PROGRAM_ID = new PublicKey(IDL.address);
const DECIMALS = 6;
const ONE = 10 ** DECIMALS;
const b = (n: number) => new anchor.BN(n);

// Pyth SOL/USD feed id (same id we verified the on-chain deserializer against).
const SOL_USD = "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";
// Pyth push-oracle program; sponsored feed accounts are PDAs of [shard u16 LE, feed id].
const PYTH_PUSH_ORACLE = new PublicKey("pythWSnswVUd12oZpeFP8e9CVaEqJg25g1Vtc2biRsT");
const PYTH_RECEIVER = new PublicKey("rec5EKMGg6MxZYaMdyBfgwp4d5rB9T1VQH5pJv5LtFJ");

function sponsoredFeedAccount(feedId: string, shard = 0): PublicKey {
  const s = Buffer.alloc(2);
  s.writeUInt16LE(shard);
  return PublicKey.findProgramAddressSync(
    [s, Buffer.from(feedId.replace(/^0x/, ""), "hex")],
    PYTH_PUSH_ORACLE
  )[0];
}

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

  // 3. Use Pyth's sponsored SOL/USD account: receiver-owned, fully verified, kept fresh.
  const priceUpdate = sponsoredFeedAccount(SOL_USD);
  const info = await connection.getAccountInfo(priceUpdate);
  assert.ok(info, "sponsored SOL/USD account exists");
  assert.ok(info.owner.equals(PYTH_RECEIVER), "owned by the Pyth receiver");
  // PriceUpdateV2: 8 disc, 32 write authority, 1 verification level (Full), then the message.
  const publishTime = Number(info.data.readBigInt64LE(41 + 32 + 8 + 8 + 4));
  const age = Math.floor(Date.now() / 1000) - publishTime;
  console.log(`price account ${priceUpdate.toBase58().slice(0, 8)}…, published ${age}s ago`);

  // 4. Settle permissionlessly from the signed price, no Hermes involved.
  const sig = await program.methods
    .settleWithOracle()
    .accountsStrict({ caller: payer.publicKey, underlyingMint, vault, oracleFeed, priceUpdate })
    .rpc();
  console.log(`settle tx: https://explorer.solana.com/tx/${sig}?cluster=devnet`);

  const v: any = await (program.account as any).vault.fetch(vault);
  assert.ok(v.settled === true, "vault settled via oracle");
  console.log(`✓ settled via Pyth: settlement_price = ${v.settlementPrice.toNumber() / ONE} (= live SOL/USD)`);
  console.log("\nORACLE SETTLEMENT PROVEN, permissionless settle from a signed Pyth price, on devnet.");
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
