import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LOCALE_COOKIE, isLocale } from "@/core/locale";

/** `?lang=tr|en` on any page sets the NEXT_LOCALE cookie and redirects to the clean URL. */
export default function proxy(request: NextRequest) {
  const url = new URL(request.url);
  const langParam = url.searchParams.get("lang");

  if (isLocale(langParam)) {
    url.searchParams.delete("lang");
    const response = NextResponse.redirect(url);
    response.cookies.set(LOCALE_COOKIE, langParam, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
