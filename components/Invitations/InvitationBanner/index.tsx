"use client";

import { useTranslations } from "next-intl";
import NoderaAlert from "@/components/NoderaAlert";
import type { InvitationBannerProps } from "./type";

/** "You were invited to <team> as <role>" above a sign-up or sign-in form. */
export default function InvitationBanner({ invitation, hint }: InvitationBannerProps) {
  const t = useTranslations("invitations.banner");
  const tr = useTranslations("teams.roles");

  return (
    <NoderaAlert
      variant="info"
      message={t("title", { team: invitation.teamName, role: tr(invitation.role) })}
      description={hint}
    />
  );
}
