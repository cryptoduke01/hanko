"use client";

import { useCluster } from "@/components/ClusterProvider";
import { CLUSTER_LABEL } from "@/lib/solana/config";

/** Thin app-wide notice when the selected cluster has no Hanko program yet
 *  (mainnet is preview-only for now), so an empty UI does not read as broken. */
export function ClusterBanner() {
  const { cluster, programLive, setCluster } = useCluster();
  if (programLive) return null;
  return (
    <div className="border-b border-rule bg-haze/60 px-4 py-2 text-center text-[12px] text-mute">
      <span className="text-ink">{CLUSTER_LABEL[cluster]} preview.</span> The Hanko
      program is not deployed here yet.{" "}
      <button
        type="button"
        onClick={() => setCluster("devnet")}
        className="font-medium text-ink underline decoration-rule underline-offset-2 transition-opacity hover:opacity-70"
      >
        Switch to Devnet
      </button>{" "}
      to use it.
    </div>
  );
}
