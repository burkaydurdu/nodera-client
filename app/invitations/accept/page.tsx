"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { INVITATION_TOKEN_QUERY_PARAM } from "@/core/invitation";
import AuthLayout from "@/components/AuthLayout";
import AcceptInvitationCard from "@/components/Invitations/AcceptInvitationCard";
import Loading from "@/components/Loading";

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  return <AcceptInvitationCard token={searchParams.get(INVITATION_TOKEN_QUERY_PARAM)} />;
}

/** Public in RoutingContext (OPEN_PATHS): the email link must open in every sign-in state. */
export default function Page() {
  return (
    <AuthLayout>
      <Suspense fallback={<Loading />}>
        <AcceptInvitationContent />
      </Suspense>
    </AuthLayout>
  );
}
