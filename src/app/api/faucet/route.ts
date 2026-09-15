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

// Abuse bounds. A public, unauthenticated devnet faucet can always be poked
// with fresh keypairs, so the goal is to BOUND the damage, not to prevent every
// request. The reserve floor is the real control (stateless, works across all
// serverless instances); the in-memory limits are best-effort and reset on a
// cold start, so they only raise the cost of casual scripted abuse.
const RESERVE_FLOOR =
  Number(process.env.HANKO_FAUCET_RESERVE_SOL || "0.5") * LAMPORTS_PER_SOL;
const IP_WINDOW_MS = 10 * 60_000; // 10 minutes
const IP_MAX = 3; // requests per IP per window
const GLOBAL_WINDOW_MS = 60 * 60_000; // 1 hour
const GLOBAL_MAX = 40; // drips per instance per hour (~2 SOL)

// Genesis hash of mainnet-beta. The faucet refuses to run on it: this is a
// devnet demo tool and must never send real SOL, even if RPC is misconfigured.
const MAINNET_GENESIS = "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d";
let genesisChecked = false;
let onMainnet = false;

// Best-effort, per-instance memory. Not shared across serverless instances.
const ipHits = new Map<string, number[]>();
let globalHits: number[] = [];
// Drips sent but not yet settled. Counted against the reserve floor and global
// cap so a concurrent burst cannot all pass the same balance check and undershoot
// the reserve (closes the check-then-act window within this instance).
let inFlight = 0;

async function refuseIfMainnet(conn: Connection): Promise<boolean> {
  if (!genesisChecked) {
    try {
      onMainnet = (await conn.getGenesisHash()) === MAINNET_GENESIS;
    } catch {
      onMainnet = false; // cannot tell: default RPC is devnet, so do not block
    }
    genesisChecked = true;
  }
  return onMainnet;
}

function prune(list: number[], windowMs: number, now: number): number[] {
  return list.filter((t) => now - t < windowMs);
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") || "unknown";
}

/**
 * Load the funding key from a dedicated env secret. The key stays server-side
 * and is never sent to the client. In production this MUST be a throwaway
 * devnet key (`HANKO_FAUCET_SECRET`), never the program's deploy authority. Only
 * in local dev do we fall back to the deployer keypair for convenience.
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
  // Never fall back to the on-disk deploy authority in production.
  if (process.env.NODE_ENV === "production") return null;
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

  const now = Date.now();

  // Best-effort per-IP rate limit.
  const ip = clientIp(req);
  const hits = prune(ipHits.get(ip) ?? [], IP_WINDOW_MS, now);
  if (hits.length >= IP_MAX) {
    return NextResponse.json(
      { funded: false, reason: "rate limited, try again later" },
      { status: 429 }
    );
  }

  // Best-effort global throttle for this instance.
  globalHits = prune(globalHits, GLOBAL_WINDOW_MS, now);

  // Keep the per-IP map from growing without bound on a long-lived instance.
  if (ipHits.size > 500) {
    for (const [k, v] of ipHits) {
      if (prune(v, IP_WINDOW_MS, now).length === 0) ipHits.delete(k);
    }
  }
  // In-flight drips count toward the cap so a concurrent burst cannot slip past.
  if (globalHits.length + inFlight >= GLOBAL_MAX) {
    return NextResponse.json(
      { funded: false, reason: "faucet busy, try again later" },
      { status: 429 }
    );
  }

  let to: PublicKey;
  try {
    const { address } = await req.json();
    to = new PublicKey(address);
  } catch {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  const conn = new Connection(RPC, "confirmed");

  // Hard stop: this is a devnet tool and must never send real SOL.
  if (await refuseIfMainnet(conn)) {
    return NextResponse.json(
      { funded: false, reason: "faucet is disabled on mainnet" },
      { status: 503 }
    );
  }

  try {
    const balance = await conn.getBalance(to);
    if (balance >= MIN) {
      return NextResponse.json({ funded: false, reason: "sufficient balance" });
    }

    // Circuit breaker: never let the faucet drain past its reserve. Accounts for
    // drips already in flight, so N concurrent requests reading the same balance
    // cannot each pass and undershoot the floor together.
    const funderBalance = await conn.getBalance(funder.publicKey);
    if (funderBalance - FUND * (inFlight + 1) < RESERVE_FLOOR) {
      return NextResponse.json(
        { funded: false, reason: "faucet reserve low, ask the team to top it up" },
        { status: 503 }
      );
    }

    inFlight += 1;
    try {
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: funder.publicKey,
          toPubkey: to,
          lamports: FUND,
        })
      );
      const sig = await conn.sendTransaction(tx, [funder]);
      await conn.confirmTransaction(sig, "confirmed");

      // Record only successful drips against the limits.
      hits.push(now);
      ipHits.set(ip, hits);
      globalHits.push(now);

      return NextResponse.json({ funded: true, sig });
    } finally {
      inFlight -= 1;
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Faucet failed" },
      { status: 500 }
    );
  }
}
