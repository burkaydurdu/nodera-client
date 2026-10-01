import type { ReactNode } from "react";

export interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  /** Optional actions rendered on the right of the header. */
  extra?: ReactNode;
  className?: string;
}
