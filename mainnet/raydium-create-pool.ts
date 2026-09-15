/**
 * Create a Raydium CPMM pool on MAINNET for one Hanko tranche token paired with
 * its underlying (e.g. EDGE / TSLAx), and seed it with your opening liquidity.
 *
 * REAL FUNDS. You run this from your own wallet, which must already hold both
 * tokens. Nothing here is called by the web app.
 *
 *   MINT_A   tranche mint (Shield/Core/Edge) or any base token
 *   MINT_B   the underlying real xStock mint (the quote)
 *   AMOUNT_A whole tokens of MINT_A to deposit
 *   AMOUNT_B whole tokens of MINT_B to deposit  (A:B sets the opening price)
 *   KEYPAIR  path to your wallet keypair json (holds both tokens)
 *   RPC_URL  paid mainnet RPC
 *
 * Run:  MINT_A=.. MINT_B=.. AMOUNT_A=.. AMOUNT_B=.. KEYPAIR=~/wallet.json \
 *       RPC_URL=https://<helius-mainnet> npm run raydium:pool
 *
 * SDK reference verified against raydium-io/raydium-sdk-V2-demo (createCpmmPool.ts).
 */
import {
  Raydium,
  TxVersion,
  CREATE_CPMM_POOL_PROGRAM,
  CREATE_CPMM_POOL_FEE_ACC,
} from "@raydium-io/raydium-sdk-v2";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
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
  const owner = loadKeypair();

  const mintAAddr = new PublicKey(env("MINT_A"));
  const mintBAddr = new PublicKey(env("MINT_B"));
  const a = await mintMeta(conn, mintAAddr);
  const b = await mintMeta(conn, mintBAddr);

  const amountA = new BN(env("AMOUNT_A")).mul(new BN(10).pow(new BN(a.decimals)));
  const amountB = new BN(env("AMOUNT_B")).mul(new BN(10).pow(new BN(b.decimals)));

  const raydium = await Raydium.load({
    owner,
    connection: conn,
    cluster: "mainnet",
    disableFeatureCheck: true,
    disableLoadToken: true, // we pass mint info directly, no token-list needed
    blockhashCommitment: "finalized",
  });

  // Tranche tokens are not in Raydium's token list, so describe the mints directly.
  const mintA = {
    address: mintAAddr.toBase58(),
    programId: a.programId.toBase58(),
    decimals: a.decimals,
  };
  const mintB = {
    address: mintBAddr.toBase58(),
    programId: b.programId.toBase58(),
    decimals: b.decimals,
  };

  const feeConfigs = await raydium.api.getCpmmConfigs(); // [0] is the 0.25% tier on mainnet
  if (!feeConfigs?.length) throw new Error("Raydium returned no CPMM fee configs");
  const fee = feeConfigs[0];

  const amtA = Number(env("AMOUNT_A"));
  const amtB = Number(env("AMOUNT_B"));
  confirmOrExit("Raydium CPMM pool  (MAINNET, real funds):", [
    `wallet    ${owner.publicKey.toBase58()}`,
    `mint A    ${mintAAddr.toBase58()}  (${a.decimals} dp)  deposit ${amtA}`,
    `mint B    ${mintBAddr.toBase58()}  (${b.decimals} dp)  deposit ${amtB}`,
    `price     1 A = ${(amtB / amtA).toPrecision(6)} B   |   1 B = ${(amtA / amtB).toPrecision(6)} A`,
    `fee tier  ${fee.tradeFeeRate / 10000}%`,
  ]);

  const { execute, extInfo } = await raydium.cpmm.createPool({
    programId: CREATE_CPMM_POOL_PROGRAM,
    poolFeeAccount: CREATE_CPMM_POOL_FEE_ACC,
    mintA,
    mintB,
    mintAAmount: amountA,
    mintBAmount: amountB,
    startTime: new BN(0), // start immediately
    feeConfig: fee,
    addSupportMintExt: false,
    associatedOnly: false,
    ownerInfo: { useSOLBalance: true },
    txVersion: TxVersion.V0,
  });

  const { txId } = await execute({ sendAndConfirm: true });
  const keys = Object.fromEntries(
    Object.entries(extInfo.address).map(([k, v]) => [k, String(v)])
  );
  console.log("pool created", { txId, poolId: keys.poolId, keys });
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
