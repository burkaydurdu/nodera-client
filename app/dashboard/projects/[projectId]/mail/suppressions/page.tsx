"use client";

import { useState } from "react";
import { App } from "antd";
import { useTranslations } from "next-intl";
import { DeleteSuppression, ListSuppressions } from "@/api/mail";
import { type ListSuppressionsQuery, type Suppression, mailPath } from "@/core/mail";
import useMailProject from "@/contexts/MailProjectContext/useMailProject";
import { useCan } from "@/hooks/Authz/useCan";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { useCursorList } from "@/hooks/Paging/useCursorList";
import Card from "@/components/Card";
import SuppressionTable from "@/components/Mail/SuppressionTable";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaSearchInput from "@/components/NoderaSearchInput";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  const { project } = useMailProject();
  const t = useTranslations("mail.suppressions");
  const { message, modal } = App.useApp();
  const { getErrorMessage } = useErrorMessage();
  const canWrite = useCan("mail.write");

  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const list = useCursorList(async (cursor) => {
    const query: ListSuppressionsQuery = {};
    if (search) query.search = search;
    if (cursor) query.cursor = cursor;
    return (await ListSuppressions(project.id, query)).data;
  }, `${project.id}:${search}`);

  const confirmDelete = (suppression: Suppression) => {
    modal.confirm({
      title: t("removeTitle", { address: suppression.address }),
      content: t("removeConfirm"),
      okText: t("remove"),
      okButtonProps: { danger: true },
      cancelText: t("cancel"),
      centered: true,
      onOk: async () => {
        setDeletingId(suppression.id);
        try {
          await DeleteSuppression(project.id, suppression.id);
          list.remove((item) => item.id === suppression.id);
          message.success(t("removed", { address: suppression.address }));
        } catch (err) {
          message.error(getErrorMessage(err));
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description", { project: project.name })}
        breadcrumb={[
          { label: t("breadcrumbMail"), href: mailPath(project.id) },
          { label: t("title") },
        ]}
      />
      <NoderaSearchInput
        value={draft}
        onChange={setDraft}
        onSearch={(value) => setSearch(value.trim())}
        placeholder={t("searchPlaceholder")}
        label={t("search")}
        loading={list.isLoading && !!search}
        className="max-w-md"
      />
      {list.error ? (
        <div className="flex flex-col items-start gap-3">
          <NoderaAlert variant="error" message={list.error} className="w-full" />
          <NoderaButton variant="outlined" onClick={() => void list.reload()}>
            {t("retry")}
          </NoderaButton>
        </div>
      ) : (
        <>
          <Card flush>
            <SuppressionTable
              projectId={project.id}
              suppressions={list.items}
              loading={list.isLoading}
              deletingId={deletingId}
              onDelete={canWrite ? confirmDelete : undefined}
            />
          </Card>
          {list.hasMore && (
            <div className="flex justify-center">
              <NoderaButton
                variant="outlined"
                loading={list.isLoadingMore}
                onClick={() => void list.loadMore()}
              >
                {t("loadMore")}
              </NoderaButton>
            </div>
          )}
        </>
      )}
      <p className="text-xs leading-4 text-text-muted">{t("rules")}</p>
    </>
  );
}
