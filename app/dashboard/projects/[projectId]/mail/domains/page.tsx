"use client";

import { useState } from "react";
import { App } from "antd";
import { GlobalOutlined, PlusOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { ListSendingDomains } from "@/api/mail";
import {
  MAX_SENDING_DOMAINS,
  type SendingDomain,
  mailPath,
  sendingDomainPath,
} from "@/core/mail";
import useMailProject from "@/contexts/MailProjectContext/useMailProject";
import { useCan } from "@/hooks/Authz/useCan";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { useLatestRead } from "@/hooks/Loading/useLatestRead";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import { useRealtimeMessage } from "@/hooks/Realtime/useRealtimeMessage";
import { useResync } from "@/hooks/Realtime/useResync";
import Card from "@/components/Card";
import EmptyBox from "@/components/EmptyBox";
import Loading from "@/components/Loading";
import AddSendingDomainModal from "@/components/Mail/AddSendingDomainModal";
import SendingDomainTable from "@/components/Mail/SendingDomainTable";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  const { project } = useMailProject();
  const t = useTranslations("mail.domains");
  const { message } = App.useApp();
  const { navigate } = useNavigate();
  const { getErrorMessage } = useErrorMessage();
  const canWrite = useCan("mail.write");
  const [modalOpen, setModalOpen] = useState(false);

  const domainsRead = useLatestRead<SendingDomain[]>(
    async () => (await ListSendingDomains(project.id)).data ?? [],
    project.id,
    []
  );
  const domains = domainsRead.data;

  useRealtimeMessage("mail.domain_changed", (change) => {
    if (change.projectId === project.id) domainsRead.refresh();
  });
  useResync(domainsRead.refresh);

  const handleCreated = (domain: SendingDomain) => {
    setModalOpen(false);
    domainsRead.setData((list) => [domain, ...list.filter((item) => item.id !== domain.id)]);
    message.success(t("form.created", { name: domain.name }));
    navigate(sendingDomainPath(project.id, domain.id));
  };

  const atLimit = domains.length >= MAX_SENDING_DOMAINS;

  const header = (
    <PageHeader
      title={t("title")}
      description={t("description", { project: project.name })}
      breadcrumb={[
        { label: t("breadcrumbMail"), href: mailPath(project.id) },
        { label: t("title") },
      ]}
      extra={
        canWrite && domains.length > 0 ? (
          <NoderaButton
            variant="filled"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
            disabled={atLimit}
          >
            {t("add")}
          </NoderaButton>
        ) : undefined
      }
    />
  );

  if (domainsRead.isLoading) {
    return (
      <>
        {header}
        <Loading />
      </>
    );
  }

  if (domainsRead.error) {
    return (
      <>
        {header}
        <div className="flex flex-col items-start gap-3">
          <NoderaAlert
            variant="error"
            message={getErrorMessage(domainsRead.error)}
            className="w-full"
          />
          <NoderaButton variant="outlined" onClick={domainsRead.reload}>
            {t("retry")}
          </NoderaButton>
        </div>
      </>
    );
  }

  return (
    <>
      {header}
      {atLimit && canWrite && (
        <NoderaAlert
          variant="info"
          message={t("limitReached", { max: MAX_SENDING_DOMAINS })}
        />
      )}
      {domains.length === 0 ? (
        <Card className="mx-auto w-full max-w-xl">
          <EmptyBox
            icon={<GlobalOutlined style={{ fontSize: 26 }} />}
            title={t("emptyTitle")}
            description={canWrite ? t("emptyDescription") : t("emptyReadOnly")}
            actionLabel={canWrite ? t("add") : undefined}
            onAction={canWrite ? () => setModalOpen(true) : undefined}
          />
        </Card>
      ) : (
        <Card flush>
          <SendingDomainTable
            domains={domains}
            onOpen={(domain) => navigate(sendingDomainPath(project.id, domain.id))}
          />
        </Card>
      )}
      <AddSendingDomainModal
        open={modalOpen}
        projectId={project.id}
        existingNames={domains.map((domain) => domain.name)}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />
    </>
  );
}
