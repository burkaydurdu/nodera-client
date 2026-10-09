import { useContext } from "react";
import ClusterContext from "./ClusterContext";

/** The Cluster on screen; only pages under a Cluster's shell, which provides it, may ask. */
const useCluster = () => {
  const value = useContext(ClusterContext);
  if (!value) throw new Error("useCluster must be used under a Cluster's layout");
  return value;
};

export default useCluster;
