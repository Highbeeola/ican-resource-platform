"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({
          type: "success",
          text: "If an account exists, a password reset link has been sent to your email.",
        });
      }
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 py-12">
      <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-2xl shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <BrandLogo />
          <h1 className="text-2xl font-bold text-slate-900 pt-2">
            Reset Password
          </h1>
          <p className="text-sm text-slate-600">
            Enter your email to receive a password reset link.
          </p>
        </div>

        {message && (
          <div
            className={`p-3 border rounded-lg text-xs flex items-center gap-2 ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="student@example.com"
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2a52be] transition"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 pt-2">
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
