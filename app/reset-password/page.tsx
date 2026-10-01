"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import ResetPasswordCard from "@/components/Auth/ResetPasswordCard";
import Loading from "@/components/Loading";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  return <ResetPasswordCard token={token} />;
}

export default function Page() {
  return (
    <AuthLayout>
      <Suspense fallback={<Loading />}>
        <ResetPasswordContent />
      </Suspense>
    </AuthLayout>
  );
}
