"use client";

import { useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { toast } from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(
          "If an account exists, a password reset link has been sent to your email.",
        );
      }
    });
  }

  return (
    <div className="min-h-dvh flex-1 bg-slate-50/50 flex flex-col justify-center items-center p-4 sm:p-6 py-6 sm:py-12 overflow-y-auto">
      <div className="w-full max-w-md bg-white border border-slate-200/80 p-5 sm:p-8 rounded-2xl shadow-xl shadow-slate-200/50 space-y-5 my-auto">
        <div className="text-center space-y-2 flex flex-col items-center">
          <BrandLogo />
          <h1 className="text-2xl font-bold text-slate-900 pt-1 tracking-tight">
            Reset Password
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Enter your email to receive a password reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="student@example.com"
              className="w-full h-11 px-3.5 bg-slate-50 border border-slate-300 rounded-xl text-base md:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] transition"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-11 bg-[#f59e0b] hover:bg-[#d97706] active:scale-[0.99] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-md shadow-amber-500/10 disabled:opacity-50 disabled:active:scale-100 cursor-pointer mt-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Link...</span>
              </>
            ) : (
              <span>Send Reset Link</span>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 pt-1">
          Remembered your password?{" "}
          <Link
            href="/login"
            className="font-bold text-[#1e3a8a] hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
