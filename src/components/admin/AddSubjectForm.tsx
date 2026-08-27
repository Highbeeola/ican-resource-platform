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
      className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm text-slate-900"
    >
      <h2 className="text-base sm:text-lg font-bold text-[#1e3a8a] border-b border-slate-100 pb-3">
        Add New Course / Subject
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

      {/* INPUT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            ICAN Level *
          </label>
          <select
            name="level_id"
            required
            className="w-full px-4 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
          >
            <option value="">Select Level</option>
            {levels.map((lvl: Level) => (
              <option key={lvl.id} value={lvl.id}>
                {lvl.programme?.name ? `${lvl.programme.name} - ` : ""}
                {lvl.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Subject Name *
          </label>
          <input
            type="text"
            name="name"
            required
            placeholder="e.g. Financial Reporting"
            className="w-full px-4 py-2.5 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Lecturer / Instructor Name
          </label>
          <input
            type="text"
            name="instructor_name"
            placeholder="e.g. CA Rajesh Kumar"
            className="w-full px-4 py-2.5 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Subject Code
          </label>
          <input
            type="text"
            name="code"
            placeholder="e.g. FR"
            className="w-full px-4 py-2.5 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Estimated Course Hours
          </label>
          <input
            type="number"
            name="estimated_hours"
            placeholder="e.g. 40"
            className="w-full px-4 py-2.5 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Course Description
        </label>
        <textarea
          name="description"
          rows={2}
          placeholder="Brief overview of accounting concepts covered..."
          className="w-full px-4 py-2.5 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-50 cursor-pointer"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
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
