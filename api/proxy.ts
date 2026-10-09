/** Must match the gateway's required target header (contexts/gateway). */
export const GATEWAY_TARGET_SERVER_HEADER = "X-Target-Server";

/** Upstream service names as the gateway's YAML declares them. */
export type GatewayService =
  "customer" | "droplet" | "billing" | "notification" | "mail" | "storage" | "kubernetes";

export interface ProxyRoute {
  /** Tested against the axios url (relative to baseURL, without the query string). */
  pattern: RegExp;
  service: GatewayService;
}

/**
 * Request path → gateway service. The droplet, billing, notification, mail, storage and
 * kubernetes routes are matched first; anything else under /v1 belongs to the customer service, a Project's API
 * keys (`/v1/teams/:teamID/projects/:projectID/api-keys`) included.
 */
export const ProxyRoutes: ProxyRoute[] = [
  { pattern: /^\/v1\/catalog(\/|$)/, service: "droplet" },
  { pattern: /^\/v1\/projects\/[^/]+\/droplets(\/|$)/, service: "droplet" },
  { pattern: /^\/v1\/droplets(\/|$)/, service: "droplet" },
  { pattern: /^\/v1\/teams\/[^/]+\/billing(\/|$)/, service: "billing" },
  { pattern: /^\/v1\/billing(\/|$)/, service: "billing" },
  { pattern: /^\/v1\/notifications(\/|$)/, service: "notification" },
  { pattern: /^\/v1\/mail(\/|$)/, service: "mail" },
  { pattern: /^\/v1\/projects\/[^/]+\/mail(\/|$)/, service: "mail" },
  { pattern: /^\/v1\/storage(\/|$)/, service: "storage" },
  { pattern: /^\/v1\/projects\/[^/]+\/storages(\/|$)/, service: "storage" },
  { pattern: /^\/v1\/kubernetes(\/|$)/, service: "kubernetes" },
  { pattern: /^\/v1\/projects\/[^/]+\/clusters(\/|$)/, service: "kubernetes" },
  { pattern: /^\/v1(\/|$)/, service: "customer" },
];

export const targetServerFor = (url: string | undefined): GatewayService | undefined => {
  if (!url) return undefined;
  const path = url.split("?")[0];
  return ProxyRoutes.find((route) => route.pattern.test(path))?.service;
};
