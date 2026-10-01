/** @type {import('next').NextConfig} */
import path from "path";
import { fileURLToPath } from "url";
import createNextIntlPlugin from "next-intl/plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/**
 * Values inlined into the client bundle at build time. Every entry has a dev default so
 * `yarn dev` works with no .env file; see .env.example for the full list.
 */
const env = {
  ENV: process.env.ENV || "dev",
  /** Customer gateway base URL (dev default: cmd/customer-gateway :3460). */
  GATEWAY_API_URL: process.env.GATEWAY_API_URL || "http://localhost:3460",
};

const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  env,
};

export default withNextIntl(nextConfig);
