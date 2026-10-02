"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Steps } from "antd";
import { useTranslations } from "next-intl";
import { GetPlans } from "@/api/catalog";
import { CreateDroplet } from "@/api/droplets";
import type { Plan } from "@/core/catalog";
import { ErrorCode } from "@/core/error";
import {
  MAX_SSH_KEYS,
  MIN_SSH_KEYS,
  PROJECT_ACCESS_RETRY_INTERVAL_MS,
  PROJECT_ACCESS_RETRY_MS,
  validateHostname,
} from "@/core/droplet";
import type { SSHKey } from "@/core/sshKey";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import { GetStatus, IsErrorCode } from "@/utils/error";
import { formatUsd, samePrice } from "@/utils/price";
import { retryUntil } from "@/utils/retry";
import PaymentBlockedAlert from "@/components/Billing/PaymentBlockedAlert";
import type { PaymentBlockedReason } from "@/components/Billing/PaymentBlockedAlert/type";
import Card from "@/components/Card";
import PlanTable from "@/components/Catalog/PlanTable";
import RegionList from "@/components/Catalog/RegionList";
import FormSection from "@/components/FormSection";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import HostnameField from "@/components/Droplets/HostnameField";
import ImagePicker from "@/components/Droplets/ImagePicker";
import PriceSummary from "@/components/Droplets/PriceSummary";
import SSHKeyPicker from "@/components/Droplets/SSHKeyPicker";
import AddSSHKeyModal from "@/components/SSHKeys/AddSSHKeyModal";
import type { CreateDropletFormProps } from "./type";

/** What the create call was refused for, derived from the refreshed catalog (both are 409s). */
type CatalogConflict =
  | { kind: "soldOut"; plan: string }
  | { kind: "priceChanged"; plan: string; oldPrice: string; newPrice: string }
  | { kind: "conflict"; message: string };

export default function CreateDropletForm({
  projectId,
  teamId,
  regions,
  images,
  sshKeys,
  onKeyCreated,
  onCreated,
  onCancel,
}: CreateDropletFormProps) {
  const t = useTranslations("droplets.create");
  const { getErrorMessage } = useErrorMessage();

  const [regionCode, setRegionCode] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [planCode, setPlanCode] = useState<string | null>(null);
  const [imageCode, setImageCode] = useState<string | null>(null);
  const [hostname, setHostname] = useState("");
  const [selectedKeyIds, setSelectedKeyIds] = useState<string[]>([]);
  const [touched, setTouched] = useState(false);
  const [addKeyOpen, setAddKeyOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [conflict, setConflict] = useState<CatalogConflict | null>(null);
  const [blocked, setBlocked] = useState<PaymentBlockedReason | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  // Leaving the page must stop the retry window of a create that is still being waited on.
  const submitAbort = useRef<AbortController | null>(null);

  useEffect(() => () => submitAbort.current?.abort(), []);

  const region = regions.find((item) => item.code === regionCode) ?? null;
  const plan = plans.find((item) => item.code === planCode) ?? null;
  const planImages = useMemo(
    () => (plan ? images.filter((image) => plan.images.includes(image.code)) : []),
    [plan, images]
  );
  const image = planImages.find((item) => item.code === imageCode) ?? null;

  const loadPlans = useCallback(
    async (code: string): Promise<Plan[]> => {
      setPlansLoading(true);
      setPlansError(null);
      try {
        const response = await GetPlans(code);
        const list = response.data ?? [];
        setPlans(list);
        return list;
      } catch (error) {
        setPlansError(getErrorMessage(error));
        return [];
      } finally {
        setPlansLoading(false);
      }
    },
    [getErrorMessage]
  );

  useEffect(() => {
    if (!regionCode) return;
    setPlans([]);
    setPlanCode(null);
    loadPlans(regionCode);
  }, [regionCode, loadPlans]);

  // A Plan change can drop the chosen Image out of the offered set.
  useEffect(() => {
    if (imageCode && !planImages.some((item) => item.code === imageCode)) {
      setImageCode(null);
    }
  }, [planImages, imageCode]);

  const hostnameIssue = validateHostname(hostname);
  const keysIssue =
    selectedKeyIds.length < MIN_SSH_KEYS
      ? t("sshKeysRequired")
      : selectedKeyIds.length > MAX_SSH_KEYS
        ? t("sshKeysMax", { max: MAX_SSH_KEYS })
        : null;
  const complete =
    !!region && !!plan && !plan.soldOut && !!image && !hostnameIssue && !keysIssue;

  const currentStep = !region ? 0 : !plan ? 1 : !image ? 2 : hostnameIssue ? 3 : 4;

  const handleKeyCreated = (key: SSHKey) => {
    onKeyCreated(key);
    setSelectedKeyIds((ids) => (ids.length < MAX_SSH_KEYS ? [...ids, key.id] : ids));
    setAddKeyOpen(false);
  };

  const explainConflict = async (error: unknown, submitted: Plan) => {
    const refreshed = regionCode ? await loadPlans(regionCode) : [];
    const current = refreshed.find((item) => item.code === submitted.code);
    // The service says which promise it could not keep; the refreshed catalog
    // only supplies the numbers to show. The catalog-derived guesses below stay
    // as a fallback for an answer without a recognised code.
    if (IsErrorCode(error, ErrorCode.CatalogPlanSoldOut)) {
      setPlanCode(null);
      setConflict({ kind: "soldOut", plan: submitted.code });
      return;
    }
    if (IsErrorCode(error, ErrorCode.CatalogPlanPriceChanged)) {
      if (current) {
        setConflict({
          kind: "priceChanged",
          plan: submitted.code,
          oldPrice: submitted.hourlyPrice,
          newPrice: current.hourlyPrice,
        });
      } else {
        // The Plan is gone from the refreshed catalog: no new price to show, so the
        // service's own wording stands rather than a guessed sold-out.
        setConflict({ kind: "conflict", message: getErrorMessage(error) });
      }
      return;
    }
    if (!current || current.soldOut) {
      setPlanCode(null);
      setConflict({ kind: "soldOut", plan: submitted.code });
      return;
    }
    if (!samePrice(current.hourlyPrice, submitted.hourlyPrice)) {
      setConflict({
        kind: "priceChanged",
        plan: submitted.code,
        oldPrice: submitted.hourlyPrice,
        newPrice: current.hourlyPrice,
      });
      return;
    }
    setConflict({ kind: "conflict", message: getErrorMessage(error) });
  };

  const handleSubmit = async () => {
    setTouched(true);
    setFormError(null);
    setConflict(null);
    setBlocked(null);
    if (!complete || submitting || !region || !plan || !image) return;

    const keys = sshKeys.filter((key) => selectedKeyIds.includes(key.id));
    const controller = new AbortController();
    submitAbort.current = controller;
    setSubmitting(true);
    try {
      // The droplet service learns a new Project from an event (ADR-0004): its own "not found"
      // right after the Project was created clears within seconds, so the create is retried
      // briefly. A 404 from the catalog (unknown Plan, Region or Image) is final.
      const response = await retryUntil(
        () =>
          CreateDroplet(projectId, {
            plan: plan.code,
            region: region.code,
            image: image.code,
            hostname,
            sshKeys: keys.map((key) => ({ name: key.name, publicKey: key.publicKey })),
          }),
        {
          shouldRetry: (error) => IsErrorCode(error, ErrorCode.AccessProjectNotFound),
          timeoutMs: PROJECT_ACCESS_RETRY_MS,
          intervalMs: PROJECT_ACCESS_RETRY_INTERVAL_MS,
          signal: controller.signal,
        }
      );
      onCreated(response.data);
    } catch (error) {
      if (controller.signal.aborted) return;
      // Billing blocks (402 / 423) are about the Team, not the form: they get the same calls
      // to action as the dashboard banner instead of a generic error.
      if (IsErrorCode(error, ErrorCode.DropletPaymentMethodRequired)) {
        setBlocked("paymentMethodRequired");
      } else if (IsErrorCode(error, ErrorCode.DropletTeamSuspended)) {
        setBlocked("suspended");
      } else if (GetStatus(error) === 409) {
        await explainConflict(error, plan);
      } else if (IsErrorCode(error, ErrorCode.AccessProjectNotFound)) {
        setFormError(t("projectNotReady"));
      } else {
        setFormError(getErrorMessage(error));
      }
    } finally {
      if (submitAbort.current === controller) submitAbort.current = null;
      setSubmitting(false);
    }
  };

  const conflictAlert = conflict && (
    <NoderaAlert
      variant="warning"
      message={
        conflict.kind === "soldOut"
          ? t("soldOutTitle")
          : conflict.kind === "priceChanged"
            ? t("priceChangedTitle")
            : t("conflictTitle")
      }
      description={
        conflict.kind === "soldOut"
          ? t("soldOutDescription", { plan: conflict.plan })
          : conflict.kind === "priceChanged"
            ? t("priceChangedDescription", {
                plan: conflict.plan,
                oldPrice: formatUsd(conflict.oldPrice),
                newPrice: formatUsd(conflict.newPrice),
              })
            : conflict.message
      }
    />
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex flex-col gap-6">
        <Steps
          size="small"
          current={currentStep}
          items={[
            { title: t("steps.region") },
            { title: t("steps.plan") },
            { title: t("steps.image") },
            { title: t("steps.hostname") },
            { title: t("steps.sshKeys") },
          ]}
        />
        {conflictAlert}
        {blocked && <PaymentBlockedAlert reason={blocked} />}
        {formError && <NoderaAlert variant="error" message={formError} />}

        <Card>
          <FormSection title={t("regionTitle")} description={t("regionDescription")}>
            <RegionList
              regions={regions}
              selectedCode={regionCode}
              onSelect={(next) => setRegionCode(next.code)}
            />
          </FormSection>
        </Card>

        {region && (
          <Card flush title={t("planTitle")} description={t("planDescription")}>
            {plansError ? (
              <div className="flex flex-col items-start gap-3 px-6 pb-6">
                <NoderaAlert variant="error" message={plansError} className="w-full" />
                <NoderaButton
                  variant="outlined"
                  size="small"
                  onClick={() => loadPlans(region.code)}
                >
                  {t("retry")}
                </NoderaButton>
              </div>
            ) : (
              <PlanTable
                plans={plans}
                images={images}
                loading={plansLoading}
                selectedCode={planCode}
                onSelect={(next) => setPlanCode(next.code)}
              />
            )}
          </Card>
        )}

        {plan && (
          <Card>
            <FormSection title={t("imageTitle")} description={t("imageDescription")}>
              <ImagePicker
                images={planImages}
                value={imageCode}
                onChange={setImageCode}
                disabled={submitting}
              />
            </FormSection>
          </Card>
        )}

        {image && (
          <Card>
            <div className="flex flex-col gap-section">
              <FormSection title={t("hostnameTitle")} description={t("hostnameDescription")}>
                <HostnameField
                  value={hostname}
                  onChange={setHostname}
                  disabled={submitting}
                  touched={touched}
                />
              </FormSection>
              <FormSection title={t("sshKeysTitle")} description={t("sshKeysDescription")}>
                <SSHKeyPicker
                  keys={sshKeys}
                  selectedIds={selectedKeyIds}
                  onChange={setSelectedKeyIds}
                  onAddKey={() => setAddKeyOpen(true)}
                  disabled={submitting}
                  error={touched ? keysIssue : null}
                />
              </FormSection>
            </div>
          </Card>
        )}

        <div className="flex justify-end gap-3">
          {onCancel && (
            <NoderaButton variant="outlined" onClick={onCancel} disabled={submitting}>
              {t("cancel")}
            </NoderaButton>
          )}
          <NoderaButton
            variant="filled"
            onClick={handleSubmit}
            loading={submitting}
            disabled={!complete}
          >
            {t("submit")}
          </NoderaButton>
        </div>
      </div>

      <PriceSummary
        region={region}
        plan={plan}
        image={image}
        hostname={hostname}
        keyCount={selectedKeyIds.length}
      />

      <AddSSHKeyModal
        open={addKeyOpen}
        teamId={teamId}
        onClose={() => setAddKeyOpen(false)}
        onCreated={handleKeyCreated}
      />
    </div>
  );
}
