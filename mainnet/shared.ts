import fs from "fs";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import {
  getMint,
  getTransferFeeConfig,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

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

  // These scripts deposit gross amounts and do not net Token-2022 transfer fees,
  // so a fee-bearing mint would seed the pool at a slightly wrong ratio. Reject
  // it up front rather than open a mispriced pool.
  if (programId.equals(TOKEN_2022_PROGRAM_ID)) {
    const fee = getTransferFeeConfig(m);
    const bps = fee?.newerTransferFee.transferFeeBasisPoints ?? 0;
    if (bps > 0) {
      throw new Error(
        `Mint ${mint.toBase58()} charges a ${bps} bps transfer fee; these scripts do not net transfer fees and would seed the pool at a wrong ratio. Not supported.`
      );
    }
  }

  return { decimals: m.decimals, programId };
}

const MAINNET_GENESIS = "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d";

/** Hard stop unless the RPC is genuinely mainnet-beta (verified by genesis hash,
 *  not a URL substring). Set ALLOW_NON_MAINNET=1 to override when testing. */
export async function requireMainnet(conn: Connection): Promise<void> {
  if (process.env.ALLOW_NON_MAINNET === "1") {
    console.warn("! ALLOW_NON_MAINNET=1: skipping the mainnet check.");
    return;
  }
  let genesis: string;
  try {
    genesis = await conn.getGenesisHash();
  } catch (e) {
    throw new Error(
      `Could not read the genesis hash to confirm the cluster: ${
        e instanceof Error ? e.message : e
      }`
    );
  }
  if (genesis !== MAINNET_GENESIS) {
    throw new Error(
      "Refusing to run: RPC_URL is not mainnet-beta. Set ALLOW_NON_MAINNET=1 to override for testing."
    );
  }
}

/** Print the exact plan and refuse to send unless CONFIRM=1. Run once to review
 *  the resolved mints/wallet/amounts/price, then re-run with CONFIRM=1 to send. */
export function confirmOrExit(title: string, lines: string[]): void {
  console.log(`\n${title}`);
  for (const l of lines) console.log(`  ${l}`);
  if (process.env.CONFIRM !== "1") {
    console.log(
      "\nReview the above. Re-run the SAME command with CONFIRM=1 to send. Nothing was sent."
    );
    process.exit(0);
  }
  console.log("\nCONFIRM=1 set, sending...\n");
}
