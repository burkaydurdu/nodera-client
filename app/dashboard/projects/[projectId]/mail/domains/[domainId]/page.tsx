"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { App } from "antd";
import { DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { DeleteSendingDomain, GetSendingDomain, VerifySendingDomain } from "@/api/mail";
import { ErrorCode } from "@/core/error";
import { type SendingDomain, isDmarcMissing, mailPath } from "@/core/mail";
import useMailProject from "@/contexts/MailProjectContext/useMailProject";
import { useCan } from "@/hooks/Authz/useCan";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { useLatestRead } from "@/hooks/Loading/useLatestRead";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import { useRealtimeMessage } from "@/hooks/Realtime/useRealtimeMessage";
import { useResync } from "@/hooks/Realtime/useResync";
import { IsErrorCode } from "@/utils/error";
import Card from "@/components/Card";
import EmptyBox from "@/components/EmptyBox";
import Loading from "@/components/Loading";
import DmarcMissingAlert from "@/components/Mail/DmarcMissingAlert";
import DnsRecordTable from "@/components/Mail/DnsRecordTable";
import SendingDomainOverview from "@/components/Mail/SendingDomainOverview";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  const { domainId } = useParams<{ domainId: string }>();
  const { project } = useMailProject();
  const t = useTranslations("mail.domains");
  const td = useTranslations("mail.domains.detail");
  const { message, modal } = App.useApp();
  const { navigate } = useNavigate();
  const { getErrorMessage } = useErrorMessage();
  const canWrite = useCan("mail.write");
  const [verifying, setVerifying] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const domainRead = useLatestRead<SendingDomain | null>(
    async () => (await GetSendingDomain(project.id, domainId)).data,
    `${project.id}:${domainId}`,
    null
  );
  const domain = domainRead.data;

  const domainsPath = mailPath(project.id, "domains");

  // The status changes on screen the moment the service verifies or loses the domain.
  useRealtimeMessage("mail.domain_changed", (change) => {
    if (change.sendingDomainId === domainId) domainRead.refresh();
  });
  useResync(domainRead.refresh);

  const verifyNow = async () => {
    setVerifying(true);
    try {
      const response = await VerifySendingDomain(project.id, domainId);
      domainRead.setData(response.data);
      if (response.data.status === "verified") message.success(td("verified"));
      else message.warning(td("stillMissing"));
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setVerifying(false);
    }
  };

  const confirmDelete = () => {
    if (!domain) return;
    modal.confirm({
      title: td("deleteTitle", { name: domain.name }),
      content: td("deleteConfirm"),
      okText: td("delete"),
      okButtonProps: { danger: true },
      cancelText: td("cancel"),
      centered: true,
      onOk: async () => {
        setDeleting(true);
        try {
          await DeleteSendingDomain(project.id, domainId);
          message.success(td("deleted", { name: domain.name }));
          navigate(domainsPath, { replace: true });
        } catch (err) {
          message.error(getErrorMessage(err));
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  const breadcrumb = [
    { label: t("breadcrumbMail"), href: mailPath(project.id) },
    { label: t("title"), href: domainsPath },
    { label: domain?.name ?? td("title") },
  ];

  if (domainRead.isLoading) {
    return (
      <>
        <PageHeader title={td("title")} breadcrumb={breadcrumb} />
        <Loading />
      </>
    );
  }

  if (IsErrorCode(domainRead.error, ErrorCode.SendingDomainNotFound)) {
    return (
      <>
        <PageHeader title={td("title")} breadcrumb={breadcrumb} />
        <Card className="mx-auto w-full max-w-xl">
          <EmptyBox
            title={td("notFoundTitle")}
            description={td("notFoundDescription")}
            actionLabel={td("backToDomains")}
            onAction={() => navigate(domainsPath)}
          />
        </Card>
      </>
    );
  }

  if (domainRead.error || !domain) {
    return (
      <>
        <PageHeader title={td("title")} breadcrumb={breadcrumb} />
        <div className="flex flex-col items-start gap-3">
          <NoderaAlert
            variant="error"
            message={
              domainRead.error ? getErrorMessage(domainRead.error) : td("notFoundTitle")
            }
            className="w-full"
          />
          <NoderaButton variant="outlined" onClick={domainRead.reload}>
            {t("retry")}
          </NoderaButton>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={domain.name}
        description={td("description")}
        breadcrumb={breadcrumb}
        extra={
          canWrite ? (
            <>
              <NoderaButton
                variant="outlined"
                icon={<ReloadOutlined />}
                loading={verifying}
                disabled={deleting}
                onClick={verifyNow}
              >
                {td("verifyNow")}
              </NoderaButton>
              <NoderaButton
                variant="text"
                icon={<DeleteOutlined />}
                loading={deleting}
                disabled={verifying}
                onClick={confirmDelete}
                className="text-danger!"
              >
                {td("delete")}
              </NoderaButton>
            </>
          ) : undefined
        }
      />
      <SendingDomainOverview domain={domain} />
      {isDmarcMissing(domain) && <DmarcMissingAlert domainName={domain.name} />}
      <Card title={td("recordsTitle")} description={td("recordsDescription")} flush>
        <DnsRecordTable records={domain.records ?? []} />
        <p className="px-6 py-4 text-xs leading-4 text-text-muted">
          {td("recordsHint", { domain: domain.name })}
        </p>
      </Card>
    </>
  );
}
