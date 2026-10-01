/**
 * Single source of truth for the Nodera design tokens.
 *
 * - `app/globals.css` maps every token here to a Tailwind `@theme` variable
 *   (`--color-brand-600: var(--nodera-brand-600)`), so utilities like `bg-brand-600` exist.
 * - `app/layout.tsx` injects the values as `--nodera-*` custom properties on `:root`
 *   through `buildThemeStyle()`.
 * - `app/ThemeConfig.ts` bridges the same values into Ant Design's ConfigProvider.
 *
 * Changing the palette, radii, spacing or font means editing this file only.
 * Dark mode: add a `dark` entry to `themes` and emit it under `[data-theme="dark"]`
 * (see `buildThemeStyle`); the token names stay the same.
 */

export type BrandScale = Record<
  50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900,
  string
>;

/** Droplet statuses the UI colours; `deleted` rows never render. */
export type StatusToken = "provisioning" | "active" | "off" | "failed" | "deleting";

/** Foreground and soft background of a status badge / timeline dot. */
export interface StatusColor {
  text: string;
  soft: string;
}

export interface ThemeColors {
  brand: BrandScale;
  surface: string;
  surfaceMuted: string;
  surfaceRaised: string;
  border: string;
  text: string;
  textMuted: string;
  textInverse: string;
  danger: string;
  dangerSoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  status: Record<StatusToken, StatusColor>;
}

export interface ThemeRadius {
  card: number;
  input: number;
  button: number;
  badge: number;
}

export interface ThemeSpacing {
  page: number;
  card: number;
  section: number;
  field: number;
  tight: number;
}

export interface ThemeFont {
  sans: string;
  mono: string;
}

export interface ThemeTokens {
  colors: ThemeColors;
  radius: ThemeRadius;
  spacing: ThemeSpacing;
  font: ThemeFont;
}

const brand: BrandScale = {
  50: "#eff6ff",
  100: "#dbeafe",
  200: "#bfdbfe",
  300: "#93c5fd",
  400: "#60a5fa",
  500: "#3b82f6",
  600: "#2563eb",
  700: "#1d4ed8",
  800: "#1e40af",
  900: "#1e3a8a",
};

export const lightTheme: ThemeTokens = {
  colors: {
    brand,
    surface: "#ffffff",
    surfaceMuted: "#f4f6fb",
    surfaceRaised: "#f9fafc",
    border: "#e3e8f0",
    text: "#0f172a",
    textMuted: "#64748b",
    textInverse: "#ffffff",
    danger: "#dc2626",
    dangerSoft: "#fef2f2",
    success: "#16a34a",
    successSoft: "#f0fdf4",
    warning: "#d97706",
    warningSoft: "#fffbeb",
    status: {
      provisioning: { text: "#1d4ed8", soft: "#dbeafe" },
      active: { text: "#15803d", soft: "#dcfce7" },
      off: { text: "#475569", soft: "#e2e8f0" },
      failed: { text: "#b91c1c", soft: "#fee2e2" },
      deleting: { text: "#b45309", soft: "#fef3c7" },
    },
  },
  radius: {
    card: 16,
    input: 10,
    button: 10,
    badge: 999,
  },
  spacing: {
    page: 32,
    card: 32,
    section: 24,
    field: 16,
    tight: 8,
  },
  font: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, "Helvetica Neue", Arial, system-ui, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
  },
};

/** Every theme the app can render. Dark mode slots in here as `dark`. */
export const themes: { light: ThemeTokens; dark?: ThemeTokens } = {
  light: lightTheme,
};

export const CSS_VAR_PREFIX = "--nodera";

const px = (value: number) => `${value}px`;

/** Flattens a token set into `--nodera-*` custom properties. */
export function themeToCssVariables(theme: ThemeTokens): Record<string, string> {
  const vars: Record<string, string> = {};

  for (const [step, value] of Object.entries(theme.colors.brand)) {
    vars[`${CSS_VAR_PREFIX}-brand-${step}`] = value;
  }
  vars[`${CSS_VAR_PREFIX}-surface`] = theme.colors.surface;
  vars[`${CSS_VAR_PREFIX}-surface-muted`] = theme.colors.surfaceMuted;
  vars[`${CSS_VAR_PREFIX}-surface-raised`] = theme.colors.surfaceRaised;
  vars[`${CSS_VAR_PREFIX}-border`] = theme.colors.border;
  vars[`${CSS_VAR_PREFIX}-text`] = theme.colors.text;
  vars[`${CSS_VAR_PREFIX}-text-muted`] = theme.colors.textMuted;
  vars[`${CSS_VAR_PREFIX}-text-inverse`] = theme.colors.textInverse;
  vars[`${CSS_VAR_PREFIX}-danger`] = theme.colors.danger;
  vars[`${CSS_VAR_PREFIX}-danger-soft`] = theme.colors.dangerSoft;
  vars[`${CSS_VAR_PREFIX}-success`] = theme.colors.success;
  vars[`${CSS_VAR_PREFIX}-success-soft`] = theme.colors.successSoft;
  vars[`${CSS_VAR_PREFIX}-warning`] = theme.colors.warning;
  vars[`${CSS_VAR_PREFIX}-warning-soft`] = theme.colors.warningSoft;
  for (const [status, color] of Object.entries(theme.colors.status)) {
    vars[`${CSS_VAR_PREFIX}-status-${status}`] = color.text;
    vars[`${CSS_VAR_PREFIX}-status-${status}-soft`] = color.soft;
  }

  vars[`${CSS_VAR_PREFIX}-radius-card`] = px(theme.radius.card);
  vars[`${CSS_VAR_PREFIX}-radius-input`] = px(theme.radius.input);
  vars[`${CSS_VAR_PREFIX}-radius-button`] = px(theme.radius.button);
  vars[`${CSS_VAR_PREFIX}-radius-badge`] = px(theme.radius.badge);

  vars[`${CSS_VAR_PREFIX}-spacing-page`] = px(theme.spacing.page);
  vars[`${CSS_VAR_PREFIX}-spacing-card`] = px(theme.spacing.card);
  vars[`${CSS_VAR_PREFIX}-spacing-section`] = px(theme.spacing.section);
  vars[`${CSS_VAR_PREFIX}-spacing-field`] = px(theme.spacing.field);
  vars[`${CSS_VAR_PREFIX}-spacing-tight`] = px(theme.spacing.tight);

  vars[`${CSS_VAR_PREFIX}-font-sans`] = theme.font.sans;
  vars[`${CSS_VAR_PREFIX}-font-mono`] = theme.font.mono;

  return vars;
}

const toDeclarations = (vars: Record<string, string>) =>
  Object.entries(vars)
    .map(([name, value]) => `${name}:${value};`)
    .join("");

/** CSS text injected once from the root layout; `:root` is light, `[data-theme="dark"]` when defined. */
export function buildThemeStyle(): string {
  const light = `:root{color-scheme:light;${toDeclarations(themeToCssVariables(themes.light))}}`;
  const dark = themes.dark
    ? `:root[data-theme="dark"]{color-scheme:dark;${toDeclarations(themeToCssVariables(themes.dark))}}`
    : "";
  return `${light}${dark}`;
}
