import type { SendingDomainStatus } from "@/core/mail";

export interface SendingDomainStatusBadgeProps {
  status: SendingDomainStatus;
  className?: string;
}
