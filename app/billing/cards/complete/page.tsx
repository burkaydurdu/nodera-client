"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CARD_VERIFICATION_PARAM } from "@/core/billing";
import AuthLayout from "@/components/AuthLayout";
import CardVerificationCompleteCard from "@/components/Billing/CardVerificationCompleteCard";
import Loading from "@/components/Loading";

function CompleteContent() {
  const searchParams = useSearchParams();
  const callback: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    callback[key] = value;
  });

  return (
    <CardVerificationCompleteCard
      verificationId={searchParams.get(CARD_VERIFICATION_PARAM)}
      callback={callback}
    />
  );
}

/** Protected: the provider sends the signed-in browser back here after the hosted card form. */
export default function Page() {
  return (
    <AuthLayout>
      <Suspense fallback={<Loading />}>
        <CompleteContent />
      </Suspense>
    </AuthLayout>
  );
}
