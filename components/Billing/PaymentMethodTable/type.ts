import type { PaymentMethod } from "@/core/billing";
import type { PaymentMethodHandler } from "../type";

export interface PaymentMethodTableProps {
  methods: PaymentMethod[];
  loading?: boolean;
  /** Id of the card whose default change or delete is in flight. */
  busyId?: string | null;
  /** Both absent when the Role lacks `billing.write`: the actions column is not rendered. */
  onSetDefault?: PaymentMethodHandler;
  onDelete?: PaymentMethodHandler;
}
