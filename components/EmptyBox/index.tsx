import classNames from "classnames";
import { CloudOutlined } from "@ant-design/icons";
import NoderaButton from "@/components/NoderaButton";
import type { EmptyBoxProps } from "./type";

export default function EmptyBox({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  children,
  className,
}: EmptyBoxProps) {
  return (
    <div className={classNames("flex flex-col items-center gap-6 text-center", className)}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          {icon ?? <CloudOutlined style={{ fontSize: 26 }} />}
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-lg font-semibold leading-6 text-text">{title}</p>
          <p className="max-w-md text-sm leading-5 text-text-muted">{description}</p>
        </div>
      </div>
      {actionLabel && onAction && (
        <NoderaButton variant="filled" onClick={onAction}>
          {actionLabel}
        </NoderaButton>
      )}
      {children}
    </div>
  );
}
