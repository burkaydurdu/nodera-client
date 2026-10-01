"use client";

import { useState } from "react";
import { Tooltip } from "antd";
import {
  DeleteOutlined,
  PoweroffOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { canAct } from "@/core/droplet";
import Card from "@/components/Card";
import NoderaButton from "@/components/NoderaButton";
import DeleteDropletDialog from "@/components/Droplets/DeleteDropletDialog";
import PowerOffDialog from "@/components/Droplets/PowerOffDialog";
import type { DropletActionsProps } from "./type";

export default function DropletActions({
  droplet,
  busy,
  onAction,
  onDelete,
}: DropletActionsProps) {
  const t = useTranslations("droplets.detail.actions");
  const [powerOffOpen, setPowerOffOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const actionable = canAct(droplet.status);
  const deletable = droplet.status !== "deleting" && droplet.status !== "deleted";
  const hint = actionable ? undefined : t("notAllowed");

  // A refused action keeps the dialog open so the shown error is not lost behind it.
  const confirmPowerOff = async () => {
    if (await onAction("power_off")) setPowerOffOpen(false);
  };

  const confirmDelete = async () => {
    if (await onDelete()) setDeleteOpen(false);
  };

  return (
    <Card title={t("title")} description={t("description")}>
      <div className="flex flex-wrap items-center gap-3">
        <Tooltip title={hint}>
          <span>
            <NoderaButton
              variant="outlined"
              icon={<PlayCircleOutlined />}
              disabled={busy || !actionable || droplet.status !== "off"}
              onClick={() => onAction("power_on")}
            >
              {t("powerOn")}
            </NoderaButton>
          </span>
        </Tooltip>
        <Tooltip title={hint}>
          <span>
            <NoderaButton
              variant="outlined"
              icon={<PoweroffOutlined />}
              disabled={busy || !actionable || droplet.status !== "active"}
              onClick={() => setPowerOffOpen(true)}
            >
              {t("powerOff")}
            </NoderaButton>
          </span>
        </Tooltip>
        <Tooltip title={hint}>
          <span>
            <NoderaButton
              variant="outlined"
              icon={<ReloadOutlined />}
              disabled={busy || !actionable}
              onClick={() => onAction("reboot")}
            >
              {t("reboot")}
            </NoderaButton>
          </span>
        </Tooltip>
        <span className="flex-1" />
        <NoderaButton
          variant="danger"
          icon={<DeleteOutlined />}
          disabled={busy || !deletable}
          onClick={() => setDeleteOpen(true)}
        >
          {t("delete")}
        </NoderaButton>
      </div>

      <PowerOffDialog
        open={powerOffOpen}
        hostname={droplet.hostname}
        loading={busy}
        onClose={() => setPowerOffOpen(false)}
        onConfirm={confirmPowerOff}
      />
      <DeleteDropletDialog
        open={deleteOpen}
        hostname={droplet.hostname}
        loading={busy}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </Card>
  );
}
