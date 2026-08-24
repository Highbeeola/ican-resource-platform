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
            placeholder="e.g. Registration for May 2026 Diet closes on April 15th."
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
              <span>Publishing...</span>
            </>
          ) : (
            <span>Publish Announcement Banner</span>
          )}
        </button>
      </form>

      {/* ACTIVE ANNOUNCEMENTS LIST (WITH REMOVE BUTTON) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">
          Published Announcements ({announcements.length})
        </h3>

        <div className="divide-y divide-slate-800">
          {announcements.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">
              No active announcement banners.
            </p>
          ) : (
            announcements.map((item) => (
              <div
                key={item.id}
                className="py-3 flex justify-between items-center text-xs sm:text-sm"
              >
                <div>
                  <p className="font-bold text-white uppercase">{item.title}</p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {item.content}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
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
