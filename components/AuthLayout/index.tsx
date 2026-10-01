"use client";

import { useTranslations } from "next-intl";
import LanguageSwitch from "@/components/LanguageSwitch";
import NoderaLogo from "@/components/NoderaLogo";
import type { AuthLayoutProps } from "./type";

/** Centered card shell for the public pages: logo on top, language switch and footer below. */
export default function AuthLayout({ children }: AuthLayoutProps) {
  const t = useTranslations("footer");

  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <div className="flex flex-1 flex-col items-center px-4 pb-10 pt-16 sm:pt-24">
        <NoderaLogo size={32} className="mb-10" />
        <div className="w-full max-w-[480px] rounded-card border border-border bg-surface p-card shadow-card">
          {children}
        </div>
        <div className="mt-6">
          <LanguageSwitch />
        </div>
      </div>
      <footer className="flex items-center justify-center px-4 py-6 text-xs text-text-muted">
        <span>{t("copyright", { year: new Date().getFullYear() })}</span>
      </footer>
    </div>
  );
}
