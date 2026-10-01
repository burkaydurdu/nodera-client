"use client";

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { camelizeKeys, decamelizeKeys } from "humps";
import { GATEWAY_TARGET_SERVER_HEADER, targetServerFor } from "./proxy";
import {
  clearMfaChallenge,
  clearSession,
  getAccessToken,
  getRefreshToken,
  storeSession,
} from "@/core/storage";
import type { Session } from "@/core/session";

const BASE_URL = process.env.GATEWAY_API_URL;
const REFRESH_PATH = "/v1/auth/refresh";
const LOGIN_PATH = "/login";
const AUTH_PREFIX = "/v1/auth/";
const SESSION_BOUND_AUTH_PATHS = ["/v1/auth/logout", "/v1/auth/logout-all"];

/**
 * A 401 from a public auth endpoint means "wrong code" or "expired challenge", not
 * "your session is dead": those must reach the form, never trigger a refresh.
 */
const isPublicAuthPath = (url: string | undefined): boolean =>
  !!url && url.startsWith(AUTH_PREFIX) && !SESSION_BOUND_AUTH_PATHS.includes(url);

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const APIClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

const isJsonResponse = (response: AxiosResponse) =>
  String(response.headers?.["content-type"] ?? "").includes("application/json");

APIClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const target = targetServerFor(config.url);
    if (target) {
      config.headers[GATEWAY_TARGET_SERVER_HEADER] = target;
    }

    const token = getAccessToken();
    if (token && !config.headers["Authorization"]) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    if (config.data && !(config.data instanceof FormData)) {
      config.data = decamelizeKeys(config.data);
    }

    if (config.params) {
      config.params = decamelizeKeys(config.params);
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

/**
 * One refresh at a time: concurrent 401s wait on the same promise and retry with the
 * rotated access token. A failed refresh clears the session and sends the user to /login.
 */
let refreshPromise: Promise<Session> | null = null;

async function refreshSession(): Promise<Session> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("no refresh token");
  }

  const response = await axios.post(
    `${BASE_URL}${REFRESH_PATH}`,
    decamelizeKeys({ refreshToken }),
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        [GATEWAY_TARGET_SERVER_HEADER]: targetServerFor(REFRESH_PATH) ?? "",
      },
      timeout: 15000,
    }
  );

  const session = camelizeKeys(response.data) as unknown as Session;
  storeSession(session);
  return session;
}

function redirectToLogin(): void {
  clearSession();
  clearMfaChallenge();
  if (typeof window !== "undefined" && window.location.pathname !== LOGIN_PATH) {
    window.location.assign(new URL(LOGIN_PATH, window.location.origin).toString());
  }
}

APIClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.data && isJsonResponse(response)) {
      response.data = camelizeKeys(response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    if (error.response?.data && typeof error.response.data === "object") {
      error.response.data = camelizeKeys(error.response.data as object);
    }

    const status = error.response?.status;
    const original = error.config as RetriableConfig | undefined;

    if (status !== 401 || !original || original._retry || isPublicAuthPath(original.url)) {
      return Promise.reject(error);
    }

    if (!getRefreshToken()) {
      redirectToLogin();
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshSession().finally(() => {
          refreshPromise = null;
        });
      }
      const session = await refreshPromise;
      original.headers["Authorization"] = `Bearer ${session.accessToken}`;
      return APIClient(original);
    } catch (refreshError) {
      redirectToLogin();
      return Promise.reject(refreshError);
    }
  }
);

export default APIClient;
