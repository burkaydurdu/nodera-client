export interface BucketNameFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** A refusal the service answered for this name (taken, reserved); shown until the name changes. */
  serverError?: string | null;
  disabled?: boolean;
  /** Show the rule violation even before the user typed (after a failed submit). */
  touched?: boolean;
  autoFocus?: boolean;
  onEnter?: () => void;
}
