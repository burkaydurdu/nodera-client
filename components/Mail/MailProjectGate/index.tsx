"use client";

import { useTranslations } from "next-intl";
import { MAIL_LANDING_PATH } from "@/core/mail";
import { MailProjectProvider } from "@/contexts/MailProjectContext/MailProjectContext";
import useTeam from "@/contexts/TeamContext/useTeam";
import { useCan } from "@/hooks/Authz/useCan";
import { useProjectInTeam } from "@/hooks/Project/useProjectInTeam";
import Loading from "@/components/Loading";
import MailAccessDenied from "@/components/Mail/MailAccessDenied";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import PageHeader from "@/components/PageHeader";
import type { MailProjectGateProps } from "./type";

/**
 * What every Mail page stands behind: a Role holding `mail.read` and a Project of the selected
 * Team. A foreign Project (a Team switch, another Team's link) goes back to the Mail landing,
 * which opens the new Team's Project instead.
 */
export default function MailProjectGate({ projectId, children }: MailProjectGateProps) {
  const t = useTranslations("mail.gate");
  const canRead = useCan("mail.read");
  const { isLoading: teamsLoading } = useTeam();
  const { project, missing, error, retry } = useProjectInTeam(projectId, MAIL_LANDING_PATH);

  if (teamsLoading) return <Loading />;
  if (!canRead) return <MailAccessDenied />;
  if (error) {
    return (
      <>
        <PageHeader title={t("title")} />
        <div className="flex flex-col items-start gap-3">
          <NoderaAlert variant="error" message={error} className="w-full" />
          <NoderaButton variant="outlined" onClick={retry}>
            {t("retry")}
          </NoderaButton>
        </div>
      </>
    );
  }
  if (missing || !project || project.id !== projectId) return <Loading />;

  return <MailProjectProvider project={project}>{children}</MailProjectProvider>;
}
