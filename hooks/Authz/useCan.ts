"use client";

import { allows, type Permission } from "@/core/authz";
import useTeam from "@/contexts/TeamContext/useTeam";

/**
 * Whether the current Team's Role allows a Permission (matrix in core/authz). Used only to
 * hide controls: the gateway and the services refuse what the Role lacks regardless.
 */
export const useCan = (permission: Permission): boolean => {
  const { currentTeam } = useTeam();
  return allows(currentTeam?.role, permission);
};
