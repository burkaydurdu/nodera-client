import { useContext } from "react";
import KubernetesProjectContext from "./KubernetesProjectContext";

/** The Kubernetes App's Project; only pages under the Kubernetes layout, which provides it, may ask. */
const useKubernetesProject = () => {
  const value = useContext(KubernetesProjectContext);
  if (!value) throw new Error("useKubernetesProject must be used under the Kubernetes layout");
  return value;
};

export default useKubernetesProject;
