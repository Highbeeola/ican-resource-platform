"use client";

import { useState, useTransition } from "react";
import { promoteUserToAdmin } from "@/lib/actions/admin";
import { ShieldCheck, UserPlus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ManageFacultyForm() {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(async () => {
      const res = await promoteUserToAdmin(email);
      if (res?.error) {
        toast.error(res.error);
      } else if (res?.message) {
        toast.success(res.message);
        setEmail("");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4 text-slate-900 shadow-sm"
    >
      <div className="border-b border-slate-100 pb-3">
        <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-500" />
          <span>Grant Faculty & Lecturer Privileges</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Promote a registered user account to Faculty/Admin status. Ask new
          lecturers to create an account at{" "}
          <strong className="text-amber-600">/register</strong> first.
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Lecturer Registered Email Address *
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. newlecturer@caprep.com"
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl text-sm transition cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-sm"
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
