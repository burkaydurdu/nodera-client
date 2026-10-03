"use client";

import { App } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import useInbox from "@/contexts/InboxContext/useInbox";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { useNotificationList } from "@/hooks/Notification/useNotificationList";
import Card from "@/components/Card";
import EmptyBox from "@/components/EmptyBox";
import Loading from "@/components/Loading";
import MarkAllReadButton from "@/components/Notifications/MarkAllReadButton";
import NotificationList from "@/components/Notifications/NotificationList";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  const t = useTranslations("notifications");
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessage();
  const { open } = useInbox();
  const { notifications, isLoading, isLoadingMore, error, hasMore, reload, loadMore } =
    useNotificationList();

  const handleLoadMore = async () => {
    try {
      await loadMore();
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  const header = (
    <PageHeader
      title={t("title")}
      description={t("description")}
      extra={<MarkAllReadButton variant="outlined" size="medium" />}
    />
  );

  if (notifications.length === 0 && isLoading) {
    return (
      <>
        {header}
        <Loading />
      </>
    );
  }

  if (notifications.length === 0 && error) {
    return (
      <>
        {header}
        <div className="flex flex-col items-start gap-3">
          <NoderaAlert variant="error" message={error} className="w-full" />
          <NoderaButton variant="outlined" onClick={() => void reload()}>
            {t("retry")}
          </NoderaButton>
        </div>
      </>
    );
  }

  if (notifications.length === 0) {
    return (
      <>
        {header}
        <Card className="mx-auto w-full max-w-xl">
          <EmptyBox
            icon={<BellOutlined style={{ fontSize: 26 }} />}
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        </Card>
      </>
    );
  }

  return (
    <>
      {header}
      <Card flush>
        <NotificationList notifications={notifications} onOpen={open} className="p-2" />
      </Card>
      {hasMore && (
        <div className="flex justify-center">
          <NoderaButton variant="outlined" loading={isLoadingMore} onClick={handleLoadMore}>
            {t("loadMore")}
          </NoderaButton>
        </div>
      )}
    </>
  );
}
