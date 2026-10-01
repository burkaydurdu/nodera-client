import { useContext } from "react";
import InvitationContext from "./InvitationContext";

const useInvitations = () => useContext(InvitationContext);

export default useInvitations;
