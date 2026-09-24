import { AnchorProvider, BN, Program, type Idl } from "@coral-xyz/anchor";
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  Transaction,
  TransactionInstruction,
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

/* --------------------- token metadata --------------------- */

/** Metaplex Token Metadata program (same address on every cluster). */
export const METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

/** Off-chain metadata JSON for the demo share (the three tranche URIs are set
 *  on-chain by the program). */
const SHARE_URI = "https://hankolabs.xyz/token/share.json";

/** Metaplex metadata PDA for a mint: ["metadata", program, mint]. */
export function metadataPda(mint: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [seed("metadata"), METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    METADATA_PROGRAM_ID
  );
  return pda;
}

const borshStr = (s: string): Buffer => {
  const body = Buffer.from(s, "utf8");
  const len = Buffer.alloc(4);
  len.writeUInt32LE(body.length, 0);
  return Buffer.concat([len, body]);
};

/** Build a CreateMetadataAccountV3 instruction by hand (no Metaplex SDK, so we
 *  avoid the dependency churn its packages pull in). Only used for mints whose
 *  authority is a plain wallet; PDA-authority tranche mints are named on-chain
 *  by the program instead. */
function createMetadataV3Ix(args: {
  mint: PublicKey;
  mintAuthority: PublicKey;
  payer: PublicKey;
  updateAuthority: PublicKey;
  name: string;
  symbol: string;
  uri: string;
}): TransactionInstruction {
  const data = Buffer.concat([
    Buffer.from([33]), // CreateMetadataAccountV3 discriminator
    borshStr(args.name),
    borshStr(args.symbol),
    borshStr(args.uri),
    Buffer.from([0, 0]), // seller_fee_basis_points u16 = 0
    Buffer.from([0]), // creators: None
    Buffer.from([0]), // collection: None
    Buffer.from([0]), // uses: None
    Buffer.from([1]), // is_mutable = true
    Buffer.from([0]), // collection_details: None
  ]);
  return new TransactionInstruction({
    programId: METADATA_PROGRAM_ID,
    keys: [
      { pubkey: metadataPda(args.mint), isSigner: false, isWritable: true },
      { pubkey: args.mint, isSigner: false, isWritable: false },
      { pubkey: args.mintAuthority, isSigner: true, isWritable: false },
      { pubkey: args.payer, isSigner: true, isWritable: true },
      { pubkey: args.updateAuthority, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ],
    data,
  });
}

/* --------------------- writes --------------------- */

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

/** Withdraw seeded liquidity from a tranche pool back to its authority (the
 *  seeder). Fixes the fund-lock: pool capital is reclaimable, not stuck. */
export function withdrawLiquidity(
  program: Program,
  owner: PublicKey,
  trancheMint: PublicKey,
  underlyingMint: PublicKey,
  trancheAmount: number,
  underlyingAmount: number
): Promise<string> {
  const { pool, vaultA, vaultB } = poolPdas(trancheMint, underlyingMint);
  return program.methods
    .withdrawLiquidity(new BN(trancheAmount), new BN(underlyingAmount))
    .accountsStrict({
      authority: owner,
      mintA: trancheMint,
      mintB: underlyingMint,
      pool,
      vaultA,
      vaultB,
      authorityA: ata(trancheMint, owner),
      authorityB: ata(underlyingMint, owner),
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
  uiAmount = 100,
  symbol?: string
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
  // Name the share so wallets show it (e.g. "Hanko TSLA") instead of a blank.
  if (symbol) {
    const sym = symbol.toUpperCase().slice(0, 6);
    tx.add(
      createMetadataV3Ix({
        mint: mint.publicKey,
        mintAuthority: owner,
        payer: owner,
        updateAuthority: owner,
        name: `Hanko ${sym} Share`,
        symbol: `h${sym}`.slice(0, 10),
        uri: SHARE_URI,
      })
    );
  }
  await (program.provider as AnchorProvider).sendAndConfirm(tx, [mint]);
  return mint.publicKey;
}

/** Name the three tranche mints on-chain (Metaplex, vault PDA signs). Set-once:
 *  calling it again for the same vault fails, so run it right after the vault
 *  is created. Silently a no-op-safe boundary in the UI. */
export function setTrancheMetadata(
  program: Program,
  owner: PublicKey,
  underlyingMint: PublicKey,
  symbol: string
): Promise<string> {
  const { vault, shieldMint, coreMint, edgeMint } = pdas(underlyingMint);
  return program.methods
    .setTrancheMetadata(symbol.toUpperCase().slice(0, 6))
    .accountsStrict({
      authority: owner,
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
    .preInstructions([
      ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }),
    ])
    .rpc();
}

/* --------------------- reads --------------------- */

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

/** Every Hanko share position the wallet currently holds, discovered on-chain from
 *  the owner's token accounts + Metaplex metadata (each share is named "Hanko <SYM> Share").
 *  Lets the portfolio show all refracted stocks, not just the last one in localStorage. */
export async function discoverPositions(
  connection: Connection,
  owner: PublicKey
): Promise<{ mint: PublicKey; sym: string }[]> {
  try {
    // 1. Every SPL token the wallet holds a nonzero balance of. Cheap and allowed
    //    on every RPC (unlike getProgramAccounts on the metadata program).
    const resp = await connection.getParsedTokenAccountsByOwner(owner, {
      programId: TOKEN_PROGRAM_ID,
    });
    const mints: PublicKey[] = [];
    const seen = new Set<string>();
    for (const { account } of resp.value) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const info = (account.data as any)?.parsed?.info;
      const amount = Number(info?.tokenAmount?.amount ?? 0);
      const mintStr: string | undefined = info?.mint;
      if (!mintStr || amount <= 0 || seen.has(mintStr)) continue;
      seen.add(mintStr);
      mints.push(new PublicKey(mintStr));
    }
    if (mints.length === 0) return [];

    // 2. Read each token's Metaplex metadata (batched). A Hanko share is named
    //    "Hanko <SYM> Share"; that name marks a refracted position and its stock.
    const metaPdas = mints.map(metadataPda);
    const data: (Buffer | null)[] = [];
    for (let i = 0; i < metaPdas.length; i += 100) {
      const chunk = await connection.getMultipleAccountsInfo(metaPdas.slice(i, i + 100));
      for (const a of chunk) data.push(a ? a.data : null);
    }

    const out: { mint: PublicKey; sym: string }[] = [];
    mints.forEach((mint, i) => {
      const d = data[i];
      if (!d || d.length < 70) return;
      const nameLen = d.readUInt32LE(65);
      if (nameLen === 0 || nameLen > 64 || 69 + nameLen > d.length) return;
      const name = d
        .subarray(69, 69 + nameLen)
        .toString("utf8")
        .replace(/\0/g, "")
        .trim();
      const m = /^Hanko (.+) Share$/.exec(name);
      if (m) out.push({ mint, sym: m[1].trim() });
    });
    return out;
  } catch {
    return [];
  }
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
  label: string;
}

// Anchor logs "Program log: Instruction: <Name>" for each call; map to a phrase.
const IX_LABEL: Record<string, string> = {
  InitializeVault: "Opened a vault",
  Deposit: "Refracted a share",
  Recombine: "Recombined a share",
  Settle: "Settled a vault",
  Redeem: "Redeemed a tranche",
  InitPool: "Opened a market",
  Swap: "Traded a tranche",
};

function labelFromTx(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: any
): string {
  const logs: string[] = tx?.meta?.logMessages ?? [];
  for (const line of logs) {
    const i = line.indexOf("Instruction: ");
    if (i !== -1) {
      const name = line.slice(i + "Instruction: ".length).trim();
      if (IX_LABEL[name]) return IX_LABEL[name];
    }
  }
  // No program instruction matched, fall back to what the token program did.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const instrs: any[] = tx?.transaction?.message?.instructions ?? [];
  const types = instrs.map((ix) => ix?.parsed?.type).filter(Boolean);
  if (types.some((t) => t === "initializeMint" || t === "initializeMint2"))
    return "Minted shares";
  if (types.some((t) => t === "mintTo" || t === "mintToChecked"))
    return "Minted tokens";
  if (types.some((t) => t === "transfer" || t === "transferChecked"))
    return "Transfer";
  return "Transaction";
}

/** Recent transactions that touch this wallet, newest first, each with a
 *  human-readable label derived from its on-chain instructions. */
export async function recentActivity(
  connection: Connection,
  owner: PublicKey,
  limit = 10
): Promise<ActivityItem[]> {
  try {
    const sigs = await connection.getSignaturesForAddress(owner, { limit });
    const txs = await Promise.all(
      sigs.map((s) =>
        connection
          .getParsedTransaction(s.signature, {
            maxSupportedTransactionVersion: 0,
          })
          .catch(() => null)
      )
    );
    return sigs.map((s, i) => ({
      signature: s.signature,
      blockTime: s.blockTime ?? null,
      err: Boolean(s.err),
      label: s.err ? "Failed transaction" : labelFromTx(txs[i]),
    }));
  } catch {
    return [];
  }
}
