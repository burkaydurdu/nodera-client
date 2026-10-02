/** Billing types as the billing service's contract declares them (snake_case on the wire). */

export type BillingAccountType = "individual" | "company";

export interface BillingProfile {
  teamId: string;
  accountType: BillingAccountType;
  legalName: string;
  country: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  /** VKN for a Turkish company, TCKN for a Turkish individual, otherwise optional. */
  taxId: string;
  /** Turkish companies only. */
  taxOffice: string;
  /** Optional VAT number outside Türkiye. */
  vatId: string;
  invoiceEmail: string;
  createdAt: string;
  updatedAt: string;
}

export type BillingProfilePayload = Omit<BillingProfile, "teamId" | "createdAt" | "updatedAt">;

export interface PaymentMethod {
  id: string;
  teamId: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  /** The currency the card is charged in, fixed when it was saved. */
  currency: string;
  createdAt: string;
}

/** What the hosted card form needs: the browser is sent to `redirectUrl` and comes back. */
export interface CardVerification {
  verificationId: string;
  redirectUrl: string;
}

export interface CompleteCardVerificationPayload {
  verificationId: string;
  /** Every query parameter the provider appended to the return URL, echoed back verbatim. */
  callback: Record<string, string>;
}

/** Stashed for the return page so the right Team completes the verification. */
export interface PendingCardVerification {
  verificationId: string;
  teamId: string;
}

export interface UsageLine {
  dropletId: string;
  hostname: string;
  planCode: string;
  hours: number;
  hourlyPrice: string;
  amount: string;
}

export type ThresholdKind = "new" | "established";

export interface UsageThreshold {
  amount: string;
  kind: ThresholdKind;
}

export interface Usage {
  periodStart: string;
  periodEnd: string;
  lines: UsageLine[];
  subtotal: string;
  estimatedTax: string;
  estimatedTotal: string;
  threshold: UsageThreshold;
}

export type InvoiceKind = "period" | "threshold";
export type InvoiceStatus = "issued" | "paid" | "payment_failed" | "void";

export interface InvoiceSummary {
  id: string;
  number: string;
  kind: InvoiceKind;
  status: InvoiceStatus;
  periodStart: string;
  periodEnd: string;
  currency: string;
  totalDue: string;
  /** The amount actually charged when the card's currency differs (TRY for Turkish Teams). */
  settlementCurrency?: string | null;
  settlementAmount?: string | null;
  issuedAt: string;
  paidAt: string | null;
}

export type InvoiceLine = UsageLine;

export interface TaxLine {
  label: string;
  rateBps: number;
  base: string;
  amount: string;
}

export type PaymentStatus = "pending" | "succeeded" | "failed" | "confirmation_required";

/** Attempts still open: a new "Pay now" would only collide with them (33-10007). */
export const OPEN_PAYMENT_STATUSES: readonly PaymentStatus[] = [
  "pending",
  "confirmation_required",
];

export const isPaymentOpen = (status: PaymentStatus): boolean =>
  OPEN_PAYMENT_STATUSES.includes(status);

export interface Payment {
  id: string;
  invoiceId: string;
  status: PaymentStatus;
  amount: string;
  currency: string;
  failureReason?: string | null;
  /** The hosted 3-D Secure page when the bank insists on confirmation. */
  confirmationUrl?: string | null;
  createdAt: string;
}

export interface Invoice extends InvoiceSummary {
  subtotal: string;
  taxTotal: string;
  creditApplied: string;
  exchangeRate?: string | null;
  exchangeRateDate?: string | null;
  pdfAvailable: boolean;
  lines: InvoiceLine[];
  taxLines: TaxLine[];
  payments: Payment[];
}

/** The newest attempt of an invoice, the one that decides whether Pay now is offered. */
export function latestPayment(payments: Payment[] | null | undefined): Payment | null {
  if (!payments || payments.length === 0) return null;
  return [...payments].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

/** What the public confirm route answers: the Payment's current status, nothing more. */
export interface PaymentConfirmationStatus {
  status: PaymentStatus;
  failureReason?: string | null;
}

/** How the 3-D Secure step is opened: a URL to visit, or an auto-submitting bank form. */
export interface ThreeDSStart {
  htmlContent?: string | null;
  redirectUrl?: string | null;
}

/** Where the bank sends the browser back: `?payment=&result=succeeded|failed`. */
export type ThreeDSResult = "succeeded" | "failed";

export const isThreeDSResult = (value: string | null | undefined): value is ThreeDSResult =>
  value === "succeeded" || value === "failed";

/** Stashed before leaving for the bank so the return can re-read the status with the token. */
export interface PendingPaymentConfirmation {
  paymentId: string;
  token: string;
}

export interface PayInvoicePayload {
  /** Another saved card; the default card when absent. */
  paymentMethodId?: string;
}

export type BillingStatusValue = "no_payment_method" | "active" | "suspended";

export interface BillingStatus {
  status: BillingStatusValue;
  openInvoiceId?: string | null;
  nextRetryAt?: string | null;
  suspendedAt?: string | null;
  deletionAt?: string | null;
}

/** Invoices are priced in USD; usage lines carry no currency of their own. */
export const BILLING_CURRENCY = "USD";

export const TURKEY_COUNTRY_CODE = "TR";

/** Statuses from which "Pay now" makes sense. */
export const PAYABLE_INVOICE_STATUSES: readonly InvoiceStatus[] = ["issued", "payment_failed"];

export const isInvoicePayable = (status: InvoiceStatus): boolean =>
  PAYABLE_INVOICE_STATUSES.includes(status);

export const BILLING_PATH = "/dashboard/team/billing";
export const BILLING_TAB_PARAM = "tab";
export const INVOICE_PARAM = "invoice";
/** The Team an emailed link is about; the billing page selects it when it is not current. */
export const BILLING_TEAM_PARAM = "team";
/** The last four digits of a card just added, carried back from the completion page. */
export const CARD_ADDED_PARAM = "added";

export const BILLING_TABS = ["profile", "payment-methods", "invoices", "usage"] as const;
export type BillingTabKey = (typeof BILLING_TABS)[number];
export const DEFAULT_BILLING_TAB: BillingTabKey = "profile";

export const isBillingTab = (value: string | null | undefined): value is BillingTabKey =>
  !!value && (BILLING_TABS as readonly string[]).includes(value);

export const billingPath = (
  tab?: BillingTabKey,
  invoiceId?: string | null,
  teamId?: string | null
): string => {
  const params = new URLSearchParams();
  if (tab) params.set(BILLING_TAB_PARAM, tab);
  if (invoiceId) params.set(INVOICE_PARAM, invoiceId);
  if (teamId) params.set(BILLING_TEAM_PARAM, teamId);
  const query = params.toString();
  return query ? `${BILLING_PATH}?${query}` : BILLING_PATH;
};

/** Where the provider sends the browser back after the hosted card form. */
export const CARD_COMPLETE_PATH = "/billing/cards/complete";
export const CARD_VERIFICATION_PARAM = "verification";

/** The email link that completes a 3-D Secure payment; public. */
export const PAYMENT_CONFIRM_PATH = "/billing/confirm";
export const PAYMENT_PARAM = "payment";
export const PAYMENT_TOKEN_PARAM = "token";
export const PAYMENT_RESULT_PARAM = "result";

/** The signed invoice PDF link from the invoice-issued email; public. */
export const INVOICE_PDF_PATH = "/billing/invoice-pdf";
export const INVOICE_PDF_EXPIRES_PARAM = "expires";
export const INVOICE_PDF_TOKEN_PARAM = "token";
export const INVOICE_PDF_FALLBACK_FILENAME = "invoice.pdf";

/** Poll interval of the Billing status behind the dashboard banner. */
export const BILLING_STATUS_POLL_INTERVAL_MS = 60_000;

/** Fired after a card or payment changed so the banner refreshes before the next poll. */
export const BILLING_STATUS_CHANGED_EVENT = "nodera:billing-status-changed";

export function notifyBillingStatusChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(BILLING_STATUS_CHANGED_EVENT));
}

const DIGITS_ONLY = /^\d+$/;

/** Turkish tax number of a company: ten digits. */
export function isValidVkn(value: string): boolean {
  return value.length === 10 && DIGITS_ONLY.test(value);
}

/** Turkish national identity number: eleven digits with the standard checksum. */
export function isValidTckn(value: string): boolean {
  if (value.length !== 11 || !DIGITS_ONLY.test(value) || value.startsWith("0")) return false;
  const digits = value.split("").map(Number);
  const odd = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const even = digits[1] + digits[3] + digits[5] + digits[7];
  const tenth = (odd * 7 - even) % 10;
  if ((tenth + 10) % 10 !== digits[9]) return false;
  const sum = digits.slice(0, 10).reduce((total, digit) => total + digit, 0);
  return sum % 10 === digits[10];
}

export type TaxIdRule = "vkn" | "tckn" | "optional";

/** Which identifier the profile form asks for, by country and account type. */
export function taxIdRuleFor(country: string, accountType: BillingAccountType): TaxIdRule {
  if (country !== TURKEY_COUNTRY_CODE) return "optional";
  return accountType === "company" ? "vkn" : "tckn";
}

export const LEGAL_NAME_MAX_LENGTH = 200;
export const ADDRESS_MAX_LENGTH = 200;
export const CITY_MAX_LENGTH = 100;
export const POSTAL_CODE_MAX_LENGTH = 20;
export const TAX_OFFICE_MAX_LENGTH = 100;
export const VAT_ID_MAX_LENGTH = 32;
