"use client";

import { useState, useTransition } from "react";
import { promoteUserToAdmin } from "@/lib/actions/admin";
import {
  ShieldCheck,
  UserPlus,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function ManageFacultyForm() {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const res = await promoteUserToAdmin(email);
      if (res?.error) {
        setMessage({ type: "error", text: res.error });
      } else if (res?.message) {
        setMessage({ type: "success", text: res.message });
        setEmail("");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 text-white"
    >
      <div className="border-b border-slate-800 pb-3">
        <h2 className="font-bold text-white text-base flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          <span>Grant Faculty & Lecturer Privileges</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Promote a registered user account to Faculty/Admin status. Ask new
          lecturers to create an account at{" "}
          <strong className="text-amber-400">/register</strong> first.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-xs sm:text-sm font-medium ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">
          Lecturer Registered Email Address *
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. newlecturer@caprep.com"
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Verifying & Promoting User...</span>
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            <span>Grant Faculty Access</span>
          </>
        )}
      </button>
    </form>
  );
}
