"use client";

import { useState, useTransition } from "react";
import { Level } from "@/types";
import { createSubject } from "@/lib/actions/subjects";
import { Plus, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface Props {
  levels: Level[];
}

export default function AddSubjectForm({ levels }: Props) {
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
      const res = await createSubject(formData);
      if (res?.error) {
        setMessage({ type: "error", text: res.error });
      } else {
        setMessage({
          type: "success",
          text: "Subject & Lecturer details saved successfully!",
        });
        form.reset();
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl text-white"
    >
      <h2 className="text-base sm:text-lg font-bold text-white border-b border-slate-800 pb-3">
        Add New Course / Subject
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

      {/* INPUT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            ICAN Level *
          </label>
          <select
            name="level_id"
            required
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
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
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Subject Name *
          </label>
          <input
            type="text"
            name="name"
            required
            placeholder="e.g. Financial Reporting"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Lecturer / Instructor Name
          </label>
          <input
            type="text"
            name="instructor_name"
            placeholder="e.g. CA Rajesh Kumar"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Subject Code
          </label>
          <input
            type="text"
            name="code"
            placeholder="e.g. FR"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Estimated Course Hours
          </label>
          <input
            type="number"
            name="estimated_hours"
            placeholder="e.g. 40"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">
          Course Description
        </label>
        <textarea
          name="description"
          rows={2}
          placeholder="Brief overview of accounting concepts covered..."
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/10 disabled:opacity-50 cursor-pointer"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Saving Course...</span>
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            <span>Save Subject & Lecturer</span>
          </>
        )}
      </button>
    </form>
  );
}
