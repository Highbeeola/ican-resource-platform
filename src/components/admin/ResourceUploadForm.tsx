"use client";

import { useState, useTransition } from "react";
import { Level, Subject, ResourceType } from "@/types";
import { uploadResource } from "@/lib/actions/resources";
import { Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface FormProps {
  levels: Level[];
  subjects: Subject[];
}

export default function ResourceUploadForm({ levels, subjects }: FormProps) {
  const [selectedLevelId, setSelectedLevelId] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Filter subjects dynamically based on selected ICAN level
  const filteredSubjects = subjects.filter(
    (sub: Subject) => sub.level_id === selectedLevelId,
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await uploadResource(formData);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({
          type: "success",
          text: "PDF resource uploaded and published successfully!",
        });
        form.reset();
        setSelectedLevelId("");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl"
    >
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

      {/* RESOURCE TITLE */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">
          Resource Title *
        </label>
        <input
          type="text"
          name="title"
          required
          placeholder="e.g., Financial Reporting - Pathfinder May 2026"
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* LEVEL & SUBJECT SELECTORS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            ICAN Level *
          </label>
          <select
            name="level_id"
            required
            value={selectedLevelId}
            onChange={(e) => setSelectedLevelId(e.target.value)}
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
            Subject *
          </label>
          <select
            name="subject_id"
            required
            disabled={!selectedLevelId}
            defaultValue=""
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
          >
            <option value="">Select Subject</option>
            {filteredSubjects.map((sub: Subject) => (
              <option key={sub.id} value={sub.id}>
                {sub.name} {sub.code ? `(${sub.code})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* RESOURCE TYPE & EXAM DETAILS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Resource Category *
          </label>
          <select
            name="resource_type"
            required
            defaultValue="pathfinder"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 capitalize"
          >
            <option value="pathfinder">Pathfinder</option>
            <option value="study_text">Study Text</option>
            <option value="past_question">Past Question</option>
            <option value="mock_question">Mock Question</option>
            <option value="solution">Solution / Answer</option>
            <option value="notes">Lecture Notes</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Diet / Session{" "}
            <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <select
            name="exam_diet"
            defaultValue=""
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">N/A (General Syllabus)</option>
            <option value="May">May Diet</option>
            <option value="November">November Diet</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Exam Year{" "}
            <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <input
            type="number"
            name="exam_year"
            placeholder="e.g. 2026"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* DESCRIPTION */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">
          Description
        </label>
        <textarea
          name="description"
          rows={3}
          placeholder="Brief summary of topics covered in this document..."
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        ></textarea>
      </div>

      {/* FILE UPLOAD INPUT */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">
          PDF Document *
        </label>
        <input
          type="file"
          name="file"
          accept="application/pdf"
          required
          className="w-full p-2 bg-slate-800 border border-slate-700 border-dashed rounded-xl text-sm text-slate-300 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
        />
      </div>

      {/* SUBMIT BUTTON */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/10 transition disabled:opacity-50 cursor-pointer text-sm"
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Uploading PDF to Supabase...</span>
          </>
        ) : (
          <>
            <Upload className="w-5 h-5" />
            <span>Publish Resource</span>
          </>
        )}
      </button>
    </form>
  );
}
