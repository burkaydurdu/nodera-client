/**
 * Mirror of the backend matrix (`pkg/authz`). The server stays the authority: the client
 * only hides what a Role cannot do, it never grants anything.
 */
export const ROLES = ["owner", "developer", "finance"] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  "team.read",
  "team.manage",
  "project.write",
  "droplet.read",
  "droplet.write",
  "sshkey.write",
  "billing.read",
  "billing.write",
  "mail.read",
  "mail.write",
  "mail.send",
  "apikey.write",
  "storage.read",
  "storage.write",
  "kubernetes.read",
  "kubernetes.write",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const MATRIX: Record<Role, readonly Permission[]> = {
  owner: PERMISSIONS,
  developer: [
    "team.read",
    "project.write",
    "droplet.read",
    "droplet.write",
    "sshkey.write",
    "mail.read",
    "mail.write",
    "mail.send",
    "apikey.write",
    "storage.read",
    "storage.write",
    "kubernetes.read",
    "kubernetes.write",
  ],
  finance: [
    "team.read",
    "droplet.read",
    "billing.read",
    "billing.write",
    "mail.read",
    "storage.read",
    "kubernetes.read",
  ],
};

/** The Permissions an API key may carry (`authz.KeyPermissions`); never wider than its creator's. */
export const KEY_PERMISSIONS = ["mail.send"] as const satisfies readonly Permission[];
export type KeyPermission = (typeof KEY_PERMISSIONS)[number];

export function isRole(value: string | null | undefined): value is Role {
  return !!value && (ROLES as readonly string[]).includes(value);
}

export function isKeyPermission(value: string | null | undefined): value is KeyPermission {
  return !!value && (KEY_PERMISSIONS as readonly string[]).includes(value);
}

export function allows(role: Role | null | undefined, permission: Permission): boolean {
  if (!role || !isRole(role)) return false;
  return MATRIX[role].includes(permission);
}
