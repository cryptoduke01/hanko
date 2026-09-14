/**
 * Proof that `set_tranche_metadata` names the three tranche mints on-chain.
 *
 * Creates a fresh underlying, opens a vault, calls set_tranche_metadata("TSLA"),
 * then reads each Metaplex metadata account back and asserts the on-chain name
 * and symbol. If this passes, wallets show "Hanko TSLA Shield" instead of a
 * blank, unnamed balance.
 *
 * Run against devnet with the program deployed:  RPC_URL=<devnet> npm run test:meta
 */
import * as anchor from "@coral-xyz/anchor";
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
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
const METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);
const DECIMALS = 6;
const ONE = 10 ** DECIMALS;
const b = (n: number) => new anchor.BN(n);

const pda = (seeds: (Buffer | Uint8Array)[]) =>
  PublicKey.findProgramAddressSync(seeds, PROGRAM_ID)[0];

const metadataPda = (mint: PublicKey) =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    METADATA_PROGRAM_ID
  )[0];

/** Read borsh string (u32 LE length + bytes) at offset; returns [value, next]. */
function readStr(buf: Buffer, off: number): [string, number] {
  const len = buf.readUInt32LE(off);
  const start = off + 4;
  return [buf.slice(start, start + len).toString("utf8"), start + len];
}

/** Parse a Metaplex metadata account: key(1) + update_auth(32) + mint(32) then
 *  name, symbol, uri as borsh strings. */
function parseMetadata(data: Buffer) {
  let off = 1 + 32 + 32;
  let name: string, symbol: string, uri: string;
  [name, off] = readStr(data, off);
  [symbol, off] = readStr(data, off);
  [uri, off] = readStr(data, off);
  return {
    name: name.replace(/\0+$/, ""),
    symbol: symbol.replace(/\0+$/, ""),
    uri: uri.replace(/\0+$/, ""),
  };
}

async function main() {
  const RPC = process.env.RPC_URL || "http://127.0.0.1:8899";
  const connection = new Connection(RPC, "confirmed");
  console.log(`cluster: ${RPC}`);
  const payer = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(".deployer.json", "utf8")))
  );
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(payer),
    { commitment: "confirmed" }
  );
  anchor.setProvider(provider);
  const program = new anchor.Program(IDL as anchor.Idl, provider);

  // Fresh underlying + vault.
  const underlyingMint = await createMint(
    connection,
    payer,
    payer.publicKey,
    null,
    DECIMALS
  );
  const vault = pda([Buffer.from("vault"), underlyingMint.toBuffer()]);
  const shieldMint = pda([Buffer.from("shield"), vault.toBuffer()]);
  const coreMint = pda([Buffer.from("core"), vault.toBuffer()]);
  const edgeMint = pda([Buffer.from("edge"), vault.toBuffer()]);
  const vaultUnderlying = getAssociatedTokenAddressSync(
    underlyingMint,
    vault,
    true
  );
  console.log(`underlying ${underlyingMint.toBase58().slice(0, 8)}…, vault opened`);

  await program.methods
    .initializeVault(b(70 * ONE), b(115 * ONE), b(Math.floor(Date.now() / 1000) + 30 * 86400))
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

  // Name the tranches.
  const sig = await program.methods
    .setTrancheMetadata("TSLA")
    .accountsStrict({
      authority: payer.publicKey,
      vault,
      shieldMint,
      coreMint,
      edgeMint,
      shieldMetadata: metadataPda(shieldMint),
      coreMetadata: metadataPda(coreMint),
      edgeMetadata: metadataPda(edgeMint),
      tokenMetadataProgram: METADATA_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .preInstructions([ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 })])
    .rpc();
  console.log(`set_tranche_metadata ok (${sig.slice(0, 12)}…)`);

  // Read each back and assert.
  const expect = [
    ["Shield", shieldMint, "Hanko TSLA Shield", "TSLA-S"],
    ["Core", coreMint, "Hanko TSLA Core", "TSLA-C"],
    ["Edge", edgeMint, "Hanko TSLA Edge", "TSLA-E"],
  ] as const;
  for (const [label, mint, wantName, wantSym] of expect) {
    const acc = await connection.getAccountInfo(metadataPda(mint));
    assert(acc, `${label} metadata account missing`);
    const md = parseMetadata(acc.data);
    assert.strictEqual(md.name, wantName, `${label} name`);
    assert.strictEqual(md.symbol, wantSym, `${label} symbol`);
    console.log(`✓ ${label}: "${md.name}" (${md.symbol}) → ${md.uri}`);
  }

  console.log("\nTRANCHE NAMING PROVEN, wallets render the three tokens by name.");
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  }
);
