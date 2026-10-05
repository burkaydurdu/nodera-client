"use client";

import { useState } from "react";
import { App } from "antd";
import { ApiOutlined, PlusOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { DeleteWebhook, ListWebhooks, UpdateWebhook } from "@/api/mail";
import { type CreatedWebhook, MAX_WEBHOOKS, type Webhook, mailPath } from "@/core/mail";
import { withoutSecret } from "@/core/secret";
import useMailProject from "@/contexts/MailProjectContext/useMailProject";
import { useCan } from "@/hooks/Authz/useCan";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { useLatestRead } from "@/hooks/Loading/useLatestRead";
import { useResync } from "@/hooks/Realtime/useResync";
import Card from "@/components/Card";
import EmptyBox from "@/components/EmptyBox";
import Loading from "@/components/Loading";
import WebhookDeliveriesDrawer from "@/components/Mail/WebhookDeliveriesDrawer";
import WebhookFormModal from "@/components/Mail/WebhookFormModal";
import WebhookTable from "@/components/Mail/WebhookTable";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaSecretModal from "@/components/NoderaSecretModal";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  const { project } = useMailProject();
  const t = useTranslations("mail.webhooks");
  const { message, modal } = App.useApp();
  const { getErrorMessage } = useErrorMessage();
  const canWrite = useCan("mail.write");

  const [busyId, setBusyId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Webhook | null>(null);
  const [created, setCreated] = useState<CreatedWebhook | null>(null);
  const [secretOpen, setSecretOpen] = useState(false);
  const [deliveriesOf, setDeliveriesOf] = useState<Webhook | null>(null);

  const webhooksRead = useLatestRead<Webhook[]>(
    async () => (await ListWebhooks(project.id)).data ?? [],
    project.id,
    []
  );
  const webhooks = webhooksRead.data;

  useResync(webhooksRead.refresh);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (webhook: Webhook) => {
    setEditing(webhook);
    setFormOpen(true);
  };

  const handleCreated = (webhook: CreatedWebhook) => {
    setFormOpen(false);
    webhooksRead.setData((list) => [
      ...list.filter((item) => item.id !== webhook.id),
      withoutSecret(webhook, "secret"),
    ]);
    setCreated(webhook);
    setSecretOpen(true);
  };

  const replace = (webhook: Webhook) =>
    webhooksRead.setData((list) =>
      list.map((item) => (item.id === webhook.id ? webhook : item))
    );

  const handleUpdated = (webhook: Webhook) => {
    setFormOpen(false);
    replace(webhook);
    message.success(t("updated"));
  };

  const toggle = async (webhook: Webhook, active: boolean) => {
    setBusyId(webhook.id);
    try {
      const response = await UpdateWebhook(project.id, webhook.id, {
        url: webhook.url,
        events: webhook.events,
        active,
      });
      replace(response.data);
      message.success(active ? t("enabled") : t("disabled"));
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = (webhook: Webhook) => {
    modal.confirm({
      title: t("deleteTitle"),
      content: t("deleteConfirm", { url: webhook.url }),
      okText: t("delete"),
      okButtonProps: { danger: true },
      cancelText: t("cancel"),
      centered: true,
      onOk: async () => {
        setBusyId(webhook.id);
        try {
          await DeleteWebhook(project.id, webhook.id);
          webhooksRead.setData((list) => list.filter((item) => item.id !== webhook.id));
          message.success(t("deleted"));
        } catch (err) {
          message.error(getErrorMessage(err));
        } finally {
          setBusyId(null);
        }
      },
    });
  };

  const atLimit = webhooks.length >= MAX_WEBHOOKS;

  const header = (
    <PageHeader
      title={t("title")}
      description={t("description", { project: project.name, max: MAX_WEBHOOKS })}
      breadcrumb={[
        { label: t("breadcrumbMail"), href: mailPath(project.id) },
        { label: t("title") },
      ]}
      extra={
        canWrite && webhooks.length > 0 ? (
          <NoderaButton
            variant="filled"
            icon={<PlusOutlined />}
            onClick={openCreate}
            disabled={atLimit}
          >
            {t("add")}
          </NoderaButton>
        ) : undefined
      }
    />
  );

  if (webhooksRead.isLoading) {
    return (
      <>
        {header}
        <Loading />
      </>
    );
  }

  if (webhooksRead.error) {
    return (
      <>
        {header}
        <div className="flex flex-col items-start gap-3">
          <NoderaAlert
            variant="error"
            message={getErrorMessage(webhooksRead.error)}
            className="w-full"
          />
          <NoderaButton variant="outlined" onClick={webhooksRead.reload}>
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
        <NoderaAlert variant="info" message={t("limitReached", { max: MAX_WEBHOOKS })} />
      )}
      {webhooks.length === 0 ? (
        <Card className="mx-auto w-full max-w-xl">
          <EmptyBox
            icon={<ApiOutlined style={{ fontSize: 26 }} />}
            title={t("emptyTitle")}
            description={canWrite ? t("emptyDescription") : t("emptyReadOnly")}
            actionLabel={canWrite ? t("add") : undefined}
            onAction={canWrite ? openCreate : undefined}
          />
        </Card>
      ) : (
        <Card flush>
          <WebhookTable
            webhooks={webhooks}
            canWrite={canWrite}
            busyId={busyId}
            onToggle={toggle}
            onEdit={openEdit}
            onDelete={confirmDelete}
            onDeliveries={setDeliveriesOf}
          />
        </Card>
      )}
      <p className="text-xs leading-4 text-text-muted">{t("signatureHint")}</p>
      <WebhookFormModal
        open={formOpen}
        projectId={project.id}
        webhook={editing}
        onClose={() => setFormOpen(false)}
        onCreated={handleCreated}
        onUpdated={handleUpdated}
      />
      <NoderaSecretModal
        open={secretOpen}
        title={t("secret.title")}
        description={t("secret.description")}
        secret={created?.secret ?? ""}
        warning={t("secret.warning")}
        onClose={() => setSecretOpen(false)}
        afterClose={() => setCreated(null)}
      />
      <WebhookDeliveriesDrawer
        projectId={project.id}
        webhook={deliveriesOf}
        onClose={() => setDeliveriesOf(null)}
      />
    </>
  );
}
