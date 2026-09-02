"use client";

import { useState, useTransition } from "react";
import { Level, Subject, ResourceType } from "@/types";
import { saveResourceMetadata } from "@/lib/actions/resources";
import { createClient } from "@/lib/supabase/client";
import { Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface FormProps {
  levels: Level[];
  subjects: Subject[];
}

export default function ResourceUploadForm({ levels, subjects }: FormProps) {
  const [selectedLevelId, setSelectedLevelId] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Filter subjects dynamically based on selected level
  const filteredSubjects = subjects.filter(
    (sub: Subject) => sub.level_id === selectedLevelId,
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file") as File;

    if (!file || file.size === 0) {
      setMessage({
        type: "error",
        text: "Please select a valid PDF file to upload.",
      });
      return;
    }

    // 1. UPLOAD DIRECTLY TO SUPABASE STORAGE FROM BROWSER
    setIsUploading(true);
    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `resources/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("ican-resources")
      .upload(filePath, file, { upsert: false });

    if (uploadError) {
      setIsUploading(false);
      setMessage({
        type: "error",
        text: `Storage Upload Error: ${uploadError.message}`,
      });
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("ican-resources")
      .getPublicUrl(filePath);

    setIsUploading(false);

    // 2. SAVE METADATA TO DATABASE VIA SERVER ACTION
    startTransition(async () => {
      const result = await saveResourceMetadata({
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        levelId: formData.get("level_id") as string,
        subjectId: formData.get("subject_id") as string,
        resourceType: formData.get("resource_type") as ResourceType,
        examYear: formData.get("exam_year")
          ? parseInt(formData.get("exam_year") as string)
          : null,
        examDiet: formData.get("exam_diet") as string,
        fileUrl: publicUrlData.publicUrl,
        fileSizeBytes: file.size,
      });

      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({
          type: "success",
          text: "PDF resource uploaded and published successfully!",
        });

        // Reset file and title inputs while preserving selected Level & Subject
        const titleInput = form.querySelector(
          'input[name="title"]',
        ) as HTMLInputElement;
        const fileInput = form.querySelector(
          'input[name="file"]',
        ) as HTMLInputElement;
        const descInput = form.querySelector(
          'textarea[name="description"]',
        ) as HTMLTextAreaElement;

        if (titleInput) titleInput.value = "";
        if (fileInput) fileInput.value = "";
        if (descInput) descInput.value = "";
      }
    });
  }

  const isLoading = isPending || isUploading;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm text-slate-900"
    >
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

      {/* RESOURCE TITLE */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Resource Title *
        </label>
        <input
          type="text"
          name="title"
          required
          placeholder="e.g., Financial Reporting - Pathfinder May 2026"
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
        />
      </div>

      {/* LEVEL & SUBJECT SELECTORS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Level *
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
                {lvl.programme?.name ? `${lvl.programme.name} - ` : ""}
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
            defaultValue=""
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition disabled:opacity-50 disabled:bg-slate-100"
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
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Resource Category *
          </label>
          <select
            name="resource_type"
            required
            defaultValue="pathfinder"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition capitalize"
          >
            <option value="pathfinder">Pathfinder</option>
            <option value="study_text">Study Text</option>
            <option value="past_question">Past Question</option>
            <option value="mock_question">Mock Question</option>
            <option value="notes">Lecture Notes</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Diet / Session{" "}
            <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <select
            name="exam_diet"
            defaultValue=""
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
          >
            <option value="">N/A (General Syllabus)</option>
            <option value="May">May Diet</option>
            <option value="November">November Diet</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Exam Year{" "}
            <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            type="number"
            name="exam_year"
            placeholder="e.g. 2026"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* DESCRIPTION */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          rows={3}
          placeholder="Brief summary of topics covered in this document..."
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
        ></textarea>
      </div>

      {/* FILE UPLOAD INPUT */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          PDF Document *
        </label>
        <input
          type="file"
          name="file"
          accept="application/pdf"
          required
          className="w-full p-2 bg-slate-50 border border-slate-300 border-dashed rounded-xl text-sm text-slate-600 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-white hover:file:bg-amber-600 cursor-pointer"
        />
      </div>

      {/* SUBMIT BUTTON */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer text-sm"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>
              {isUploading
                ? "Uploading PDF to Cloud..."
                : "Saving to Database..."}
            </span>
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
