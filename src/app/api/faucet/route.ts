import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RPC = process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";
const FUND = 0.05 * LAMPORTS_PER_SOL; // enough to mint a demo share + vault
const MIN = 0.03 * LAMPORTS_PER_SOL; // only fund wallets below this

/**
 * Load the funding key. Prefer an env secret (production); fall back to the
 * local deployer keypair in dev. The key stays server-side; it is never sent
 * to the client.
 */
function loadFunder(): Keypair | null {
  const env = process.env.HANKO_FAUCET_SECRET;
  if (env) {
    try {
      return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(env)));
    } catch {
      /* fall through */
    }
  }
  try {
    const p = path.join(process.cwd(), "hanko_vault", ".deployer.json");
    return Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(fs.readFileSync(p, "utf8")))
    );
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const funder = loadFunder();
  if (!funder) {
    return NextResponse.json({ error: "Faucet not configured" }, { status: 503 });
  }

  let to: PublicKey;
  try {
    const { address } = await req.json();
    to = new PublicKey(address);
  } catch {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  const conn = new Connection(RPC, "confirmed");
  try {
    const balance = await conn.getBalance(to);
    if (balance >= MIN) {
      return NextResponse.json({ funded: false, reason: "sufficient balance" });
    }
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: funder.publicKey,
        toPubkey: to,
        lamports: FUND,
      })
    );
    const sig = await conn.sendTransaction(tx, [funder]);
    await conn.confirmTransaction(sig, "confirmed");
    return NextResponse.json({ funded: true, sig });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Faucet failed" },
      { status: 500 }
    );
  }
}
