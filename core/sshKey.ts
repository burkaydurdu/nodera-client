export interface SSHKey {
  id: string;
  teamId: string;
  name: string;
  publicKey: string;
  /** `SHA256:<base64>` as ssh-keygen prints it. */
  fingerprint: string;
  createdAt: string;
}

export interface CreateSSHKeyPayload {
  name: string;
  publicKey: string;
}

export const SSH_KEY_NAME_MIN_LENGTH = 1;
export const SSH_KEY_NAME_MAX_LENGTH = 64;

/** Key types the customer service accepts (ssh-rsa must be at least 2048 bits, checked server-side). */
export const SSH_KEY_TYPES = ["ssh-ed25519", "ssh-rsa"] as const;

export type PublicKeyIssue = "required" | "type";

/** Client-side sanity check of an OpenSSH authorized_keys line; the service does the real parsing. */
export function validatePublicKey(value: string): PublicKeyIssue | null {
  const trimmed = value.trim();
  if (!trimmed) return "required";
  const type = trimmed.split(/\s+/)[0];
  return (SSH_KEY_TYPES as readonly string[]).includes(type) ? null : "type";
}
