"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { INVITATION_QUERY_PARAM } from "@/core/invitation";
import AuthLayout from "@/components/AuthLayout";
import RegisterCard from "@/components/Auth/RegisterCard";
import Loading from "@/components/Loading";

function RegisterContent() {
  const searchParams = useSearchParams();
  return <RegisterCard invitationToken={searchParams.get(INVITATION_QUERY_PARAM)} />;
}

export default function Page() {
  return (
    <AuthLayout>
      <Suspense fallback={<Loading />}>
        <RegisterContent />
      </Suspense>
    </AuthLayout>
  );
}
