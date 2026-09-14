import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // Catch Supabase errors (like "otp_expired" from old email links)
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (error) {
    // Redirect them to the login page with the exact error message
    return NextResponse.redirect(
      `${origin}/forgot-password?error=${encodeURIComponent(errorDescription || "Link expired")}`,
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error: sessionError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!sessionError) {
      // Success! Send them to /update-password
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Fallback for any other weird issues
  return NextResponse.redirect(
    `${origin}/forgot-password?error=Invalid_or_expired_reset_link`,
  );
}
