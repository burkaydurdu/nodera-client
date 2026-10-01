/** Must match the gateway's required target header (contexts/gateway). */
export const GATEWAY_TARGET_SERVER_HEADER = "X-Target-Server";

/** Upstream service names as the gateway's YAML declares them. */
export type GatewayService = "customer" | "droplet";

export interface ProxyRoute {
  /** Tested against the axios url (relative to baseURL, without the query string). */
  pattern: RegExp;
  service: GatewayService;
}

/**
 * Request path → gateway service. The droplet routes are matched first; anything else under
 * /v1 belongs to the customer service.
 */
export const ProxyRoutes: ProxyRoute[] = [
  { pattern: /^\/v1\/catalog(\/|$)/, service: "droplet" },
  { pattern: /^\/v1\/projects\/[^/]+\/droplets(\/|$)/, service: "droplet" },
  { pattern: /^\/v1\/droplets(\/|$)/, service: "droplet" },
  { pattern: /^\/v1(\/|$)/, service: "customer" },
];

export const targetServerFor = (url: string | undefined): GatewayService | undefined => {
  if (!url) return undefined;
  const path = url.split("?")[0];
  return ProxyRoutes.find((route) => route.pattern.test(path))?.service;
};
