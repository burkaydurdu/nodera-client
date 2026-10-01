import type { AuthCardHeaderProps } from "./type";

export default function AuthCardHeader({ title, subtitle }: AuthCardHeaderProps) {
  return (
    <div className="flex flex-col gap-2 text-center">
      <h1 className="text-2xl font-semibold leading-8 tracking-tight text-text">{title}</h1>
      {subtitle && <p className="text-sm leading-5 text-text-muted">{subtitle}</p>}
    </div>
  );
}
