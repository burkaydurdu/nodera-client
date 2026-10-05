# nodera-client

Customer web app of **Nodera**, the self-service bare-metal cloud platform. Phase 1 covers
sign-up with email verification, sign-in with email MFA, password recovery, the profile page
(details, password, MFA, sessions) and the dashboard whose first step is creating a Project.

Stack: Next.js 16 (App Router, `proxy.ts`), React 19, TypeScript 5, Ant Design 6, Tailwind CSS 4,
next-intl 4, axios + humps. Node 20.9+ and `yarn` (classic) are required; `jq` is needed for the
locale check.

## Run

```bash
cp .env.example .env      # optional — only the SMTP host has no dev default
yarn install
yarn dev                  # http://localhost:3002
```

The app talks to the customer gateway (`GATEWAY_API_URL`, default `http://localhost:3460`).
Every request carries `X-Target-Server`, chosen by `api/proxy.ts` from the path: catalog and
Droplet routes go to `droplet`, `/v1/teams/:id/billing/*` and `/v1/billing/*` to `billing`,
`/v1/notifications/*` to `notification`, `/v1/mail/*` and `/v1/projects/:id/mail/*` to `mail`,
everything else (a Project's API keys included) to `customer`. Start the Go backend from the
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

| Variable              | Default                                   | Meaning                                                                           |
| --------------------- | ----------------------------------------- | --------------------------------------------------------------------------------- |
| `ENV`                 | `dev`                                     | Deployment environment name                                                       |
| `GATEWAY_API_URL`     | `http://localhost:3460`                   | Customer gateway base URL (no trailing slash)                                     |
| `MAIL_SMTP_HOST`      | none                                      | Mail's SMTP host, shown in the SMTP settings; unset, "Not configured"             |
| `INTEGRATION_API_URL` | `http://localhost:3470` in dev, else none | Integration gateway base URL the Mail send example calls; unset, "not configured" |

## Structure

```
app/                     App Router pages — orchestration only (data, routing, layout)
  layout.tsx             providers, injects the design tokens, loads i18n messages
  ThemeConfig.ts         Ant Design theme derived from theme/tokens.ts
  globals.css            Tailwind layers + @theme mapping of the tokens
  actions/locale.ts      server action that writes the NEXT_LOCALE cookie
  login, register, verify-email, otp, forgot-password, reset-password
  dashboard/             the Droplets App's projects list (empty state = create first project)
  dashboard/projects/new full-page create form
  dashboard/projects/[projectId]              the Project page: its Droplet list (polls while provisioning)
  dashboard/projects/[projectId]/droplets/new create-Droplet flow (Region, Plan, Image, hostname, SSH keys)
  dashboard/projects/[projectId]/settings     Project settings: details, and the API keys tab
  dashboard/projects/[projectId]/api-keys     the Project's API keys (apikey.write), secret shown once
  dashboard/mail         the Mail App's entry: opens the remembered Project's overview; email links
                         carry `?team=&project=`
  dashboard/projects/[projectId]/mail         Mail overview: Package, usage, Daily limit, rates, SMTP
  dashboard/projects/[projectId]/mail/domains Sending domains (`/[domainId]`: DNS records, verify now)
  dashboard/projects/[projectId]/mail/logs    Messages of 30 days with filters and a detail drawer;
                                              `?message=` opens one (a Suppression links its own)
  dashboard/projects/[projectId]/mail/suppressions, …/mail/webhooks
  dashboard/droplets/[dropletId]              Droplet detail: IPs, locked price, timeline, power/delete
  dashboard/catalog      Regions and Plans with hourly / monthly prices
  dashboard/team         Team settings: Members (roles, remove, leave) and Invitations tabs
  dashboard/team/ssh-keys the Team's SSH keys (third tab of the Team area)
  dashboard/team/billing  Billing (fourth tab, billing.read): Profile, Payment methods, Invoices
                         (`?invoice=` opens one), Usage — sub-tab in `?tab=`
  billing/cards/complete  return page of the hosted card form (signed in)
  billing/confirm         3-D Secure payment confirmation link (works in every sign-in state)
  billing/invoice-pdf     signed invoice PDF link from the email (works in every sign-in state)
  dashboard/profile      details, password, MFA, sessions
  invitations/accept     accept page of the invitation email link (works in every sign-in state)
api/                     axios client (bearer, X-Target-Server per path, camel↔snake, refresh-once
                         on 401) and one wrapper file per backend area (auth, users, teams,
                         members, invitations, projects, catalog, droplets, sshKeys, billing)
components/              design-system primitives (Nodera*, Card, FormSection, PageHeader,
                         EmptyBox, DashboardLayout, Navbar, SideMenu, CodeInput, …)
components/<Feature>/    feature components: Auth/, Teams/, Members/, Invitations/, Projects/,
                         Droplets/, SSHKeys/, Billing/, Profile/
contexts/                AuthContext (session + current user), TeamContext (teams + selected
                         team), ProjectContext (the Team's Projects for the shared selector),
                         MailProjectContext (the Mail pages' confirmed Project),
                         InvitationContext (pending invitations badge), RoutingContext
                         (auth guard)
core/                    shared types and pure helpers (error codes, password rule, countries,
                         storage keys, locale, authz role matrix)
hooks/                   useCountdown, useErrorMessage, useNavigate, useSetLanguage, useCan,
                         useAfterSignIn
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
  team in `nodera.last_team_id`, the last used project in `nodera.last_project_id`, the last
  App (Droplets or Mail) in `nodera.last_app`; the pending MFA challenge in `sessionStorage`.
- The top bar carries the Team switcher (with Team settings and Billing), the shared Project
  selector, the App switcher and the account menu; the side menu belongs to the current App.
  A page both Apps share (Team settings, a Project's API keys) keeps the last App's menu.
- `TeamContext` loads `/v1/teams` once the user is known, restores the stored team (or the
  first one) and exposes `selectTeam`/`addTeam`; the `TeamSwitcher` in the navbar switches or
  creates teams. Switching a team clears the remembered project.
- On a 401 the client refreshes once (concurrent 401s wait on the same refresh), retries the
  original request, and on a failed refresh clears the tokens and goes to `/login`.
- `RoutingContext` sends signed-in users away from the public pages and signed-out users to
  `/login`; `/` resolves to the dashboard or the login page. `/invitations/accept` is open to
  both; `/login?invitation=` and `/register?invitation=` carry the token through sign-in
  (sessionStorage `nodera.pending_invitation`) so the flow ends on the accept page or, after a
  sign-up, on the invited Team.
- Roles (`owner`, `developer`, `finance`) come with each Team from `/v1/teams`; `useCan(permission)`
  mirrors the backend matrix (`core/authz.ts`) to hide controls. The server stays the authority.
- API errors are mapped to `errors.<domain>-<code>` in the locale files, with `errors.wrong`
  as the fallback; 429 responses show a countdown from `Retry-After`.

## Docker

```bash
docker build -t nodera-client --build-arg GATEWAY_API_URL=https://gateway.example.com .
docker run -p 3002:3002 nodera-client
```
