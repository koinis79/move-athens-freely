import { supabase } from "@/integrations/supabase/client";

export type ClientErrorContext = {
  start_date?: string;
  end_date?: string;
  zone?: string | null;
  code?: string;
  items?: { slug: string; start_date?: string; end_date?: string; quantity?: number }[];
};

/**
 * Log a failed create_booking call to app_errors, so it appears in the hourly
 * alert email instead of only in the customer's browser.
 *
 * Identifiers only — never pass names, emails, phones, addresses or the
 * special-requirements text. report_client_error() drops any key it does not
 * whitelist and rate-limits per message.
 *
 * Fire-and-forget: a failure here must never change what the customer sees.
 */
export function reportClientError(
  source: "checkout" | "admin-new-booking",
  message: string,
  context: ClientErrorContext,
): void {
  // The generated types predate this function; regenerate types.ts to drop the cast.
  (supabase.rpc as unknown as (fn: string, args: Record<string, unknown>) => PromiseLike<unknown>)(
    "report_client_error",
    { p_source: source, p_message: message, p_context: context },
  ).then(undefined, () => {});
}
