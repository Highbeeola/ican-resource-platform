"use client";

import { useState, useTransition } from "react";
import { registerUser } from "@/lib/actions/auth";
import Link from "next/link";
import { BookOpen, Loader2, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await registerUser(formData);
      if (res?.error) {
        setError(res.error);
      }
    });
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* LOGO & TITLE */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-bold text-lg text-white"
          >
            <div className="bg-amber-500 p-1.5 rounded-lg text-slate-950">
              <BookOpen className="w-5 h-5" />
            </div>
            <span>CA Prep Academy</span>
          </Link>
          <h1 className="text-2xl font-bold text-white pt-2">
            Create Your Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Access official ICAN study texts, pathfinders, and past questions.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              required
              placeholder="e.g. Babatunde Adeleke"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="student@example.com"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password *
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              placeholder="Minimum 6 characters"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Register Account</span>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-amber-400 font-semibold hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
