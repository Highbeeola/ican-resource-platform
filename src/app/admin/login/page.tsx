"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Shield, Loader2, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
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
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      // Verify that the user has admin role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profile?.role !== "admin") {
        await supabase.auth.signOut();
        setError(
          "Access Denied: This account does not have Administrator privileges.",
        );
        return;
      }

      router.push("/admin/resources");
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center mx-auto text-amber-400">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white pt-2">
            Admin Portal Login
          </h1>
          <p className="text-xs text-slate-400">
            Restricted area. Authorized administrator access only.
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
              Admin Email
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="admin@caprep.com"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Admin Privileges...</span>
              </>
            ) : (
              <span>Log In to Admin Portal</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
