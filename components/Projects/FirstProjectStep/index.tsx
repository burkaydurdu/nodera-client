"use client";

import { useTranslations } from "next-intl";
import Card from "@/components/Card";
import EmptyBox from "@/components/EmptyBox";
import CreateProjectForm from "@/components/Projects/CreateProjectForm";
import type { FirstProjectStepProps } from "./type";

/** Dashboard empty state: explain the first step and create the project right here. */
export default function FirstProjectStep({ teamId, onCreated }: FirstProjectStepProps) {
  const t = useTranslations("dashboard.projects");

  return (
    <Card className="mx-auto w-full max-w-xl">
      <EmptyBox title={t("emptyTitle")} description={t("emptyDescription")}>
        <div className="w-full text-left">
          <CreateProjectForm teamId={teamId} onCreated={onCreated} autoFocus />
        </div>
      </EmptyBox>
    </Card>
  );
}
