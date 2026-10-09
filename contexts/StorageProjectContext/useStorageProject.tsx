import { useContext } from "react";
import StorageProjectContext from "./StorageProjectContext";

/** The Storage App's Project; only pages under the Storage layout, which provides it, may ask. */
const useStorageProject = () => {
  const value = useContext(StorageProjectContext);
  if (!value) throw new Error("useStorageProject must be used under the Storage layout");
  return value;
};

export default useStorageProject;
