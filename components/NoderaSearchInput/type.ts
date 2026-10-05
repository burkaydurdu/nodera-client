export interface NoderaSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Runs on Enter, the search button, and clearing the field. */
  onSearch: (value: string) => void;
  placeholder?: string;
  /** Accessible name; the placeholder alone is not one. */
  label: string;
  loading?: boolean;
  className?: string;
}
