"use client";

import { PlusOutlined } from "@ant-design/icons";
import classNames from "classnames";
import { useTranslations } from "next-intl";
import { MAX_SSH_KEYS } from "@/core/droplet";
import NoderaButton from "@/components/NoderaButton";
import NoderaCheckbox from "@/components/NoderaCheckbox";
import type { SSHKeyPickerProps } from "./type";

export default function SSHKeyPicker({
  keys,
  selectedIds,
  onChange,
  onAddKey,
  disabled = false,
  error = null,
}: SSHKeyPickerProps) {
  const t = useTranslations("droplets.create");

  const toggle = (id: string, checked: boolean) => {
    if (checked) {
      if (selectedIds.length >= MAX_SSH_KEYS) return;
      onChange([...selectedIds, id]);
    } else {
      onChange(selectedIds.filter((selected) => selected !== id));
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {keys.length === 0 ? (
        <p className="text-sm text-text-muted">{t("noKeys")}</p>
      ) : (
        <div className="flex flex-col divide-y divide-border rounded-input border border-border">
          {keys.map((key) => {
            const checked = selectedIds.includes(key.id);
            return (
              <label
                key={key.id}
                className={classNames(
                  "flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-surface-raised",
                  disabled && "cursor-not-allowed opacity-60"
                )}
              >
                <NoderaCheckbox
                  checked={checked}
                  disabled={disabled || (!checked && selectedIds.length >= MAX_SSH_KEYS)}
                  onChange={(event) => toggle(key.id, event.target.checked)}
                />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium text-text">{key.name}</span>
                  <span className="truncate font-mono text-xs text-text-muted">
                    {key.fingerprint}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      )}
      {error && <span className="text-xs leading-4 text-danger">{error}</span>}
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-text-muted">
          {t("keysSelected", { count: selectedIds.length, max: MAX_SSH_KEYS })}
        </span>
        <NoderaButton
          variant="outlined"
          size="small"
          icon={<PlusOutlined />}
          onClick={onAddKey}
          disabled={disabled}
        >
          {t("addKey")}
        </NoderaButton>
      </div>
    </div>
  );
}
