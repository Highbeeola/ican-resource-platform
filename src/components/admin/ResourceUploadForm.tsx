"use client";

import { useState, useTransition } from "react";
import { Level, Subject } from "@/types";
import { createResource } from "@/lib/actions/resources";
import { Upload, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  levels: Level[];
  subjects: Subject[];
  modules: any[];
}

export default function ResourceUploadForm({
  levels,
  subjects,
  modules = [],
}: Props) {
  const [selectedLevelId, setSelectedLevelId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");

  const [isPending, startTransition] = useTransition();

  const filteredSubjects = subjects.filter(
    (sub: Subject) => sub.level_id === selectedLevelId,
  );

  const filteredModules = modules.filter(
    (m: any) => m.subject_id === selectedSubjectId,
  );

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLevelId(e.target.value);
    setSelectedSubjectId("");
    setSelectedModuleId("");
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubjectId(e.target.value);
    setSelectedModuleId("");
  };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createResource(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Resource uploaded successfully!");
        form.reset();
        setSelectedLevelId("");
        setSelectedSubjectId("");
        setSelectedModuleId("");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 text-slate-900 shadow-sm"
    >
      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
        <Upload className="w-5 h-5 text-amber-500" />
        <span>Upload Document / Resource</span>
      </h2>

      {/* TITLE */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Resource Title *
        </label>
        <input
          type="text"
          name="title"
          required
          placeholder="e.g. November 2023 Financial Accounting Diet Questions"
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
        />
      </div>

      {/* LEVEL, SUBJECT, AND MODULE SELECTORS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            ICAN Level *
          </label>
          <select
            name="level_id"
            required
            value={selectedLevelId}
            onChange={handleLevelChange}
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
            value={selectedSubjectId}
            onChange={handleSubjectChange}
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

        {/* MODULE SELECTOR */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Assign to Module{" "}
            <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <select
            name="module_id"
            disabled={!selectedSubjectId}
            value={selectedModuleId}
            onChange={(e) => setSelectedModuleId(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition disabled:opacity-50 disabled:bg-slate-100 cursor-pointer disabled:cursor-not-allowed"
          >
            <option value="">
              {!selectedSubjectId
                ? "Select a Subject First"
                : filteredModules.length === 0
                  ? "-- General / Unassigned (No Modules Found) --"
                  : "-- General / Unassigned --"}
            </option>
            {filteredModules.map((m: any, index: number) => (
              <option key={m.id} value={m.id}>
                Module {m.display_order || index + 1}: {m.title}
              </option>
            ))}
          </select>
          {selectedSubjectId && filteredModules.length === 0 && (
            <p className="text-[11px] text-slate-500 mt-1">
              No modules created yet. Build syllabus structure in the{" "}
              <span className="font-semibold text-[#1e3a8a]">Curriculum</span>{" "}
              tab.
            </p>
          )}
        </div>
      </div>

      {/* RESOURCE TYPE & DIET YEAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Resource Type *
          </label>
          <select
            name="resource_type"
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
          >
            <option value="past_question">Past Question</option>
            <option value="study_text">Study Text</option>
            <option value="notes">Lecture Notes</option>
            <option value="syllabus">Syllabus</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Diet / Year{" "}
            <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            name="diet_year"
            placeholder="e.g. Nov 2023"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* FILE UPLOAD */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Upload File (PDF / Word / ZIP) *
        </label>
        <input
          type="file"
          name="file"
          required
          accept=".pdf,.doc,.docx,.zip,.rar"
          className="w-full px-4 py-2 bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 transition cursor-pointer"
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
            <span>Uploading Resource...</span>
          </>
        ) : (
          <span>Upload Resource</span>
        )}
      </button>
    </form>
  );
}
