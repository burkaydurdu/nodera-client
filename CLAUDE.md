# Project conventions (nodera-client)

This is the **customer web app** (Next.js App Router, port 3002) of the Nodera bare-metal cloud
platform. The Go backend (customer service, customer gateway, notification worker) lives in the
sibling repo `/Users/burkaydurdu/Inf/nodera`; read its spec under `docs/specs/` when a change
touches the API contract. Each repo is its own git repository; commits are the user's.

## Repo layout

```
app/...                  pages (App Router) — orchestration only
components/<Name>/       design-system primitives (Nodera*, Card, FormSection, PageHeader, …)
components/<Feature>/    feature components, one component per folder (Auth/, Teams/, Projects/, Profile/)
api/*.ts                 backend API wrappers (axios client, camel↔snake transform)
core/*.ts                shared types + pure domain helpers (error codes, password rule, …)
contexts/                AuthContext, TeamContext, RoutingContext
hooks/                   shared React hooks
theme/tokens.ts          the palette — single source of truth (see below)
locales/{tr,en}/*.json   i18n — every user-visible string, always both locales
```

## Pages are orchestrators, forms are feature components

A page file (`app/**/page.tsx`) wires data fetching, routing, submit/feedback handling and lays
out its children. The children are **small, focused components**, each in its own folder under
`components/<Feature>/<Component>/index.tsx`.

The rule of thumb: **a form section (a `FormSection` with its own fields), a card, a modal
body, or any block with its own markup + labels gets its own component** instead of growing the
parent inline. Signs you must split:

- the parent renders more than a screenful of JSX,
- a section has its own group of inputs/switches and their handlers,
- the same block would be useful to another screen.

Extracted components are **controlled**: they take `value`/`onChange` (and
`disabled`/`loading`) props and hold no state the owning form needs on submit. State stays in
the form; presentation moves down.

### Do

```tsx
// app/dashboard/profile/page.tsx — orchestrates
<ProfileDetailsForm user={currentUser} onUpdated={setCurrentUser} />
<MfaSettingsCard user={currentUser} onUpdated={setCurrentUser} />

// components/Profile/MfaSettingsCard/index.tsx — the whole MFA block (status row,
// switch, password-confirm modal) lives here.
```

### Don't

```tsx
// page.tsx growing a 60-line inline section — NOT allowed;
// the section belongs in its own component folder.
<Card>{/* switch, modal, handlers … inline */}</Card>
```

## A component is a folder: `index.tsx` + `type.ts`

Every component folder holds its implementation in `index.tsx` and, whenever the component
accepts props, its **props model in a sibling `type.ts`** — exported as `<ComponentName>Props`
and imported back by `index.tsx`. Shapes the props are built from (an option row, a variant
union) live in that same `type.ts`; when several children of one feature share a shape it
belongs to the feature's own `type.ts` (`components/Projects/type.ts` exporting
`ProjectCreatedHandler`, imported by `CreateProjectForm/type.ts`, is the pattern).

A component's accepted shape must be readable **without opening its implementation**, and the
contract has exactly **one home**.

A component that takes **no** props has **no** `type.ts` — the folder stays a bare `index.tsx`
(`LoginCard`, `SessionsList`). Do not add an empty interface to satisfy the pattern. A small
helper rendered only inside that same file may keep its inline annotation; the moment it is
worth reusing, it becomes a folder of its own with a `type.ts`.

### Do

```tsx
// components/Projects/ProjectCard/type.ts
import type { Project } from "@/core/project";

export interface ProjectCardProps {
  project: Project;
  active?: boolean;
  onSelect?: (project: Project) => void;
}

// components/Projects/ProjectCard/index.tsx
import type { ProjectCardProps } from "./type";

export default function ProjectCard({ project, active = false, onSelect }: ProjectCardProps) { … }
```

### Don't

```tsx
export interface ProjectCardProps { … }                       // NOT in index.tsx
export default function ProjectCard({ project }: { project: Project }) { … } // no inline shapes
```

## Other rules that follow from the layout

- **Pages never call axios directly** — every request goes through a wrapper in `api/*.ts`
  (`api/auth.ts`, `api/users.ts`, `api/teams.ts`, `api/projects.ts`). Wrappers take camelCase
  payloads; `api/client.ts` decamelizes on the way out and camelizes on the way in. Shared
  payload/response types live in `core/`.
- **No hardcoded user-visible strings** — every label/hint/message is a key in
  `locales/tr/common.json` **and** `locales/en/common.json`, read with `useTranslations`.
  `yarn locale:validate` fails when the key sets differ. Turkish must read naturally.
- **API errors** are turned into messages by `useErrorMessage()` (`errors.<domain>-<code>`,
  fallback `errors.wrong`, 429 → countdown from `Retry-After`). Branch on codes with
  `IsErrorCode(error, ErrorCode.X)` from `core/error.ts`, never on message text.
- **Reuse the design-system primitives** (`NoderaButton`, `NoderaTextField`, `NoderaSelect`,
  `NoderaCheckbox`, `NoderaAlert`, `NoderaResultModal`, `FormSection`, `PageHeader`, `EmptyBox`,
  `Card`, `CodeInput`, `PasswordChecklist`, …) instead of styling raw antd/HTML inputs. New
  shared primitives go in `components/<Name>/` with the `Nodera` prefix.
- **The palette has one source: `theme/tokens.ts`.** Never write a hex colour in a component,
  in `globals.css` or in `ThemeConfig.ts`. Use the Tailwind utilities the tokens generate
  (`bg-brand-600`, `text-text-muted`, `border-border`, `rounded-card`, `p-card`, `gap-field`) or
  antd tokens. A new token is added to `theme/tokens.ts` (+ `themeToCssVariables`) and to the
  `@theme` block in `app/globals.css`.
- **Auth state** comes from `useAuth()` (`currentUser`, `setSession`, `logout`, `refreshUser`);
  the selected Team from `useTeam()` (`teams`, `currentTeam`, `selectTeam`, `addTeam`) — pages
  never call `GetTeams` themselves. Storage keys live in `core/storage.ts`. Public routes are listed once in
  `contexts/RoutingContext/RoutingContext.tsx` (`NO_AUTH_PATHS`).

## Before committing

`yarn check-format`, `yarn check-lint`, `yarn check-types`, `yarn locale:validate` must pass
(the pre-commit hook runs them); run `yarn build` before opening a pull request.
