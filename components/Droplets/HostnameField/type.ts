export interface HostnameFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Show the rule violation even before the user typed (after a failed submit). */
  touched?: boolean;
}
