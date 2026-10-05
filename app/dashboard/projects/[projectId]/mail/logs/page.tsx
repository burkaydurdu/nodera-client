"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ListMessages } from "@/api/mail";
import {
  type ListMessagesQuery,
  MAIL_LOG_RETENTION_DAYS,
  MAIL_MESSAGE_PARAM,
  mailPath,
} from "@/core/mail";
import useMailProject from "@/contexts/MailProjectContext/useMailProject";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import { useCursorList } from "@/hooks/Paging/useCursorList";
import Card from "@/components/Card";
import Loading from "@/components/Loading";
import MessageDetailDrawer from "@/components/Mail/MessageDetailDrawer";
import MessageFilters from "@/components/Mail/MessageFilters";
import type { MessageFilterValue } from "@/components/Mail/MessageFilters/type";
import MessageTable from "@/components/Mail/MessageTable";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import PageHeader from "@/components/PageHeader";

const NO_FILTER: MessageFilterValue = {
  status: "",
  recipient: "",
  from: "",
  tag: "",
  range: null,
};

/** The filters as the service reads them; a picked day counts from its first to its last instant. */
function toQuery(filter: MessageFilterValue): ListMessagesQuery {
  const query: ListMessagesQuery = {};
  if (filter.status) query.status = filter.status;
  if (filter.recipient.trim()) query.recipient = filter.recipient.trim();
  if (filter.from.trim()) query.from = filter.from.trim();
  if (filter.tag.trim()) query.tag = filter.tag.trim();
  const [since, until] = filter.range ?? [null, null];
  if (since) query.since = since.startOf("day").toISOString();
  if (until) query.until = until.endOf("day").toISOString();
  return query;
}

function MailLogsContent() {
  const { project } = useMailProject();
  const t = useTranslations("mail.logs");
  const searchParams = useSearchParams();
  const { navigate } = useNavigate();
  const linkedMessageId = searchParams.get(MAIL_MESSAGE_PARAM);

  const [draft, setDraft] = useState<MessageFilterValue>(NO_FILTER);
  const [query, setQuery] = useState<ListMessagesQuery>({});
  const [openId, setOpenId] = useState<string | null>(linkedMessageId);

  // A link to one Message (a Suppression names the one it came from) opens it over the logs.
  useEffect(() => {
    setOpenId(linkedMessageId);
  }, [linkedMessageId]);

  const list = useCursorList(
    async (cursor) =>
      (await ListMessages(project.id, cursor ? { ...query, cursor } : query)).data,
    `${project.id}:${JSON.stringify(query)}`
  );

  const search = () => setQuery(toQuery(draft));

  const reset = () => {
    setDraft(NO_FILTER);
    setQuery({});
  };

  const closeMessage = () => {
    setOpenId(null);
    // The link has done its work; reading the logs again must not reopen the Message.
    if (linkedMessageId) navigate(mailPath(project.id, "logs"), { replace: true });
  };

  const filtered = Object.keys(query).length > 0;

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description", {
          project: project.name,
          days: MAIL_LOG_RETENTION_DAYS,
        })}
        breadcrumb={[
          { label: t("breadcrumbMail"), href: mailPath(project.id) },
          { label: t("title") },
        ]}
      />
      <MessageFilters
        value={draft}
        onChange={setDraft}
        onSearch={search}
        onReset={reset}
        loading={list.isLoading}
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
            <MessageTable
              messages={list.items}
              loading={list.isLoading}
              onOpen={(item) => setOpenId(item.id)}
            />
          </Card>
          {!list.isLoading && list.items.length === 0 && (
            <p className="text-center text-sm text-text-muted">
              {filtered ? t("emptyFiltered") : t("emptyHint")}
            </p>
          )}
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
      <MessageDetailDrawer projectId={project.id} messageId={openId} onClose={closeMessage} />
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <MailLogsContent />
    </Suspense>
  );
}
