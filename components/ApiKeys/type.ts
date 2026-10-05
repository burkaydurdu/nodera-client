import type { CreatedApiKey } from "@/core/apiKey";

/** Shared by the API key feature components. */
export interface ApiKeyCreatedHandler {
  (key: CreatedApiKey): void;
}
