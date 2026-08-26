"use client";

import { useState, useTransition } from "react";
import { Level, Subject } from "@/types";
import { createVideo } from "@/lib/actions/videos";
import { Video, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface Props {
  levels: Level[];
  subjects: Subject[];
}

export default function VideoUploadForm({ levels, subjects }: Props) {
  const [selectedLevelId, setSelectedLevelId] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const filteredSubjects = subjects.filter(
    (sub: Subject) => sub.level_id === selectedLevelId,
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createVideo(formData);
      if (res?.error) {
        setMessage({ type: "error", text: res.error });
      } else {
        setMessage({
          type: "success",
          text: "Video lecture published successfully!",
        });
        form.reset();
        setSelectedLevelId("");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 text-slate-900 shadow-sm"
    >
      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
        <Video className="w-5 h-5 text-amber-500" />
        <span>Add Video Lecture</span>
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

      {/* TITLE */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Lecture Title *
        </label>
        <input
          type="text"
          name="title"
          required
          placeholder="e.g. Journal Entries & Ledgers Masterclass"
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
        />
      </div>

      {/* LEVEL & SUBJECT SELECTORS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            ICAN Level *
          </label>
          <select
            name="level_id"
            required
            value={selectedLevelId}
            onChange={(e) => setSelectedLevelId(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
          >
            <option value="">Select Level</option>
            {levels.map((lvl: Level) => (
              <option key={lvl.id} value={lvl.id}>
                {lvl.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Subject *
          </label>
          <select
            name="subject_id"
            required
            disabled={!selectedLevelId}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition disabled:opacity-50 disabled:bg-slate-100"
          >
            <option value="">Select Subject</option>
            {filteredSubjects.map((sub: Subject) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* VIDEO URL & DURATION */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            YouTube / Vimeo Embed URL *
          </label>
          <input
            type="url"
            name="video_url"
            required
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Duration (Minutes)
          </label>
          <input
            type="number"
            name="duration_minutes"
            placeholder="45"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* LECTURER NAME */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Lecturer Name
        </label>
        <input
          type="text"
          name="instructor_name"
          placeholder="e.g. CA Rajesh Kumar"
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Publishing Video...</span>
          </>
        ) : (
          <span>Publish Video Lecture</span>
        )}
      </button>
    </form>
  );
}
