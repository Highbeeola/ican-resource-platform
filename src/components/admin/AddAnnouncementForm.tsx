"use client";

import { useState, useEffect, useTransition } from "react";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAllAnnouncements,
} from "@/lib/actions/announcements";
import {
  Megaphone,
  Loader2,
  CheckCircle,
  AlertCircle,
  Trash2,
} from "lucide-react";

export default function AddAnnouncementForm() {
  const [isPending, startTransition] = useTransition();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Fetch active announcements list
  useEffect(() => {
    getAllAnnouncements().then(setAnnouncements);
  }, [message]);

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

  function handleDelete(id: string) {
    startTransition(async () => {
      const res = await deleteAnnouncement(id);
      if (res.success) {
        setMessage({
          type: "success",
          text: "Announcement banner removed from website!",
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* CREATION FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4 text-slate-900 shadow-sm"
      >
        <h2 className="font-bold text-[#1e3a8a] text-base border-b border-slate-100 pb-3 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-amber-500" />
          <span>Post Exam Broadcast Announcement</span>
        </h2>

        {message && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 text-xs sm:text-sm font-medium ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Announcement Title *
          </label>
          <input
            type="text"
            name="title"
            required
            placeholder="e.g. MAY 2026 ICAN DIET EXAM DATES"
            className="w-full px-4 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Content / Message *
          </label>
          <textarea
            name="content"
            rows={3}
            required
            placeholder="e.g. Registration for May 2026 Diet closes on April 15th."
            className="w-full px-4 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl text-sm transition cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-sm"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Publishing...</span>
            </>
          ) : (
            <span>Publish Announcement Banner</span>
          )}
        </button>
      </form>

      {/* ACTIVE ANNOUNCEMENTS LIST (WITH REMOVE BUTTON) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-[#1e3a8a] text-base border-b border-slate-100 pb-3">
          Published Announcements ({announcements.length})
        </h3>

        <div className="divide-y divide-slate-100">
          {announcements.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">
              No active announcement banners.
            </p>
          ) : (
            announcements.map((item) => (
              <div
                key={item.id}
                className="py-3 flex justify-between items-center text-xs sm:text-sm"
              >
                <div>
                  <p className="font-bold text-slate-900 uppercase">
                    {item.title}
                  </p>
                  <p className="text-slate-600 text-xs mt-0.5">
                    {item.content}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Banner</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
