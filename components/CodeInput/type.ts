export interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Number of digits, 6 by default. */
  length?: number;
  disabled?: boolean;
  error?: boolean;
  /** Fires when every digit is filled (paste or last keystroke). */
  onComplete?: (value: string) => void;
  autoFocus?: boolean;
}
