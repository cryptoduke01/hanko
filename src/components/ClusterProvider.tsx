"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CLUSTER,
  CLUSTER_ENDPOINTS,
  PROGRAM_LIVE,
  setActiveCluster,
  type Cluster,
} from "@/lib/solana/config";

const STORAGE_KEY = "hanko-cluster";
// Clusters the user can switch between in the UI.
const SWITCHABLE: Cluster[] = ["devnet", "mainnet-beta"];

interface ClusterState {
  cluster: Cluster;
  setCluster: (c: Cluster) => void;
  endpoint: string;
  programLive: boolean;
}

const ClusterContext = createContext<ClusterState | null>(null);

export function ClusterProvider({ children }: { children: React.ReactNode }) {
  const [cluster, setClusterState] = useState<Cluster>(CLUSTER);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Cluster | null;
      if (stored && SWITCHABLE.includes(stored)) {
        setClusterState(stored);
        setActiveCluster(stored);
      }
    } catch {
      /* storage blocked */
    }
  }, []);

  const setCluster = (c: Cluster) => {
    setClusterState(c);
    setActiveCluster(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {
      /* storage blocked */
    }
  };

  const value = useMemo<ClusterState>(
    () => ({
      cluster,
      setCluster,
      endpoint: CLUSTER_ENDPOINTS[cluster],
      programLive: PROGRAM_LIVE[cluster],
    }),
    [cluster]
  );

  return <ClusterContext.Provider value={value}>{children}</ClusterContext.Provider>;
}

export function useCluster(): ClusterState {
  const ctx = useContext(ClusterContext);
  if (!ctx) throw new Error("useCluster must be used within ClusterProvider");
  return ctx;
}
