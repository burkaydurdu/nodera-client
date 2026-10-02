"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  PAYMENT_PARAM,
  PAYMENT_RESULT_PARAM,
  PAYMENT_TOKEN_PARAM,
  isThreeDSResult,
} from "@/core/billing";
import AuthLayout from "@/components/AuthLayout";
import PaymentConfirmationCard from "@/components/Billing/PaymentConfirmationCard";
import Loading from "@/components/Loading";

function ConfirmContent() {
  const searchParams = useSearchParams();
  const result = searchParams.get(PAYMENT_RESULT_PARAM);
  return (
    <PaymentConfirmationCard
      paymentId={searchParams.get(PAYMENT_PARAM)}
      token={searchParams.get(PAYMENT_TOKEN_PARAM)}
      result={isThreeDSResult(result) ? result : null}
    />
  );
}

/**
 * Public in RoutingContext (OPEN_PATHS): the email link and the bank's return must open in
 * every sign-in state.
 */
export default function Page() {
  return (
    <AuthLayout>
      <Suspense fallback={<Loading />}>
        <ConfirmContent />
      </Suspense>
    </AuthLayout>
  );
}
