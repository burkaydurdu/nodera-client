import type { NodePlan } from "@/core/kubernetesApp";

/** A Node pool as the form holds it before it is sent. */
export interface NodePoolDraft {
  name: string;
  plan: string | undefined;
  count: number;
}

export interface NodePoolFieldErrors {
  name?: string | null;
  plan?: string | null;
  count?: string | null;
}

export interface NodePoolFieldsProps {
  value: NodePoolDraft;
  onChange: (value: NodePoolDraft) => void;
  /** Cheapest first, as the service lists them. */
  plans: NodePlan[];
  errors?: NodePoolFieldErrors;
  touched?: boolean;
  disabled?: boolean;
  onEnter?: () => void;
}
