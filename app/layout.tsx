import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { AuthProvider } from "@/contexts/AuthContext/AuthContext";
import { InboxProvider } from "@/contexts/InboxContext/InboxContext";
import { InvitationProvider } from "@/contexts/InvitationContext/InvitationContext";
import { RealtimeProvider } from "@/contexts/RealtimeContext/RealtimeContext";
import { RoutingProvider } from "@/contexts/RoutingContext/RoutingContext";
import { TeamProvider } from "@/contexts/TeamContext/TeamContext";
import AntdProvider from "@/components/AntdProvider";
import Loading from "@/components/Loading";
import { buildThemeStyle } from "@/theme/tokens";

export const metadata: Metadata = {
  title: "Nodera",
  description: "Nodera bare-metal cloud",
  icons: { icon: "/favicon.svg" },
};

const themeStyle = buildThemeStyle();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);

  return (
    <html lang={locale}>
      <head>
        {/* Design tokens from theme/tokens.ts — the only place the palette is defined. */}
        <style id="nodera-theme" dangerouslySetInnerHTML={{ __html: themeStyle }} />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AntdProvider>
            <AuthProvider>
              <TeamProvider>
                <InvitationProvider>
                  <RealtimeProvider>
                    <InboxProvider>
                      <RoutingProvider>
                        <Suspense fallback={<Loading fullScreen />}>
                          <div className="min-h-screen">{children}</div>
                        </Suspense>
                      </RoutingProvider>
                    </InboxProvider>
                  </RealtimeProvider>
                </InvitationProvider>
              </TeamProvider>
            </AuthProvider>
          </AntdProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
