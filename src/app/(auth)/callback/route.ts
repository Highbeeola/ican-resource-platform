import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // The "next" param is what we passed earlier: "?next=/update-password"
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    // 1. Exchange the temporary code for a secure session cookie
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 2. Success! Send them to the update-password page
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 3. If the link is expired or invalid, send them back to login
  return NextResponse.redirect(
    `${origin}/login?error=Invalid_or_expired_reset_link`,
  );
}
