"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  INVOICE_PARAM,
  INVOICE_PDF_EXPIRES_PARAM,
  INVOICE_PDF_TOKEN_PARAM,
} from "@/core/billing";
import AuthLayout from "@/components/AuthLayout";
import InvoicePdfDownloadCard from "@/components/Billing/InvoicePdfDownloadCard";
import Loading from "@/components/Loading";

function InvoicePdfContent() {
  const searchParams = useSearchParams();
  return (
    <InvoicePdfDownloadCard
      invoiceId={searchParams.get(INVOICE_PARAM)}
      expires={searchParams.get(INVOICE_PDF_EXPIRES_PARAM)}
      token={searchParams.get(INVOICE_PDF_TOKEN_PARAM)}
    />
  );
}

/** Public in RoutingContext (OPEN_PATHS): the email link must open in every sign-in state. */
export default function Page() {
  return (
    <AuthLayout>
      <Suspense fallback={<Loading />}>
        <InvoicePdfContent />
      </Suspense>
    </AuthLayout>
  );
}
