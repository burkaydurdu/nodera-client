import type { ReactNode } from "react";

export interface NoderaSelectOption<V extends string = string> {
  value: V;
  label: string;
}

export interface NoderaSelectProps<V extends string = string> {
  label: string;
  value: V | undefined;
  onChange: (value: V) => void;
  options: NoderaSelectOption<V>[];
  placeholder?: string;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  /** Type-ahead filtering on the option label (on by default for long lists). */
  searchable?: boolean;
  className?: string;
}
