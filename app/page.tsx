"use client";

import Loading from "@/components/Loading";

/** The routing guard redirects "/" to the dashboard or the login page. */
export default function Page() {
  return <Loading fullScreen />;
}
