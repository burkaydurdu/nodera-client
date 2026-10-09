"use client";

import { LockOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { isRole } from "@/core/authz";
import useTeam from "@/contexts/TeamContext/useTeam";
import Card from "@/components/Card";
import EmptyBox from "@/components/EmptyBox";
import PageHeader from "@/components/PageHeader";

/** A member whose Role lacks `storage.read` learns why the Storage App stays empty. */
export default function StorageAccessDenied() {
  const t = useTranslations("storage.access");
  const tr = useTranslations("teams.roles");
  const { currentTeam } = useTeam();
  const role = currentTeam?.role;

  return (
    <>
      <PageHeader title={t("title")} />
      <Card className="mx-auto w-full max-w-xl">
        <EmptyBox
          icon={<LockOutlined style={{ fontSize: 26 }} />}
          title={t("deniedTitle")}
          description={
            currentTeam && isRole(role)
              ? t("denied", { team: currentTeam.name, role: tr(role) })
              : t("deniedGeneric")
          }
        />
      </Card>
    </>
  );
}
