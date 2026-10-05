import type { SendingDomain } from "@/core/mail";

export interface SendingDomainTableProps {
  domains: SendingDomain[];
  onOpen: (domain: SendingDomain) => void;
}
