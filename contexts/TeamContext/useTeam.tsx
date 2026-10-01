import { useContext } from "react";
import TeamContext from "./TeamContext";

const useTeam = () => useContext(TeamContext);

export default useTeam;
