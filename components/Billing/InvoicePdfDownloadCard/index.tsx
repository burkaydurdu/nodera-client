"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DownloadOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { DownloadInvoicePdfByToken } from "@/api/billing";
import { INVOICE_PDF_FALLBACK_FILENAME, billingPath } from "@/core/billing";
import { ErrorCode } from "@/core/error";
import { DASHBOARD_PATH, LOGIN_PATH } from "@/core/routes";
import useAuth from "@/contexts/AuthContext/useAuth";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { filenameFromContentDisposition, saveBlob } from "@/utils/download";
import { IsErrorCode } from "@/utils/error";
import AuthCardHeader from "@/components/Auth/AuthCardHeader";
import Loading from "@/components/Loading";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaLink from "@/components/NoderaLink";
import type { InvoicePdfDownloadCardProps } from "./type";

type Outcome =
  | { kind: "downloading" }
  | { kind: "done" }
  | { kind: "expired" }
  | { kind: "error"; message: string };

interface SavedPdf {
  blob: Blob;
  filename: string;
}

/**
 * The invoice PDF link from the invoice-issued email. The signed `expires` + `token` pair
 * authorizes this one download, so it works in every sign-in state.
 */
export default function InvoicePdfDownloadCard({
  invoiceId,
  expires,
  token,
}: InvoicePdfDownloadCardProps) {
  const t = useTranslations("billing.invoicePdf");
  const { currentUser } = useAuth();
  const { getErrorMessage } = useErrorMessage();
  const [outcome, setOutcome] = useState<Outcome>({ kind: "downloading" });
  // The file already fetched: "download again" saves it once more instead of spending the
  // link a second time.
  const saved = useRef<SavedPdf | null>(null);
  // One automatic download per page, whatever re-renders happen after it.
  const started = useRef(false);

  const download = useCallback(async () => {
    if (!invoiceId || !expires || !token) return;
    setOutcome({ kind: "downloading" });
    try {
      const response = await DownloadInvoicePdfByToken(invoiceId, expires, token);
      const filename = filenameFromContentDisposition(
        response.headers?.["content-disposition"] as string | undefined,
        INVOICE_PDF_FALLBACK_FILENAME
      );
      saved.current = { blob: response.data, filename };
      saveBlob(response.data, filename);
      setOutcome({ kind: "done" });
    } catch (error) {
      if (IsErrorCode(error, ErrorCode.InvoicePdfLinkInvalid)) setOutcome({ kind: "expired" });
      else setOutcome({ kind: "error", message: getErrorMessage(error) });
    }
  }, [invoiceId, expires, token, getErrorMessage]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void download();
  }, [download]);

  const saveAgain = () => {
    if (saved.current) saveBlob(saved.current.blob, saved.current.filename);
    else void download();
  };

  const back = (
    <p className="text-center text-sm">
      <NoderaLink href={currentUser ? DASHBOARD_PATH : LOGIN_PATH}>
        {currentUser ? t("goToDashboard") : t("goToLogin")}
      </NoderaLink>
    </p>
  );

  if (!invoiceId || !expires || !token) {
    return (
      <div className="flex flex-col gap-section">
        <AuthCardHeader title={t("title")} />
        <NoderaAlert variant="error" message={t("missingParams")} />
        {back}
      </div>
    );
  }

  if (outcome.kind === "downloading") {
    return (
      <div className="flex flex-col gap-section">
        <AuthCardHeader title={t("title")} subtitle={t("downloading")} />
        <Loading />
      </div>
    );
  }

  if (outcome.kind === "done") {
    return (
      <div className="flex flex-col gap-section">
        <AuthCardHeader title={t("doneTitle")} subtitle={t("doneMessage")} />
        <NoderaButton
          variant="filled"
          fullWidth
          icon={<DownloadOutlined />}
          onClick={saveAgain}
        >
          {t("downloadAgain")}
        </NoderaButton>
        {back}
      </div>
    );
  }

  if (outcome.kind === "expired") {
    return (
      <div className="flex flex-col gap-section">
        <AuthCardHeader title={t("expiredTitle")} />
        <NoderaAlert variant="warning" message={t("expiredMessage")} />
        <p className="text-center text-sm">
          <NoderaLink href={billingPath("invoices", invoiceId)}>
            {t("openInBilling")}
          </NoderaLink>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-section">
      <AuthCardHeader title={t("errorTitle")} />
      <NoderaAlert variant="error" message={outcome.message} />
      <NoderaButton variant="filled" fullWidth onClick={() => void download()}>
        {t("retry")}
      </NoderaButton>
      {back}
    </div>
  );
}
