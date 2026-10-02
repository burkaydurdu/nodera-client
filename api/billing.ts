import APIClient from "./client";
import type {
  BillingProfile,
  BillingProfilePayload,
  BillingStatus,
  CardVerification,
  CompleteCardVerificationPayload,
  Invoice,
  InvoiceSummary,
  PayInvoicePayload,
  Payment,
  PaymentConfirmationStatus,
  PaymentMethod,
  ThreeDSStart,
  Usage,
} from "@/core/billing";

const teamBilling = (teamId: string) => `/v1/teams/${teamId}/billing`;

export const GetProfile = (teamId: string) =>
  APIClient.get<BillingProfile>(`${teamBilling(teamId)}/profile`);

export const PutProfile = (teamId: string, payload: BillingProfilePayload) =>
  APIClient.put<BillingProfile>(`${teamBilling(teamId)}/profile`, payload);

export const ListPaymentMethods = (teamId: string) =>
  APIClient.get<PaymentMethod[]>(`${teamBilling(teamId)}/payment-methods`);

export const StartCardVerification = (teamId: string) =>
  APIClient.post<CardVerification>(`${teamBilling(teamId)}/payment-methods/verify`);

/**
 * The provider's callback parameters go back exactly as they arrived; only the envelope key
 * is written in the wire's snake_case here, since the interceptor is told to leave the body.
 */
export const CompleteCardVerification = (
  teamId: string,
  payload: CompleteCardVerificationPayload
) =>
  APIClient.post<PaymentMethod>(
    `${teamBilling(teamId)}/payment-methods/verify/complete`,
    { verification_id: payload.verificationId, callback: payload.callback },
    { preserveKeys: true }
  );

export const SetDefaultPaymentMethod = (teamId: string, methodId: string) =>
  APIClient.put<PaymentMethod>(`${teamBilling(teamId)}/payment-methods/${methodId}/default`);

export const DeletePaymentMethod = (teamId: string, methodId: string) =>
  APIClient.delete<void>(`${teamBilling(teamId)}/payment-methods/${methodId}`);

export const GetUsage = (teamId: string) =>
  APIClient.get<Usage>(`${teamBilling(teamId)}/usage`);

export const ListInvoices = (teamId: string) =>
  APIClient.get<InvoiceSummary[]>(`${teamBilling(teamId)}/invoices`);

export const GetInvoice = (teamId: string, invoiceId: string) =>
  APIClient.get<Invoice>(`${teamBilling(teamId)}/invoices/${invoiceId}`);

export const DownloadInvoicePdf = (teamId: string, invoiceId: string) =>
  APIClient.get<Blob>(`${teamBilling(teamId)}/invoices/${invoiceId}/pdf`, {
    responseType: "blob",
    headers: { Accept: "application/pdf" },
  });

/**
 * Public, signed by the email link (`expires` + `token`): works signed out and never triggers
 * the refresh path on a 401. The PDF arrives as a Blob.
 */
export const DownloadInvoicePdfByToken = (invoiceId: string, expires: string, token: string) =>
  APIClient.get<Blob>(`/v1/billing/invoices/${invoiceId}/pdf`, {
    params: { expires, token },
    responseType: "blob",
    headers: { Accept: "application/pdf" },
  });

export const PayInvoice = (
  teamId: string,
  invoiceId: string,
  payload: PayInvoicePayload = {}
) => APIClient.post<Payment>(`${teamBilling(teamId)}/invoices/${invoiceId}/pay`, payload);

export const GetBillingStatus = (teamId: string) =>
  APIClient.get<BillingStatus>(`${teamBilling(teamId)}/status`);

/**
 * Public, token-scoped: works signed out and never triggers the refresh path on a 401. Reads
 * the Payment's current status; it never moves the Payment on its own.
 */
export const ConfirmPayment = (paymentId: string, token: string) =>
  APIClient.get<PaymentConfirmationStatus>(`/v1/billing/payments/${paymentId}/confirm`, {
    params: { token },
  });

/** Public, token-scoped: opens the bank's 3-D Secure step for a Payment awaiting it. */
export const StartPaymentThreeDS = (paymentId: string, token: string) =>
  APIClient.post<ThreeDSStart>(`/v1/billing/payments/${paymentId}/3ds/start`, undefined, {
    params: { token },
  });
