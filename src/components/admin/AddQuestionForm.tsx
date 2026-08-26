"use client";

import { useState, useTransition } from "react";
import { Subject } from "@/types";
import { createQuestion } from "@/lib/actions/quiz";
import {
  HelpCircle,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
} from "lucide-react";

interface Props {
  subjects: Subject[];
}

export default function AddQuestionForm({ subjects }: Props) {
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
      const res = await createQuestion(formData);
      if (res?.error) {
        setMessage({ type: "error", text: res.error });
      } else {
        setMessage({
          type: "success",
          text: "Practice question added to Question Bank!",
        });
        form.reset();
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 text-white"
    >
      <h2 className="text-base sm:text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-amber-400" />
        <span>Add Question to Question Bank</span>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Subject *
          </label>
          <select
            name="subject_id"
            required
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Select Subject</option>
            {subjects.map((sub: Subject) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Topic Name
          </label>
          <input
            type="text"
            name="topic_name"
            placeholder="e.g. IAS 16 Property, Plant & Equipment"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">
          Question Text *
        </label>
        <textarea
          name="question_text"
          rows={3}
          required
          placeholder="Enter the examination question here..."
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        ></textarea>
      </div>

      {/* OPTIONS A-D */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Option A *
          </label>
          <input
            type="text"
            name="option_a"
            required
            placeholder="Option A text"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Option B *
          </label>
          <input
            type="text"
            name="option_b"
            required
            placeholder="Option B text"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Option C *
          </label>
          <input
            type="text"
            name="option_c"
            required
            placeholder="Option C text"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Option D *
          </label>
          <input
            type="text"
            name="option_d"
            required
            placeholder="Option D text"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Correct Option *
          </label>
          <select
            name="correct_option"
            required
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-amber-400 font-bold rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="A">Option A is Correct</option>
            <option value="B">Option B is Correct</option>
            <option value="C">Option C is Correct</option>
            <option value="D">Option D is Correct</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Solution Explanation
          </label>
          <input
            type="text"
            name="explanation"
            placeholder="Why this option is correct according to ICAN standards..."
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
        <span>Add Question to Bank</span>
      </button>
    </form>
  );
}
