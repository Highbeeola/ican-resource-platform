"use client";

import { useState, useTransition } from "react";
import { createAnnouncement } from "@/lib/actions/announcements";
import { Megaphone, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function AddAnnouncementForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createAnnouncement(formData);
      if (res?.error) {
        setMessage({ type: "error", text: res.error });
      } else {
        setMessage({
          type: "success",
          text: "Announcement banner published live!",
        });
        form.reset();
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 text-white"
    >
      <h2 className="font-bold text-white text-base border-b border-slate-800 pb-3 flex items-center gap-2">
        <Megaphone className="w-5 h-5 text-amber-400" />
        <span>Post Exam Broadcast Announcement</span>
      </h2>

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
          Announcement Title *
        </label>
        <input
          type="text"
          name="title"
          required
          placeholder="e.g. MAY 2026 ICAN DIET EXAM DATES"
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">
          Content / Message *
        </label>
        <textarea
          name="content"
          rows={3}
          required
          placeholder="e.g. Registration for May 2026 Diet closes on April 15th. Download latest pathfinders below."
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Publishing Announcement...</span>
          </>
        ) : (
          <span>Publish Announcement Banner</span>
        )}
      </button>
    </form>
  );
}
