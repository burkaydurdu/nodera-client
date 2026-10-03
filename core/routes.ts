/** Signed-out pages; a signed-in user is sent to the dashboard (or on to an invitation). */
export const NO_AUTH_PATHS = [
  "/login",
  "/register",
  "/verify-email",
  "/otp",
  "/forgot-password",
  "/reset-password",
];

/**
 * Pages that render for everyone: the invitation link, the payment confirmation link and the
 * invoice PDF link from the emails must work in every sign-in state.
 */
export const OPEN_PATHS = ["/invitations/accept", "/billing/confirm", "/billing/invoice-pdf"];

export const LOGIN_PATH = "/login";
export const DASHBOARD_PATH = "/dashboard";
export const TEAM_PATH = "/dashboard/team";

export const isOpenPath = (pathname: string): boolean => OPEN_PATHS.includes(pathname);
