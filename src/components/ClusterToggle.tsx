"use client";

import { useCluster } from "@/components/ClusterProvider";
import { CLUSTER_LABEL, type Cluster } from "@/lib/solana/config";

const OPTIONS: Cluster[] = ["devnet", "mainnet-beta"];

/** Segmented Devnet / Mainnet switch. Mainnet is preview-only until the program
 *  is deployed there (a banner explains this app-wide). */
export function ClusterToggle() {
  const { cluster, setCluster } = useCluster();
  return (
    <div className="inline-flex rounded-lg border border-rule p-0.5">
      {OPTIONS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setCluster(c)}
          aria-pressed={cluster === c}
          className={`press rounded-md px-3 py-1 text-[11px] font-medium tracking-[0.01em] transition-colors ${
            cluster === c ? "bg-ink text-paper" : "text-mute hover:text-ink"
          }`}
        >
          {CLUSTER_LABEL[c]}
        </button>
      ))}
    </div>
  );
}
