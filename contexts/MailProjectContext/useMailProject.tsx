import { useContext } from "react";
import MailProjectContext from "./MailProjectContext";

/** The Mail App's Project; only pages under the Mail layout, which provides it, may ask. */
const useMailProject = () => {
  const value = useContext(MailProjectContext);
  if (!value) throw new Error("useMailProject must be used under the Mail layout");
  return value;
};

export default useMailProject;
