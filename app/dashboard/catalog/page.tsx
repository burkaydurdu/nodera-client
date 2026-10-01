"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { GetImages, GetPlans, GetRegions } from "@/api/catalog";
import type { Image, Plan, Region } from "@/core/catalog";
import { useErrorMessage } from "@/hooks/Error/useErrorMessage";
import Card from "@/components/Card";
import PlanTable from "@/components/Catalog/PlanTable";
import PriceNote from "@/components/Catalog/PriceNote";
import RegionList from "@/components/Catalog/RegionList";
import EmptyBox from "@/components/EmptyBox";
import Loading from "@/components/Loading";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  const t = useTranslations("catalog");
  const { getErrorMessage } = useErrorMessage();

  const [regions, setRegions] = useState<Region[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plansError, setPlansError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [regionsResponse, imagesResponse] = await Promise.all([GetRegions(), GetImages()]);
      const list = regionsResponse.data ?? [];
      setRegions(list);
      setImages(imagesResponse.data ?? []);
      setSelectedCode((current) =>
        current && list.some((region) => region.code === current)
          ? current
          : (list[0]?.code ?? null)
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [getErrorMessage]);

  const loadPlans = useCallback(
    async (code: string) => {
      setPlansLoading(true);
      setPlansError(null);
      try {
        const response = await GetPlans(code);
        setPlans(response.data ?? []);
      } catch (err) {
        setPlansError(getErrorMessage(err));
      } finally {
        setPlansLoading(false);
      }
    },
    [getErrorMessage]
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!selectedCode) return;
    setPlans([]);
    loadPlans(selectedCode);
  }, [selectedCode, loadPlans]);

  const selected = regions.find((region) => region.code === selectedCode) ?? null;

  if (loading) return <Loading />;

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} extra={<PriceNote />} />
      {error ? (
        <div className="flex flex-col items-start gap-3">
          <NoderaAlert variant="error" message={error} className="w-full" />
          <NoderaButton variant="outlined" onClick={load}>
            {t("retry")}
          </NoderaButton>
        </div>
      ) : regions.length === 0 ? (
        <EmptyBox title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="text-base font-semibold leading-6 text-text">
              {t("regionsTitle")}
            </h2>
            <RegionList
              regions={regions}
              selectedCode={selectedCode}
              onSelect={(region) => setSelectedCode(region.code)}
            />
          </section>
          {selected && (
            <Card
              flush
              title={t("plansTitle", { city: selected.city })}
              description={t("plansDescription")}
              extra={<PriceNote />}
            >
              {plansError ? (
                <div className="flex flex-col items-start gap-3 px-6 pb-6">
                  <NoderaAlert variant="error" message={plansError} className="w-full" />
                  <NoderaButton
                    variant="outlined"
                    size="small"
                    onClick={() => loadPlans(selected.code)}
                  >
                    {t("retry")}
                  </NoderaButton>
                </div>
              ) : (
                <PlanTable plans={plans} images={images} loading={plansLoading} />
              )}
            </Card>
          )}
        </>
      )}
    </>
  );
}
