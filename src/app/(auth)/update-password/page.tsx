"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import toast from "react-hot-toast";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("password") as string;

    startTransition(async () => {
      const supabase = createClient();

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        toast.error(updateError.message);
      } else {
        await supabase.auth.signOut()
        toast.success("Password updated successfully! Please log in with your new password.");
        window.location.href = "/login";
      }
    });
  }

  return (
    <div className="min-h-dvh flex-1 bg-slate-50/50 flex flex-col justify-center items-center p-4 sm:p-6 py-6 sm:py-12 overflow-y-auto">
      <div className="w-full max-w-md bg-white border border-slate-200/80 p-5 sm:p-8 rounded-2xl shadow-xl shadow-slate-200/50 space-y-5 my-auto">
        <div className="text-center space-y-2 flex flex-col items-center">
          <BrandLogo />
          <h1 className="text-2xl font-bold text-slate-900 pt-1 tracking-tight">
            Set New Password
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Please enter a strong new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                minLength={6}
                placeholder="Minimum 6 characters"
                className="w-full h-11 pl-3.5 pr-11 bg-slate-50 border border-slate-300 rounded-xl text-base md:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 cursor-pointer transition"
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

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-11 bg-[#f59e0b] hover:bg-[#d97706] active:scale-[0.99] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-md shadow-amber-500/10 disabled:opacity-50 disabled:active:scale-100 cursor-pointer mt-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Password...</span>
              </>
            ) : (
              <span>Save Password & Login</span>
            )}
          </button>
        </form>

        <div className="flex flex-col items-center gap-3 pt-4 border-t border-slate-100 mt-6">
          <Link
            href="/login"
            className="text-sm font-semibold text-[#1e3a8a] hover:underline"
          >
            Cancel & Return to Login
          </Link>
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-slate-800 transition"
          >
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
