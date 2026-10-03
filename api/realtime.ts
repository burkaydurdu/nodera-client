import { camelizeKeys } from "humps";
import type { RealtimeEnvelope } from "@/core/realtime";
import type { SessionRenewal } from "./client";

const REALTIME_PATH = "/v1/realtime";

/** The token was refused: expired, its session revoked, or its permissions stale (ADR-0005). */
export const CLOSE_UNAUTHORIZED = 4401;
/** The auth frame came later than the server waits for it. */
export const CLOSE_AUTH_TIMEOUT = 4408;

const RECONNECT_BASE_MS = 1_000;
const RECONNECT_MAX_MS = 30_000;
/** Enough doublings to reach the cap; keeps the exponent from growing without end. */
const MAX_ATTEMPT = 6;

/** The gateway's base URL on the WebSocket scheme (http → ws, https → wss). */
export const realtimeUrl = (baseUrl: string = process.env.GATEWAY_API_URL ?? ""): string =>
  `${baseUrl.replace(/\/+$/, "").replace(/^http/, "ws")}${REALTIME_PATH}`;

export interface RealtimeConnectionOptions {
  url: string;
  getToken: () => string | null;
  /** Runs after the server refused the token; says whether a reconnect is worth trying. */
  renewSession: () => Promise<SessionRenewal>;
  onMessage: (message: RealtimeEnvelope) => void;
  /** A new socket is ready after an earlier one was lost: whatever was pushed meanwhile is missing. */
  onResumed: () => void;
}

const parseFrame = (raw: unknown): RealtimeEnvelope | null => {
  if (typeof raw !== "string") return null;
  try {
    const frame = JSON.parse(raw) as unknown;
    if (!frame || typeof frame !== "object") return null;
    const envelope = camelizeKeys(frame as object) as RealtimeEnvelope;
    return typeof envelope.type === "string" ? envelope : null;
  } catch {
    return null;
  }
};

/**
 * The tab's one socket to the realtime service. Browsers cannot put a header on the handshake,
 * so the access token travels in the first frame and again after every refresh. Every socket
 * gets its own handlers, and each checks it is still the current socket first, so a socket
 * being replaced can never deliver or reconnect twice.
 */
export class RealtimeConnection {
  private readonly options: RealtimeConnectionOptions;
  private socket: WebSocket | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private attempt = 0;
  private running = false;
  private renewing = false;
  /** Some socket of this connection was ready before; the next ready one resumes after a gap. */
  private wasReady = false;
  /** The token the last auth frame carried, to tell a refused token from one replaced since. */
  private sentToken: string | null = null;

  constructor(options: RealtimeConnectionOptions) {
    this.options = options;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.schedule(0);
  }

  stop(): void {
    this.running = false;
    this.clearTimer();
    this.closeSocket();
  }

  /** A sign-in, a refresh or a sign-out, here or in another tab. */
  tokenChanged(token: string | null): void {
    if (!this.running) return;
    if (!token) {
      // No session, no socket: it opens again once a token is stored.
      this.clearTimer();
      this.closeSocket();
      return;
    }
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.authenticate(this.socket, token);
      return;
    }
    if (!this.socket && !this.timer && !this.renewing) this.schedule(0);
  }

  /** The tab is visible or online again: a reconnect waiting out its backoff goes now. */
  wake(): void {
    if (!this.running || this.socket || this.renewing) return;
    this.schedule(0);
  }

  private connect(): void {
    this.timer = null;
    if (!this.running || this.socket) return;
    if (!this.options.getToken()) return;

    const socket = new WebSocket(this.options.url);
    this.socket = socket;
    let ready = false;

    socket.onopen = () => {
      if (this.socket !== socket) return;
      const token = this.options.getToken();
      if (token) this.authenticate(socket, token);
      else this.closeSocket();
    };

    socket.onmessage = (event: MessageEvent) => {
      if (this.socket !== socket) return;
      const frame = parseFrame(event.data);
      if (!frame) return;
      if (frame.type !== "ready") {
        this.options.onMessage(frame);
        return;
      }
      // Every re-sent token is answered with another "ready"; only the first one starts a socket.
      if (ready) return;
      ready = true;
      this.attempt = 0;
      if (this.wasReady) this.options.onResumed();
      this.wasReady = true;
    };

    socket.onclose = (event: CloseEvent) => {
      if (this.socket !== socket) return;
      this.socket = null;
      if (!this.running) return;
      if (event.code === CLOSE_UNAUTHORIZED) {
        void this.renew();
        return;
      }
      // 4408 (auth too late), 1001 (server going away) and anything else: a fresh socket.
      this.scheduleReconnect();
    };
  }

  private authenticate(socket: WebSocket, token: string): void {
    socket.send(JSON.stringify({ type: "auth", token }));
    this.sentToken = token;
  }

  private async renew(): Promise<void> {
    // The HTTP client or another tab may already have rotated the refused token; reconnecting
    // with the new one spares a second rotation of the same refresh token.
    const stored = this.options.getToken();
    if (stored && stored !== this.sentToken) {
      this.scheduleReconnect();
      return;
    }
    this.renewing = true;
    let outcome: SessionRenewal;
    try {
      outcome = await this.options.renewSession();
    } finally {
      this.renewing = false;
    }
    if (!this.running || outcome === "signed-out") return;
    // Through the backoff, so a token the server keeps refusing cannot loop on refreshes.
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    const ceiling = Math.min(RECONNECT_MAX_MS, RECONNECT_BASE_MS * 2 ** this.attempt);
    this.attempt = Math.min(this.attempt + 1, MAX_ATTEMPT);
    // Half fixed, half random: tabs dropped by the same restart do not return in lockstep.
    this.schedule(ceiling / 2 + Math.random() * (ceiling / 2));
  }

  private schedule(delayMs: number): void {
    this.clearTimer();
    this.timer = setTimeout(() => this.connect(), delayMs);
  }

  private clearTimer(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  private closeSocket(): void {
    const socket = this.socket;
    this.socket = null;
    if (!socket) return;
    socket.onopen = null;
    socket.onmessage = null;
    socket.onclose = null;
    if (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN) {
      socket.close(1000);
    }
  }
}
