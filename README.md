# nodera-client

Customer web app of **Nodera**, the self-service bare-metal cloud platform. Phase 1 covers
sign-up with email verification, sign-in with email MFA, password recovery, the profile page
(details, password, MFA, sessions) and the dashboard whose first step is creating a Project.

Stack: Next.js 16 (App Router, `proxy.ts`), React 19, TypeScript 5, Ant Design 6, Tailwind CSS 4,
next-intl 4, axios + humps. Node 20.9+ and `yarn` (classic) are required; `jq` is needed for the
locale check.

## Run

```bash
cp .env.example .env      # optional — every variable has a dev default
yarn install
yarn dev                  # http://localhost:3002
```

The app talks to the customer gateway (`GATEWAY_API_URL`, default `http://localhost:3460`).
Every request carries `X-Target-Server`, chosen by `api/proxy.ts` from the path: catalog and
Droplet routes go to `droplet`, everything else to `customer`. Start the Go backend from the
sibling `nodera` repository first.

Other scripts:

| Script                 | What it does                                                  |
| ---------------------- | ------------------------------------------------------------- |
| `yarn build` / `start` | Production build (standalone output) and server on port 3002  |
| `yarn check-types`     | `tsc --noEmit`                                                |
| `yarn check-lint`      | ESLint (next/core-web-vitals + prettier)                      |
| `yarn check-format`    | Prettier check; `yarn format` rewrites                        |
| `yarn locale:validate` | `locales/tr` and `locales/en` must have exactly the same keys |
| `yarn test-all`        | format + lint + types + locales + build                       |

The husky pre-commit hook runs format, lint, type and locale checks (not the build).

## Environment

Variables are inlined at build time through `next.config.mjs` (`env`), so a change needs a
rebuild. See `.env.example`.

| Variable          | Default                 | Meaning                                       |
| ----------------- | ----------------------- | --------------------------------------------- |
| `ENV`             | `dev`                   | Deployment environment name                   |
| `GATEWAY_API_URL` | `http://localhost:3460` | Customer gateway base URL (no trailing slash) |

## Structure

```
app/                     App Router pages — orchestration only (data, routing, layout)
  layout.tsx             providers, injects the design tokens, loads i18n messages
  ThemeConfig.ts         Ant Design theme derived from theme/tokens.ts
  globals.css            Tailwind layers + @theme mapping of the tokens
  actions/locale.ts      server action that writes the NEXT_LOCALE cookie
  login, register, verify-email, otp, forgot-password, reset-password
  dashboard/             projects list (empty state = create first project)
  dashboard/projects/new full-page create form
  dashboard/projects/[projectId]              the Project page: its Droplet list (polls while provisioning)
  dashboard/projects/[projectId]/droplets/new create-Droplet flow (Region, Plan, Image, hostname, SSH keys)
  dashboard/droplets/[dropletId]              Droplet detail: IPs, locked price, timeline, power/delete
  dashboard/catalog      Regions and Plans with hourly / monthly prices
  dashboard/team/ssh-keys the Team's SSH keys
  dashboard/profile      details, password, MFA, sessions
api/                     axios client (bearer, X-Target-Server per path, camel↔snake, refresh-once
                         on 401) and one wrapper file per backend area (auth, users, teams,
                         projects, catalog, droplets, sshKeys)
components/              design-system primitives (Nodera*, Card, FormSection, PageHeader,
                         EmptyBox, DashboardLayout, Navbar, SideMenu, CodeInput, …)
components/<Feature>/    feature components: Auth/, Teams/, Projects/, Profile/
contexts/                AuthContext (session + current user), TeamContext (teams + selected
                         team), RoutingContext (auth guard)
core/                    shared types and pure helpers (error codes, password rule, countries,
                         storage keys, locale)
hooks/                   useCountdown, useErrorMessage, useNavigate, useSetLanguage
i18n/request.ts          next-intl config: locale from the NEXT_LOCALE cookie (default en)
locales/{tr,en}/         every user-visible string, both locales, same keys
theme/tokens.ts          THE palette / radii / spacing / font — single source of truth
utils/                   error helpers (envelope → i18n key, Retry-After), date formatting
proxy.ts                 `?lang=tr|en` → cookie + redirect
```

Conventions are in `CLAUDE.md`: pages orchestrate, every component is a folder with `index.tsx`
and a `type.ts` exporting `<Name>Props`, pages never call axios, no hardcoded strings.

## Changing the palette (or radii, spacing, font)

Edit **`theme/tokens.ts`** only.

- `lightTheme.colors.brand` is the 50–900 brand scale (600 is the primary), the rest are
  semantic colours (`surface`, `border`, `text`, `danger`, …).
- `app/layout.tsx` calls `buildThemeStyle()` and injects the values as `--nodera-*` CSS custom
  properties on `:root`.
- `app/globals.css` maps them to Tailwind's `@theme` (`--color-brand-600: var(--nodera-brand-600)`),
  which is what makes `bg-brand-600`, `text-text-muted`, `rounded-card`, `p-card` … exist.
- `app/ThemeConfig.ts` reads the same object for Ant Design's `ConfigProvider` tokens.

Adding a **new** token needs one line in `theme/tokens.ts` (+ `themeToCssVariables`) and one
line in the `@theme` block; changing an existing value never touches CSS. Dark mode is
prepared: add a `dark` entry to `themes` in `theme/tokens.ts` and `buildThemeStyle()` emits it
under `:root[data-theme="dark"]`.

## Auth behaviour

- Tokens live in `localStorage` (`nodera.access_token`, `nodera.refresh_token`); the selected
  team in `nodera.last_team_id`, the last used project in `nodera.last_project_id`; the pending
  MFA challenge in `sessionStorage`.
- `TeamContext` loads `/v1/teams` once the user is known, restores the stored team (or the
  first one) and exposes `selectTeam`/`addTeam`; the `TeamSwitcher` in the navbar switches or
  creates teams. Switching a team clears the remembered project.
- On a 401 the client refreshes once (concurrent 401s wait on the same refresh), retries the
  original request, and on a failed refresh clears the tokens and goes to `/login`.
- `RoutingContext` sends signed-in users away from the public pages and signed-out users to
  `/login`; `/` resolves to the dashboard or the login page.
- API errors are mapped to `errors.<domain>-<code>` in the locale files, with `errors.wrong`
  as the fallback; 429 responses show a countdown from `Retry-After`.

## Docker

```bash
docker build -t nodera-client --build-arg GATEWAY_API_URL=https://gateway.example.com .
docker run -p 3002:3002 nodera-client
```
