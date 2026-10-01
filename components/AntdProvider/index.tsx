"use client";

import { StyleProvider } from "@ant-design/cssinjs";
import { App, ConfigProvider } from "antd";
import { useLocale } from "next-intl";
import enUS from "antd/locale/en_US";
import trTR from "antd/locale/tr_TR";
import ThemeConfig from "@/app/ThemeConfig";
import type { AntdProviderProps } from "./type";

const antdLocales = { en: enUS, tr: trTR } as const;

export default function AntdProvider({ children }: AntdProviderProps) {
  const locale = useLocale() as keyof typeof antdLocales;

  return (
    <StyleProvider layer>
      <ConfigProvider theme={ThemeConfig} locale={antdLocales[locale] ?? enUS}>
        <App>{children}</App>
      </ConfigProvider>
    </StyleProvider>
  );
}
