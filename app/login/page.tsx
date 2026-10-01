"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { INVITATION_QUERY_PARAM } from "@/core/invitation";
import AuthLayout from "@/components/AuthLayout";
import LoginCard from "@/components/Auth/LoginCard";
import Loading from "@/components/Loading";

function LoginContent() {
  const searchParams = useSearchParams();
  return <LoginCard invitationToken={searchParams.get(INVITATION_QUERY_PARAM)} />;
}

export default function Page() {
  return (
    <AuthLayout>
      <Suspense fallback={<Loading />}>
        <LoginContent />
      </Suspense>
    </AuthLayout>
  );
}
