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
