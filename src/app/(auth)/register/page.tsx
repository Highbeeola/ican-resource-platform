"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

export default function RegisterPage() {
  const [isPending, startTransition] = useTransition();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const levelId = formData.get("levelId") as string;

    startTransition(async () => {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, level_id: levelId || null } },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        window.location.href = "/";
      }
    });
  }

  async function handleGoogleLogin() {
    setIsGoogleLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setIsGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex-1 bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 py-12 overflow-y-auto">
      <div className="w-full max-w-md bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6 my-auto">
        <div className="text-center space-y-2">
          <BrandLogo />
          <h1 className="text-2xl font-bold text-[#1e3a8a] pt-2">
            Create Your Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Access ICAN study texts, pathfinders, and past questions.
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
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              required
              placeholder="e.g. Babatunde Adeleke"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address *
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
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                minLength={6}
                placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Level (Optional)
            </label>
            <select
              name="levelId"
              defaultValue=""
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition cursor-pointer"
            >
              <option value="" disabled className="bg-white text-slate-400">
                Select your current level...
              </option>
              <option value="foundation" className="bg-white text-slate-900">
                ICAN Foundation
              </option>
              <option value="skills" className="bg-white text-slate-900">
                ICAN Skills
              </option>
              <option value="professional" className="bg-white text-slate-900">
                ICAN Professional
              </option>
              <option value="atswa" className="bg-white text-slate-900">
                ATSWA Levels
              </option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isPending || isGoogleLoading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
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

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-slate-500">
              Or continue with
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading || isPending}
          className="w-full py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-sm flex items-center justify-center gap-2 transition shadow-xs disabled:opacity-50 cursor-pointer"
        >
          {isGoogleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          <span>Google</span>
        </button>

        <p className="text-center text-xs text-slate-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#1e3a8a] font-bold hover:underline"
          >
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}
