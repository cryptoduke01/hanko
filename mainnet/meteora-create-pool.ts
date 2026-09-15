/**
 * Create a Meteora DAMM v2 pool on MAINNET for one Hanko tranche token paired
 * with its underlying, and open the first liquidity position.
 *
 * REAL FUNDS. You run this from your own wallet, which must already hold both
 * tokens. Nothing here is called by the web app.
 *
 *   MINT_A      tranche mint (Shield/Core/Edge) or any base token
 *   MINT_B      the underlying real xStock mint (the quote)
 *   AMOUNT_A    whole tokens of MINT_A to deposit
 *   AMOUNT_B    whole tokens of MINT_B to deposit
 *   INIT_PRICE  opening price: how many B for 1 A
 *   DAMM_CONFIG (optional) a specific DAMM v2 config pubkey; defaults to the
 *               first permissionless static config
 *   KEYPAIR     path to your wallet keypair json (holds both tokens)
 *   RPC_URL     paid mainnet RPC
 *
 * Run:  MINT_A=.. MINT_B=.. AMOUNT_A=.. AMOUNT_B=.. INIT_PRICE=.. \
 *       KEYPAIR=~/wallet.json RPC_URL=https://<helius-mainnet> npm run meteora:pool
 *
 * SDK reference verified against MeteoraAg/damm-v2-sdk (createPool, docs.md).
 */
import {
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import {
  CpAmm,
  getSqrtPriceFromPrice,
  derivePoolAddress,
  derivePositionAddress,
} from "@meteora-ag/cp-amm-sdk";
import { getMint, type Mint, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import {
  confirmOrExit,
  connection,
  env,
  loadKeypair,
  mintMeta,
  requireMainnet,
} from "./shared";

async function main() {
  const conn = connection();
  await requireMainnet(conn);
  const wallet = loadKeypair();
  const cpAmm = new CpAmm(conn);

  const mintA = new PublicKey(env("MINT_A"));
  const mintB = new PublicKey(env("MINT_B"));
  const a = await mintMeta(conn, mintA);
  const b = await mintMeta(conn, mintB);

  let config: PublicKey;
  if (process.env.DAMM_CONFIG) {
    config = new PublicKey(process.env.DAMM_CONFIG);
  } else {
    const statics = await cpAmm.getStaticConfigs();
    if (!statics?.length)
      throw new Error("No permissionless DAMM v2 configs found; pass DAMM_CONFIG");
    config = statics[0].publicKey; // first permissionless config
  }
  const configState = await cpAmm.fetchConfigState(config);

  const tokenAAmount = new BN(env("AMOUNT_A")).mul(new BN(10).pow(new BN(a.decimals)));
  const tokenBAmount = new BN(env("AMOUNT_B")).mul(new BN(10).pow(new BN(b.decimals)));

  // Token-2022 transfer-fee context (undefined for classic SPL mints).
  let tokenAInfo: { mint: Mint; currentEpoch: number } | undefined;
  if (a.programId.equals(TOKEN_2022_PROGRAM_ID)) {
    const mint = await getMint(conn, mintA, "confirmed", a.programId);
    tokenAInfo = { mint, currentEpoch: (await conn.getEpochInfo()).epoch };
  }

  const initSqrtPrice = getSqrtPriceFromPrice(
    env("INIT_PRICE"),
    a.decimals,
    b.decimals
  );
  const liquidityDelta = cpAmm.getLiquidityDelta({
    maxAmountTokenA: tokenAAmount,
    maxAmountTokenB: tokenBAmount,
    sqrtPrice: initSqrtPrice,
    sqrtMinPrice: configState.sqrtMinPrice,
    sqrtMaxPrice: configState.sqrtMaxPrice,
    tokenAInfo,
    collectFeeMode: configState.collectFeeMode,
  });

  const positionNft = Keypair.generate(); // must co-sign
  const price = Number(env("INIT_PRICE"));
  confirmOrExit("Meteora DAMM v2 pool  (MAINNET, real funds):", [
    `wallet    ${wallet.publicKey.toBase58()}`,
    `mint A    ${mintA.toBase58()}  (${a.decimals} dp)  deposit ${env("AMOUNT_A")}`,
    `mint B    ${mintB.toBase58()}  (${b.decimals} dp)  deposit ${env("AMOUNT_B")}`,
    `price     1 A = ${price} B   |   1 B = ${(1 / price).toPrecision(6)} A`,
    `config    ${config.toBase58()}`,
    `pool      ${derivePoolAddress(config, mintA, mintB).toBase58()}`,
  ]);

  const tx = await cpAmm.createPool({
    payer: wallet.publicKey,
    creator: wallet.publicKey,
    config,
    positionNft: positionNft.publicKey,
    tokenAMint: mintA,
    tokenBMint: mintB,
    tokenAAmount,
    tokenBAmount,
    initSqrtPrice,
    liquidityDelta,
    activationPoint: null, // immediate
    tokenAProgram: a.programId,
    tokenBProgram: b.programId,
  });

  const signature = await sendAndConfirmTransaction(conn, tx, [wallet, positionNft], {
    commitment: "confirmed",
  });

  console.log("pool created", {
    pool: derivePoolAddress(config, mintA, mintB).toString(),
    position: derivePositionAddress(positionNft.publicKey).toString(),
    positionNft: positionNft.publicKey.toString(),
    signature,
  });
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
