import classNames from "classnames";
import type { FormSectionProps } from "./type";

/** A titled block of fields: header (title + description) then a vertical field stack. */
export default function FormSection({
  title,
  description,
  children,
  extra,
  className,
}: FormSectionProps) {
  return (
    <section className={classNames("flex flex-col gap-section", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold leading-6 text-text">{title}</h2>
          {description && <p className="text-sm leading-5 text-text-muted">{description}</p>}
        </div>
        {extra && <div className="shrink-0">{extra}</div>}
      </div>
      <div className="flex flex-col gap-field">{children}</div>
    </section>
  );
}
