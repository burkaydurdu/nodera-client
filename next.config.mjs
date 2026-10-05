/** @type {import('next').NextConfig} */
import path from "path";
import { fileURLToPath } from "url";
import createNextIntlPlugin from "next-intl/plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/**
 * Values inlined into the client bundle at build time; `yarn dev` works with no .env file. See
 * .env.example for the full list.
 */
const ENV = process.env.ENV || "dev";

const env = {
  ENV,
  /** Customer gateway base URL (dev default: cmd/customer-gateway :3460). */
  GATEWAY_API_URL: process.env.GATEWAY_API_URL || "http://localhost:3460",
  /**
   * Host of Mail's SMTP listener, shown in the Mail App's SMTP settings. No default: a build
   * that names none says it is not configured rather than show customers a host they cannot
   * reach (dev sets it in .env).
   */
  MAIL_SMTP_HOST: process.env.MAIL_SMTP_HOST ?? "",
  /**
   * Integration gateway base URL, where software holding a Project API key calls; the Mail App's
   * send example points at it. Only dev has a default (cmd/integration-gateway :3470): any other
   * build that names none says it is not configured rather than show customers localhost.
   */
  INTEGRATION_API_URL:
    process.env.INTEGRATION_API_URL || (ENV === "dev" ? "http://localhost:3470" : ""),
};

const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  env,
};

export default withNextIntl(nextConfig);
