import type { Image, Region } from "@/core/catalog";
import type { SSHKey } from "@/core/sshKey";
import type { SSHKeyCreatedHandler } from "@/components/SSHKeys/type";
import type { DropletHandler } from "../type";

export interface CreateDropletFormProps {
  projectId: string;
  teamId: string;
  regions: Region[];
  images: Image[];
  /** The Team's keys; the form adds to them through `onKeyCreated`. */
  sshKeys: SSHKey[];
  onKeyCreated: SSHKeyCreatedHandler;
  onCreated: DropletHandler;
  onCancel?: () => void;
}
