import { useContext } from "react";
import StorageContext from "./StorageContext";

/** The Storage on screen; only pages under a Storage's shell, which provides it, may ask. */
const useStorage = () => {
  const value = useContext(StorageContext);
  if (!value) throw new Error("useStorage must be used under a Storage's layout");
  return value;
};

export default useStorage;
