import classNames from "classnames";
import type { NoderaFormFieldProps } from "./type";

/** Label + control + hint/error, the wrapper every labeled input shares. */
export default function NoderaFormField({
  label,
  htmlFor,
  hint,
  error,
  required = false,
  children,
  className,
}: NoderaFormFieldProps) {
  return (
    <div className={classNames("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium leading-5 text-text">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      {children}
      {error ? (
        <span className="text-xs leading-4 text-danger">{error}</span>
      ) : hint ? (
        <span className="text-xs leading-4 text-text-muted">{hint}</span>
      ) : null}
    </div>
  );
}
