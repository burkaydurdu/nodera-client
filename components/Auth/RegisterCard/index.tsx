"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Register } from "@/api/auth";
import { LookupInvitation } from "@/api/invitations";
import { getCountryOptions } from "@/core/countries";
import {
  type InvitationLookup,
  isInvitationPending,
  loginWithInvitationPath,
} from "@/core/invitation";
import type { Locale } from "@/core/locale";
import { isPasswordValid } from "@/core/password";
import { setPendingInvitation } from "@/core/storage";
import { FULL_NAME_MAX_LENGTH, isValidEmail } from "@/core/validation";
import { useNavigate } from "@/hooks/Navigation/useNavigate";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { GetValidationErrors } from "@/utils/error";
import AuthCardHeader from "@/components/Auth/AuthCardHeader";
import InvitationBanner from "@/components/Invitations/InvitationBanner";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaLink from "@/components/NoderaLink";
import NoderaSelect from "@/components/NoderaSelect";
import NoderaTextField from "@/components/NoderaTextField";
import PasswordChecklist from "@/components/PasswordChecklist";
import type { RegisterCardProps } from "./type";

type FieldErrors = Partial<Record<"email" | "password" | "fullName" | "country", string>>;

export default function RegisterCard({ invitationToken = null }: RegisterCardProps) {
  const t = useTranslations("auth.register");
  const ti = useTranslations("invitations.banner");
  const tv = useTranslations("validation");
  const locale = useLocale() as Locale;
  const { navigate } = useNavigate();
  const { getErrorMessage, getFieldErrorMessage } = useErrorMessage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [invitation, setInvitation] = useState<InvitationLookup | null>(null);

  const countryOptions = useMemo(() => getCountryOptions(locale), [locale]);

  // The invited address is prefilled and locked so the wrong one cannot be registered; the
  // server refuses a sign-up whose email differs from the Invitation's regardless (8-10007).
  useEffect(() => {
    if (!invitationToken) {
      setInvitation(null);
      return;
    }
    let cancelled = false;
    LookupInvitation(invitationToken)
      .then((response) => {
        if (cancelled) return;
        setInvitation(response.data);
        if (isInvitationPending(response.data.status) && response.data.email) {
          setEmail(response.data.email);
        } else if (!isInvitationPending(response.data.status)) {
          setFormError(ti("notPending"));
        }
      })
      .catch((error) => {
        if (!cancelled) setFormError(getErrorMessage(error));
      });
    return () => {
      cancelled = true;
    };
  }, [invitationToken]);

  const invitationOpen = !!invitation && isInvitationPending(invitation.status);
  const emailLocked = invitationOpen && !!invitation.email;

  const validate = (): boolean => {
    const next: FieldErrors = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail) next.email = tv("emailRequired");
    else if (!isValidEmail(trimmedEmail)) next.email = tv("emailInvalid");
    if (!password) next.password = tv("passwordRequired");
    else if (!isPasswordValid(password)) next.password = tv("passwordInvalid");
    if (!fullName.trim()) next.fullName = tv("fullNameRequired");
    if (!country) next.country = tv("countryRequired");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (loading) return;
    setFormError(null);
    if (!validate()) return;

    const trimmedEmail = email.trim();
    setLoading(true);
    try {
      await Register({
        email: trimmedEmail,
        password,
        fullName: fullName.trim(),
        country: country!,
        locale,
        ...(invitationOpen && invitationToken ? { invitationToken } : {}),
      });
      if (invitationOpen && invitationToken && invitation) {
        setPendingInvitation({
          token: invitationToken,
          teamName: invitation.teamName,
          autoAccepted: true,
        });
      }
      navigate(`/verify-email?email=${encodeURIComponent(trimmedEmail)}&sent=1`);
    } catch (error) {
      const fieldErrors = GetValidationErrors(error);
      if (fieldErrors.length > 0) {
        const next: FieldErrors = {};
        for (const fe of fieldErrors) {
          const text = getFieldErrorMessage(fe);
          if (fe.field === "email") next.email = text;
          else if (fe.field === "password") next.password = text;
          else if (fe.field === "full_name") next.fullName = text;
          else if (fe.field === "country") next.country = text;
        }
        setErrors(next);
      }
      setFormError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-section">
      <AuthCardHeader title={t("title")} subtitle={t("subtitle")} />

      {invitationOpen && (
        <InvitationBanner
          invitation={invitation}
          hint={ti("signUpHint", { email: invitation.emailHint })}
        />
      )}

      {formError && <NoderaAlert variant="error" message={formError} />}

      <div className="flex flex-col gap-field">
        <NoderaTextField
          label={t("fullName")}
          value={fullName}
          onChange={setFullName}
          error={errors.fullName}
          autoComplete="name"
          maxLength={FULL_NAME_MAX_LENGTH}
          autoFocus
          disabled={loading}
          required
        />
        <NoderaTextField
          label={t("email")}
          kind="email"
          value={email}
          onChange={setEmail}
          error={errors.email}
          hint={invitationOpen ? ti("emailHint", { email: invitation.emailHint }) : undefined}
          autoComplete="email"
          readOnly={emailLocked}
          disabled={loading}
          required
        />
        <div className="flex flex-col gap-2">
          <NoderaTextField
            label={t("password")}
            kind="password"
            value={password}
            onChange={setPassword}
            error={errors.password}
            autoComplete="new-password"
            disabled={loading}
            required
          />
          <PasswordChecklist password={password} />
        </div>
        <NoderaSelect
          label={t("country")}
          value={country}
          onChange={setCountry}
          options={countryOptions}
          placeholder={t("countryPlaceholder")}
          error={errors.country}
          disabled={loading}
          required
        />
      </div>

      <NoderaButton variant="filled" fullWidth loading={loading} onClick={handleSubmit}>
        {t("submit")}
      </NoderaButton>

      <p className="text-center text-sm text-text-muted">
        {t("haveAccount")}{" "}
        <NoderaLink
          href={invitationToken ? loginWithInvitationPath(invitationToken) : "/login"}
        >
          {t("login")}
        </NoderaLink>
      </p>
    </div>
  );
}
