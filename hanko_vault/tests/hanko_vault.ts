/**
 * Hanko vault — end-to-end proof of the conservation invariant.
 *
 * Mints a mock underlying share, refracts it (deposit → SHIELD+CORE+EDGE),
 * then recombines part of it (burn triplet → share back), asserting balances
 * at every step. If SHIELD == CORE == EDGE == vault-held underlying throughout,
 * three tokens really do equal one share.
 *
 * Run against a local validator with the program deployed:  npm test
 */
import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAccount,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import assert from "assert";
import fs from "fs";

const IDL = require("../target/idl/hanko_vault.json");
const PROGRAM_ID = new PublicKey(IDL.address);
const DECIMALS = 6;
const ONE = 10 ** DECIMALS; // one whole share in base units

const b = (n: number) => new anchor.BN(n);

async function main() {
  const RPC = process.env.RPC_URL || "http://127.0.0.1:8899";
  const connection = new Connection(RPC, "confirmed");
  console.log(`cluster: ${RPC}`);
  const payer = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(".deployer.json", "utf8")))
  );
  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(payer), {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);
  const program = new anchor.Program(IDL as anchor.Idl, provider);

  const bal = async (a: PublicKey) => Number((await getAccount(connection, a)).amount);
  const shares = (n: number) => `${(n / ONE).toFixed(0)}`;

  // 1. A mock underlying "share" mint; give the user 100 shares.
  const underlyingMint = await createMint(connection, payer, payer.publicKey, null, DECIMALS);
  const userUnderlying = (
    await getOrCreateAssociatedTokenAccount(connection, payer, underlyingMint, payer.publicKey)
  ).address;
  await mintTo(connection, payer, underlyingMint, userUnderlying, payer, 100 * ONE);
  console.log(`underlying mint ${underlyingMint.toBase58().slice(0, 8)}… — user holds 100 shares`);

  // 2. Derive the vault + tranche mint PDAs.
  const [vault] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), underlyingMint.toBuffer()],
    PROGRAM_ID
  );
  const [shieldMint] = PublicKey.findProgramAddressSync([Buffer.from("shield"), vault.toBuffer()], PROGRAM_ID);
  const [coreMint] = PublicKey.findProgramAddressSync([Buffer.from("core"), vault.toBuffer()], PROGRAM_ID);
  const [edgeMint] = PublicKey.findProgramAddressSync([Buffer.from("edge"), vault.toBuffer()], PROGRAM_ID);
  const vaultUnderlying = getAssociatedTokenAddressSync(underlyingMint, vault, true);
  const userShield = getAssociatedTokenAddressSync(shieldMint, payer.publicKey);
  const userCore = getAssociatedTokenAddressSync(coreMint, payer.publicKey);
  const userEdge = getAssociatedTokenAddressSync(edgeMint, payer.publicKey);

  // 3. initialize_vault — floor L and cap U (price units). Maturity in the past
  //    so this single run can also exercise settle + redeem.
  const maturity = b(Math.floor(Date.now() / 1000) - 1);
  await program.methods
    .initializeVault(b(70 * ONE), b(115 * ONE), maturity)
    .accountsStrict({
      authority: payer.publicKey,
      underlyingMint,
      vault,
      shieldMint,
      coreMint,
      edgeMint,
      vaultUnderlying,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  console.log("vault initialized — SHIELD / CORE / EDGE mints created");

  // 4. deposit 40 shares → mint the spectrum.
  await program.methods
    .deposit(b(40 * ONE))
    .accountsStrict({
      user: payer.publicKey,
      vault,
      underlyingMint,
      shieldMint,
      coreMint,
      edgeMint,
      vaultUnderlying,
      userUnderlying,
      userShield,
      userCore,
      userEdge,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  assert.equal(await bal(userShield), 40 * ONE, "SHIELD minted");
  assert.equal(await bal(userCore), 40 * ONE, "CORE minted");
  assert.equal(await bal(userEdge), 40 * ONE, "EDGE minted");
  assert.equal(await bal(userUnderlying), 60 * ONE, "underlying debited");
  assert.equal(await bal(vaultUnderlying), 40 * ONE, "vault holds the shares");
  console.log(
    `✓ deposit 40 → SHIELD ${shares(await bal(userShield))} · CORE ${shares(
      await bal(userCore)
    )} · EDGE ${shares(await bal(userEdge))} · vault ${shares(await bal(vaultUnderlying))}`
  );

  // 5. recombine 25 triplets → 25 shares back.
  await program.methods
    .recombine(b(25 * ONE))
    .accountsStrict({
      user: payer.publicKey,
      vault,
      underlyingMint,
      shieldMint,
      coreMint,
      edgeMint,
      vaultUnderlying,
      userUnderlying,
      userShield,
      userCore,
      userEdge,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();

  assert.equal(await bal(userShield), 15 * ONE, "SHIELD burned");
  assert.equal(await bal(userCore), 15 * ONE, "CORE burned");
  assert.equal(await bal(userEdge), 15 * ONE, "EDGE burned");
  assert.equal(await bal(userUnderlying), 85 * ONE, "underlying returned");
  assert.equal(await bal(vaultUnderlying), 15 * ONE, "vault reduced");
  console.log(
    `✓ recombine 25 → SHIELD ${shares(await bal(userShield))} · CORE ${shares(
      await bal(userCore)
    )} · EDGE ${shares(await bal(userEdge))} · vault ${shares(await bal(vaultUnderlying))}`
  );

  // 6. Pre-settle invariant: circulating tranche supply == vault-held shares.
  assert.ok(
    (await bal(userShield)) === (await bal(userCore)) &&
      (await bal(userCore)) === (await bal(userEdge)) &&
      (await bal(userEdge)) === (await bal(vaultUnderlying)),
    "pre-settle conservation: SHIELD = CORE = EDGE = vault underlying"
  );
  console.log("✓ conservation: 15 of each tranche backed 1:1 by 15 shares in the vault");

  // 7. Settle at S = $100 (L=$70, U=$115): SHIELD 70 · CORE 30 · EDGE 0 per share.
  const S = 100;
  await program.methods
    .settle(b(S * ONE))
    .accountsStrict({ authority: payer.publicKey, underlyingMint, vault })
    .rpc();
  const vAcct = await program.account.vault.fetch(vault);
  assert.ok(vAcct.settled === true, "vault settled");
  console.log(`✓ settled at $${S}  (L=$70, U=$115)`);

  // 8. Redeem each tranche's payoff into underlying.
  const redeem = (tranche: number, mint: PublicKey, userTranche: PublicKey) =>
    program.methods
      .redeem(tranche, b(15 * ONE))
      .accountsStrict({
        user: payer.publicKey,
        underlyingMint,
        vault,
        trancheMint: mint,
        userTranche,
        vaultUnderlying,
        userUnderlying,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

  await redeem(0, shieldMint, userShield); // 15 × 70/100 = 10.5 shares
  await redeem(1, coreMint, userCore); //     15 × 30/100 = 4.5 shares
  await redeem(2, edgeMint, userEdge); //     15 × 0/100  = 0 shares (out of the money)

  assert.equal(await bal(userShield), 0, "SHIELD redeemed");
  assert.equal(await bal(userCore), 0, "CORE redeemed");
  assert.equal(await bal(userEdge), 0, "EDGE redeemed");
  assert.equal(await bal(vaultUnderlying), 0, "vault fully distributed");
  assert.equal(await bal(userUnderlying), 100 * ONE, "user made whole: 85 + 10.5 + 4.5 + 0 = 100");
  console.log("✓ redeem @ $100 → SHIELD 15→10.5 · CORE 15→4.5 · EDGE 15→0 shares; vault emptied");

  console.log("\nFULL LIFECYCLE PROVEN — mint · recombine · settle · redeem, conservation intact.");
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  }
);
