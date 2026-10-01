"use client";

import { useTranslations } from "next-intl";
import useAuth from "@/contexts/AuthContext/useAuth";
import Loading from "@/components/Loading";
import PageHeader from "@/components/PageHeader";
import ChangePasswordForm from "@/components/Profile/ChangePasswordForm";
import MfaSettingsCard from "@/components/Profile/MfaSettingsCard";
import ProfileDetailsForm from "@/components/Profile/ProfileDetailsForm";
import ProfileSummary from "@/components/Profile/ProfileSummary";
import SessionsList from "@/components/Profile/SessionsList";

export default function Page() {
  const t = useTranslations("profile");
  const { currentUser, setCurrentUser } = useAuth();

  if (!currentUser) {
    return <Loading />;
  }

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <ProfileSummary user={currentUser} />
      <ProfileDetailsForm user={currentUser} onUpdated={setCurrentUser} />
      <MfaSettingsCard user={currentUser} onUpdated={setCurrentUser} />
      <ChangePasswordForm />
      <SessionsList />
    </>
  );
}
