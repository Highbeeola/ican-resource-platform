"use client";

import { useState, useTransition } from "react";
import { Subject } from "@/types";
import { createQuestion, uploadBulkQuestions } from "@/lib/actions/quiz";
import {
  HelpCircle,
  Loader2,
  Plus,
  UploadCloud,
  FileSpreadsheet,
} from "lucide-react";
import Papa from "papaparse";
import toast from "react-hot-toast";

interface Props {
  subjects: Subject[];
}

export default function AddQuestionForm({ subjects }: Props) {
  const [mode, setMode] = useState<"manual" | "bulk">("bulk");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [exerciseName, setExerciseName] = useState("");
  const [isPending, startTransition] = useTransition();

  // Render options using relational database properties
  const renderSubjectOptions = () => {
    return subjects.map((sub: any) => {
      const progName =
        sub.level?.programme?.slug === "atswa" ? "ATSWA" : "ICAN";
      const levelName = sub.level?.name ? ` ${sub.level.name}` : "";

      return (
        <option key={sub.id} value={sub.id}>
          {progName}
          {levelName} — {sub.name}
        </option>
      );
    });
  };

  // HANDLE BULK CSV UPLOAD
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedSubject || !exerciseName) {
      toast.error(
        "Please select a subject, type a quiz name, and upload a file.",
      );
      return;
    }

    // Parse the CSV file in the browser
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        startTransition(async () => {
          const res = await uploadBulkQuestions(
            selectedSubject,
            results.data,
            exerciseName,
          );
          if (res.success) {
            toast.success(
              `Successfully uploaded ${res.count} questions to the bank!`,
            );
            e.target.value = "";
            setExerciseName("");
          } else {
            toast.error(res.error || "Error uploading bulk questions.");
          }
        });
      },
      error: (error) => {
        toast.error(`Failed to read file: ${error.message}`);
      },
    });
  }

  // HANDLE SINGLE MANUAL UPLOAD
  function handleManualSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createQuestion(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Practice question added to Question Bank!");
        form.reset();
        setExerciseName("");
      }
    });
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm text-slate-900">
      {/* HEADER & MODE TOGGLE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#1e3a8a] flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#f59e0b]" />
            <span>Manage Question Bank</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Upload practice tests and mock exams.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setMode("bulk")}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
              mode === "bulk"
                ? "bg-white text-[#1e3a8a] shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Bulk Upload (CSV)
          </button>
          <button
            onClick={() => setMode("manual")}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
              mode === "manual"
                ? "bg-white text-[#1e3a8a] shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Manual Entry
          </button>
        </div>
      </div>

      {/* BULK UPLOAD MODE */}
      {mode === "bulk" && (
        <div className="space-y-6">
          {/* DOWNLOAD TEMPLATE BUTTON */}
          <div className="flex justify-end">
            <a
              href="data:text/csv;charset=utf-8,Question,Option A,Option B,Option C,Option D,Correct Option,Explanation%0A%22Which financial statement shows assets and liabilities?%22,%22Income Statement%22,%22Balance Sheet%22,%22Cash Flow%22,%22Equity Statement%22,%22B%22,%22The Balance Sheet shows financial position.%22"
              download="KRL_Academy_Quiz_Template.csv"
              className="text-xs font-bold text-[#1e3a8a] bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg border border-blue-200 transition"
            >
              ↓ Download Sample Template (.csv)
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Subject *
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none"
              >
                <option value="" disabled>
                  Select Subject
                </option>
                {renderSubjectOptions()}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quiz / Mock Exam Name *
              </label>
              <input
                type="text"
                required
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                placeholder="e.g. May 2026 Mock Exam"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none"
              />
            </div>
          </div>

          {/* UPLOAD DRAG & DROP ZONE */}
          <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
              <FileSpreadsheet className="w-6 h-6 text-[#1e3a8a]" />
            </div>
            <div>
              <p className="font-bold text-[#1e3a8a]">
                Upload CSV or XLSX File
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Please use the exact headers from the downloaded sample
                template.
              </p>
            </div>

            <div className="relative inline-block mt-2 group">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                disabled={!selectedSubject || !exerciseName || isPending}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
              />
              <button
                disabled={!selectedSubject || !exerciseName || isPending}
                className="px-6 py-2.5 bg-[#1e3a8a] text-white font-bold rounded-lg text-sm transition shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UploadCloud className="w-4 h-4" />
                )}
                {isPending ? "Uploading..." : "Select File"}
              </button>

              {(!selectedSubject || !exerciseName) && (
                <div className="absolute top-full mt-2 hidden group-hover:block bg-slate-800 text-white text-xs font-medium px-3 py-2 rounded-lg z-20 w-48 left-1/2 -translate-x-1/2 shadow-lg text-center">
                  Select a Subject and type a Quiz Name first!
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MANUAL UPLOAD MODE */}
      {mode === "manual" && (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject *
              </label>
              <select
                name="subject_id"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none"
              >
                <option value="" disabled>
                  Select Subject
                </option>
                {renderSubjectOptions()}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quiz / Mock Exam Name *
              </label>
              <input
                type="text"
                name="topic_name"
                required
                placeholder="e.g. Summer Coaching Practice Test"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Question Text *
            </label>
            <textarea
              name="question_text"
              rows={2}
              required
              placeholder="Enter the examination question..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Option A *
              </label>
              <input
                type="text"
                name="option_a"
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Option B *
              </label>
              <input
                type="text"
                name="option_b"
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Option C *
              </label>
              <input
                type="text"
                name="option_c"
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Option D *
              </label>
              <input
                type="text"
                name="option_d"
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Correct Option *
              </label>
              <select
                name="correct_option"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-[#1e3a8a] font-bold rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none"
              >
                <option value="A">Option A is Correct</option>
                <option value="B">Option B is Correct</option>
                <option value="C">Option C is Correct</option>
                <option value="D">Option D is Correct</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Solution Explanation
              </label>
              <input
                type="text"
                name="explanation"
                placeholder="Why this option is correct..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold px-6 py-3 rounded-xl text-sm transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>Add Single Question</span>
          </button>
        </form>
      )}
    </div>
  );
}
