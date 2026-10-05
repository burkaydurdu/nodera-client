import type { RecipientStatus } from "@/core/mail";
import type { NoderaDateRange } from "@/components/NoderaDateRangePicker/type";

export interface MessageFilterValue {
  /** A recipient status, or empty for any. */
  status: RecipientStatus | "";
  recipient: string;
  from: string;
  tag: string;
  range: NoderaDateRange;
}

export interface MessageFiltersProps {
  value: MessageFilterValue;
  onChange: (value: MessageFilterValue) => void;
  /** Applies the filters; Enter in a text field does the same. */
  onSearch: () => void;
  onReset: () => void;
  /** A search is running. */
  loading?: boolean;
}
