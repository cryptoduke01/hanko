import { PublicKey, clusterApiUrl } from "@solana/web3.js";
import idl from "@/idl/hanko_vault.json";

export type Cluster = "localnet" | "devnet" | "mainnet-beta";

/** Cluster + RPC are env-driven so the same build runs local → devnet → mainnet. */
export const CLUSTER: Cluster =
  (process.env.NEXT_PUBLIC_CLUSTER as Cluster) || "devnet";

export const RPC_URL: string =
  process.env.NEXT_PUBLIC_RPC_URL ||
  (CLUSTER === "localnet"
    ? "http://127.0.0.1:8899"
    : clusterApiUrl(CLUSTER === "mainnet-beta" ? "mainnet-beta" : "devnet"));

export const PROGRAM_ID = new PublicKey(idl.address);

export const CLUSTER_LABEL: Record<Cluster, string> = {
  localnet: "Localnet",
  devnet: "Devnet",
  "mainnet-beta": "Mainnet",
};

/** RPC endpoint per cluster; devnet/mainnet can be overridden by env. */
export const CLUSTER_ENDPOINTS: Record<Cluster, string> = {
  localnet: "http://127.0.0.1:8899",
  devnet: process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl("devnet"),
  "mainnet-beta":
    process.env.NEXT_PUBLIC_RPC_URL_MAINNET || clusterApiUrl("mainnet-beta"),
};

/** Where the Hanko program is actually deployed. Mainnet is not live yet. */
export const PROGRAM_LIVE: Record<Cluster, boolean> = {
  localnet: false,
  devnet: true,
  "mainnet-beta": false,
};

/** The cluster the app is currently pointed at (set by ClusterProvider at runtime). */
let activeCluster: Cluster = CLUSTER;
export function setActiveCluster(c: Cluster): void {
  activeCluster = c;
}
export function getActiveCluster(): Cluster {
  return activeCluster;
}

/** Cluster-aware Solana Explorer link (follows the active cluster). */
export function explorerUrl(kind: "tx" | "address", value: string): string {
  const suffix =
    activeCluster === "localnet"
      ? `?cluster=custom&customUrl=${encodeURIComponent(CLUSTER_ENDPOINTS.localnet)}`
      : activeCluster === "mainnet-beta"
        ? ""
        : `?cluster=devnet`;
  return `https://explorer.solana.com/${kind}/${value}${suffix}`;
}

export function truncate(addr: string, n = 4): string {
  return addr.length <= n * 2 + 1 ? addr : `${addr.slice(0, n)}…${addr.slice(-n)}`;
}
