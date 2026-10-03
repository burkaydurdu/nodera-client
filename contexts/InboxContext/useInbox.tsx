import { useContext } from "react";
import InboxContext from "./InboxContext";

const useInbox = () => useContext(InboxContext);

export default useInbox;
