export interface KubernetesNameFieldProps {
  label: string;
  placeholder: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  /** The longest name the service takes: 63 for a Cluster, 32 for a Node pool. */
  maxLength: number;
  /** A refusal the service answered for this name (taken); shown until the name changes. */
  serverError?: string | null;
  disabled?: boolean;
  /** Show the rule violation even before the user typed (after a failed submit). */
  touched?: boolean;
  autoFocus?: boolean;
  onEnter?: () => void;
}
