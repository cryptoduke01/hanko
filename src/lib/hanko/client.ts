import { AnchorProvider, BN, Program, type Idl } from "@coral-xyz/anchor";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMint2Instruction,
  createMintToInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";
import idlJson from "@/idl/hanko_vault.json";
import { PROGRAM_ID } from "@/lib/solana/config";

export const DECIMALS = 6;
export const ONE = 10 ** DECIMALS; // one whole share in base units

/** Minimal wallet shape (matches wallet-adapter's AnchorWallet). */
export interface WalletLike {
  publicKey: PublicKey;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signTransaction: (tx: any) => Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signAllTransactions: (txs: any[]) => Promise<any[]>;
}

const seed = (s: string) => new TextEncoder().encode(s);

export function getProgram(connection: Connection, wallet: WalletLike): Program {
  const provider = new AnchorProvider(connection, wallet as never, {
    commitment: "confirmed",
  });
  return new Program(idlJson as Idl, provider);
}

export function pdas(underlyingMint: PublicKey) {
  const [vault] = PublicKey.findProgramAddressSync(
    [seed("vault"), underlyingMint.toBuffer()],
    PROGRAM_ID
  );
  const [shieldMint] = PublicKey.findProgramAddressSync(
    [seed("shield"), vault.toBuffer()],
    PROGRAM_ID
  );
  const [coreMint] = PublicKey.findProgramAddressSync(
    [seed("core"), vault.toBuffer()],
    PROGRAM_ID
  );
  const [edgeMint] = PublicKey.findProgramAddressSync(
    [seed("edge"), vault.toBuffer()],
    PROGRAM_ID
  );
  return { vault, shieldMint, coreMint, edgeMint };
}

const ata = (mint: PublicKey, owner: PublicKey, offCurve = false) =>
  getAssociatedTokenAddressSync(mint, owner, offCurve);

/** A constant-product pool is seeded by [POOL_SEED, mint_a, mint_b]; its
 *  reserves live in two PDA-owned token accounts. We always order a market as
 *  (mint_a = tranche, mint_b = underlying). */
export function poolPdas(mintA: PublicKey, mintB: PublicKey) {
  const [pool] = PublicKey.findProgramAddressSync(
    [seed("pool"), mintA.toBuffer(), mintB.toBuffer()],
    PROGRAM_ID
  );
  return { pool, vaultA: ata(mintA, pool, true), vaultB: ata(mintB, pool, true) };
}

/* ————————————————————— writes ————————————————————— */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function initializeVault(
  program: Program,
  owner: PublicKey,
  underlyingMint: PublicKey,
  floorPrice: number,
  capPrice: number,
  maturityTs: number
): Promise<string> {
  const { vault, shieldMint, coreMint, edgeMint } = pdas(underlyingMint);
  return program.methods
    .initializeVault(new BN(floorPrice), new BN(capPrice), new BN(maturityTs))
    .accountsStrict({
      authority: owner,
      underlyingMint,
      vault,
      shieldMint,
      coreMint,
      edgeMint,
      vaultUnderlying: ata(underlyingMint, vault, true),
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}

export function deposit(
  program: Program,
  owner: PublicKey,
  underlyingMint: PublicKey,
  amount: number
): Promise<string> {
  const { vault, shieldMint, coreMint, edgeMint } = pdas(underlyingMint);
  return program.methods
    .deposit(new BN(amount))
    .accountsStrict({
      user: owner,
      vault,
      underlyingMint,
      shieldMint,
      coreMint,
      edgeMint,
      vaultUnderlying: ata(underlyingMint, vault, true),
      userUnderlying: ata(underlyingMint, owner),
      userShield: ata(shieldMint, owner),
      userCore: ata(coreMint, owner),
      userEdge: ata(edgeMint, owner),
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}

export function recombine(
  program: Program,
  owner: PublicKey,
  underlyingMint: PublicKey,
  amount: number
): Promise<string> {
  const { vault, shieldMint, coreMint, edgeMint } = pdas(underlyingMint);
  return program.methods
    .recombine(new BN(amount))
    .accountsStrict({
      user: owner,
      vault,
      underlyingMint,
      shieldMint,
      coreMint,
      edgeMint,
      vaultUnderlying: ata(underlyingMint, vault, true),
      userUnderlying: ata(underlyingMint, owner),
      userShield: ata(shieldMint, owner),
      userCore: ata(coreMint, owner),
      userEdge: ata(edgeMint, owner),
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
}

/** Open a market for one tranche by seeding a pool with `trancheAmount` of the
 *  tranche and `underlyingAmount` of the underlying. Protocol-owned liquidity. */
export function initPool(
  program: Program,
  owner: PublicKey,
  trancheMint: PublicKey,
  underlyingMint: PublicKey,
  trancheAmount: number,
  underlyingAmount: number
): Promise<string> {
  const { pool, vaultA, vaultB } = poolPdas(trancheMint, underlyingMint);
  return program.methods
    .initPool(new BN(trancheAmount), new BN(underlyingAmount))
    .accountsStrict({
      initializer: owner,
      mintA: trancheMint,
      mintB: underlyingMint,
      pool,
      vaultA,
      vaultB,
      initializerA: ata(trancheMint, owner),
      initializerB: ata(underlyingMint, owner),
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}

/** Trade one tranche on its pool. `buy` pays underlying for the tranche; `sell`
 *  pays the tranche for underlying. `minOut` guards against slippage. */
export function swap(
  program: Program,
  owner: PublicKey,
  trancheMint: PublicKey,
  underlyingMint: PublicKey,
  amountIn: number,
  side: "buy" | "sell",
  minOut: number
): Promise<string> {
  const { pool, vaultA, vaultB } = poolPdas(trancheMint, underlyingMint);
  // mint_a = tranche, mint_b = underlying. Selling the tranche is a→b.
  const aToB = side === "sell";
  return program.methods
    .swap(new BN(amountIn), aToB, new BN(minOut))
    .accountsStrict({
      trader: owner,
      mintA: trancheMint,
      mintB: underlyingMint,
      pool,
      vaultA,
      vaultB,
      traderA: ata(trancheMint, owner),
      traderB: ata(underlyingMint, owner),
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
}

/** Constant-product output with the pool's 0.30% fee. Mirrors the on-chain
 *  u128 integer math exactly, so a quote equals the executed amount. */
export function quoteOut(
  amountIn: number,
  reserveIn: number,
  reserveOut: number
): number {
  if (amountIn <= 0 || reserveIn <= 0 || reserveOut <= 0) return 0;
  const inAfterFee = (BigInt(Math.floor(amountIn)) * BigInt(997)) / BigInt(1000);
  const out =
    (BigInt(Math.floor(reserveOut)) * inAfterFee) /
    (BigInt(Math.floor(reserveIn)) + inAfterFee);
  return Number(out);
}

export interface PoolReserves {
  exists: boolean;
  tranche: number; // reserve of the tranche token (base units)
  underlying: number; // reserve of the underlying (base units)
}

/** Read a tranche's pool reserves straight from its vaults. */
export async function fetchPool(
  connection: Connection,
  trancheMint: PublicKey,
  underlyingMint: PublicKey
): Promise<PoolReserves> {
  const { vaultA, vaultB } = poolPdas(trancheMint, underlyingMint);
  try {
    const [a, b] = await Promise.all([
      getAccount(connection, vaultA),
      getAccount(connection, vaultB),
    ]);
    return { exists: true, tranche: Number(a.amount), underlying: Number(b.amount) };
  } catch {
    return { exists: false, tranche: 0, underlying: 0 };
  }
}

/** Create a mock underlying "share" mint and mint `uiAmount` to the wallet. */
export async function createDemoShares(
  program: Program,
  connection: Connection,
  owner: PublicKey,
  uiAmount = 100
): Promise<PublicKey> {
  const mint = Keypair.generate();
  const lamports = await getMinimumBalanceForRentExemptMint(connection);
  const userAta = ata(mint.publicKey, owner);
  const tx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: owner,
      newAccountPubkey: mint.publicKey,
      space: MINT_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMint2Instruction(mint.publicKey, DECIMALS, owner, null),
    createAssociatedTokenAccountInstruction(owner, userAta, owner, mint.publicKey),
    createMintToInstruction(mint.publicKey, userAta, owner, uiAmount * ONE)
  );
  await (program.provider as AnchorProvider).sendAndConfirm(tx, [mint]);
  return mint.publicKey;
}

/* ————————————————————— reads ————————————————————— */

export interface VaultState {
  settled: boolean;
  settlementPrice: number;
  floorPrice: number;
  capPrice: number;
  maturityTs: number;
}

export async function fetchVault(
  program: Program,
  underlyingMint: PublicKey
): Promise<VaultState | null> {
  const { vault } = pdas(underlyingMint);
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v: any = await (program.account as any).vault.fetch(vault);
    return {
      settled: v.settled,
      settlementPrice: v.settlementPrice.toNumber(),
      floorPrice: v.floorPrice.toNumber(),
      capPrice: v.capPrice.toNumber(),
      maturityTs: v.maturityTs.toNumber(),
    };
  } catch {
    return null;
  }
}

export async function tokenBalance(
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey,
  offCurve = false
): Promise<number> {
  try {
    const acc = await getAccount(connection, ata(mint, owner, offCurve));
    return Number(acc.amount);
  } catch {
    return 0;
  }
}

export interface Balances {
  underlying: number;
  shield: number;
  core: number;
  edge: number;
}

export async function fetchBalances(
  connection: Connection,
  owner: PublicKey,
  underlyingMint: PublicKey
): Promise<Balances> {
  const { shieldMint, coreMint, edgeMint } = pdas(underlyingMint);
  const [underlying, shield, core, edge] = await Promise.all([
    tokenBalance(connection, underlyingMint, owner),
    tokenBalance(connection, shieldMint, owner),
    tokenBalance(connection, coreMint, owner),
    tokenBalance(connection, edgeMint, owner),
  ]);
  return { underlying, shield, core, edge };
}

/** The wallet's native SOL balance, in whole SOL. */
export async function solBalance(
  connection: Connection,
  owner: PublicKey
): Promise<number> {
  try {
    return (await connection.getBalance(owner)) / 1e9;
  } catch {
    return 0;
  }
}

export interface ActivityItem {
  signature: string;
  blockTime: number | null;
  err: boolean;
}

/** Recent transactions that touch this wallet, newest first. */
export async function recentActivity(
  connection: Connection,
  owner: PublicKey,
  limit = 12
): Promise<ActivityItem[]> {
  try {
    const sigs = await connection.getSignaturesForAddress(owner, { limit });
    return sigs.map((s) => ({
      signature: s.signature,
      blockTime: s.blockTime ?? null,
      err: Boolean(s.err),
    }));
  } catch {
    return [];
  }
}
