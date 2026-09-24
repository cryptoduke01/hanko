"use client";

import { useCluster } from "@/components/ClusterProvider";
import { CLUSTER_LABEL, type Cluster } from "@/lib/solana/config";

const OPTIONS: Cluster[] = ["devnet", "mainnet-beta"];

/** Network dropdown. Mainnet is preview-only until the program is deployed there
 *  (a banner explains this app-wide). */
export function ClusterSelect() {
  const { cluster, setCluster } = useCluster();
  return (
    <div className="relative">
      <select
        value={cluster}
        onChange={(e) => setCluster(e.target.value as Cluster)}
        aria-label="Network"
        className="cursor-pointer appearance-none rounded-lg border border-rule bg-paper py-1.5 pl-3 pr-8 text-[12px] font-medium tracking-[0.01em] text-ink transition-colors duration-200 hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
      >
        {OPTIONS.map((c) => (
          <option key={c} value={c}>
            {CLUSTER_LABEL[c]}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-mute"
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}
