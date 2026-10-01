"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import VerifyEmailCard from "@/components/Auth/VerifyEmailCard";
import Loading from "@/components/Loading";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const codeJustSent = searchParams.get("sent") === "1";

  return <VerifyEmailCard initialEmail={email} codeJustSent={codeJustSent} />;
}

export default function Page() {
  return (
    <AuthLayout>
      <Suspense fallback={<Loading />}>
        <VerifyEmailContent />
      </Suspense>
    </AuthLayout>
  );
}
