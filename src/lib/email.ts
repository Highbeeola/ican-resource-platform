// Sends email through Resend's HTTP API (no extra package needed).
// Until RESEND_API_KEY and EMAIL_FROM are set, it logs a warning and skips,
// so the rest of the app keeps working while email is being set up.

type Mail = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendEmail({ to, subject, html, replyTo }: Mail) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM; // e.g. "KRL Academy <noreply@yourdomain.com>"

  if (!key || !from) {
    console.warn(`[email] Not configured, skipping: "${subject}"`);
    return { skipped: true as const };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  if (!res.ok) {
    console.error("[email] Resend error:", res.status, await res.text());
    return { error: true as const };
  }

  return { sent: true as const };
}

// Escape user-provided text before putting it in an HTML email
export const esc = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
