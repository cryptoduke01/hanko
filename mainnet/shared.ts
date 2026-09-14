import fs from "fs";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { getMint, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";

/** Env helpers shared by the two pool scripts. Both run on MAINNET with real
 *  funds, so everything is explicit and nothing has a silent default that could
 *  move money to the wrong place. */

export function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

/** Load a wallet from a keypair JSON file (id.json format). This wallet must
 *  hold both tokens you are seeding the pool with. */
export function loadKeypair(): Keypair {
  const path = env("KEYPAIR");
  return Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(path, "utf8")))
  );
}

export function connection(): Connection {
  return new Connection(env("RPC_URL"), "confirmed");
}

/** Read a mint's decimals and owning token program straight from chain, so the
 *  script never assumes the wrong decimals for a real share. */
export async function mintMeta(
  conn: Connection,
  mint: PublicKey
): Promise<{ decimals: number; programId: PublicKey }> {
  const info = await conn.getAccountInfo(mint);
  if (!info) throw new Error(`Mint ${mint.toBase58()} not found on this cluster`);
  const programId = info.owner.equals(TOKEN_2022_PROGRAM_ID)
    ? TOKEN_2022_PROGRAM_ID
    : TOKEN_PROGRAM_ID;
  const m = await getMint(conn, mint, "confirmed", programId);
  return { decimals: m.decimals, programId };
}

export function requireMainnet(conn: Connection): void {
  // A cheap guard against pointing a real-funds script at the wrong RPC.
  if (!/mainnet/i.test(env("RPC_URL"))) {
    console.warn(
      "! RPC_URL does not look like a mainnet endpoint. These scripts are for mainnet real liquidity."
    );
  }
}
