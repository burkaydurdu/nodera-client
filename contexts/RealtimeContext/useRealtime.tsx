import { useContext } from "react";
import RealtimeContext from "./RealtimeContext";

const useRealtime = () => useContext(RealtimeContext);

export default useRealtime;
