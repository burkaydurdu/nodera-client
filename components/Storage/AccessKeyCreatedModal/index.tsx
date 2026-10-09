"use client";

import { Modal } from "antd";
import { useTranslations } from "next-intl";
import NoderaAlert from "@/components/NoderaAlert";
import NoderaButton from "@/components/NoderaButton";
import NoderaCopyButton from "@/components/NoderaCopyButton";
import type { AccessKeyCreatedModalProps } from "./type";

/**
 * The one time the secret key is shown. Both halves of the credential are copied from here,
 * with the endpoint and the Bucket name an S3 tool asks for next. The modal closes only on
 * purpose: a stray click outside must not lose what cannot be shown again.
 */
export default function AccessKeyCreatedModal({
  open,
  accessKey,
  storage,
  onClose,
  afterClose,
}: AccessKeyCreatedModalProps) {
  const t = useTranslations("storage.accessKeys.created");
  const tc = useTranslations("common");

  const rows: { key: string; value: string; mono?: boolean }[] = [
    { key: "accessKeyId", value: accessKey?.accessKeyId ?? "" },
    { key: "secretKey", value: accessKey?.secretKey ?? "" },
    { key: "endpoint", value: storage.endpoint },
    { key: "bucketName", value: storage.bucketName },
    { key: "region", value: storage.region },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      afterClose={afterClose}
      title={t("title", { name: accessKey?.name ?? "" })}
      footer={null}
      centered
      destroyOnHidden
      maskClosable={false}
      keyboard={false}
      width={600}
    >
      <div className="flex flex-col gap-field pt-2">
        <p className="text-sm leading-5 text-text-muted">{t("description")}</p>
        <dl className="flex flex-col gap-3">
          {rows.map((row) => (
            <div key={row.key} className="flex flex-col gap-0.5">
              <dt className="text-xs text-text-muted">{t(`fields.${row.key}`)}</dt>
              <dd className="flex items-center gap-2 rounded-input border border-border bg-surface-raised px-3 py-2">
                <code className="min-w-0 flex-1 break-all font-mono text-sm text-text">
                  {row.value}
                </code>
                <NoderaCopyButton value={row.value} />
              </dd>
            </div>
          ))}
        </dl>
        <NoderaAlert variant="warning" message={t("warning")} />
        <div className="flex justify-end pt-2">
          <NoderaButton variant="filled" onClick={onClose}>
            {tc("secretCopied")}
          </NoderaButton>
        </div>
      </div>
    </Modal>
  );
}
