"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { GraduationCap, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    startTransition(async () => {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
      } else {
        // HARD REDIRECT ENSURES INSTANT AUTHENTICATION
        window.location.href = "/";
      }
    });
  }

  return (
    <div className="min-h-dvh flex-1 bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-bold text-lg text-[#1e3a8a]"
          >
            <div className="bg-amber-500 p-1.5 rounded-lg text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span>KRL Academy</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#1e3a8a] pt-2">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Log in to access your study materials and pathfinders.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
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
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <span>Log In</span>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-600">
          Don't have an account yet?{" "}
          <Link
            href="/register"
            className="text-amber-600 font-bold hover:underline"
          >
            Register free
          </Link>
        </p>
      </div>
    </div>
  );
}
