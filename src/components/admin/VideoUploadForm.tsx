"use client";

import { useState, useTransition } from "react";
import { Level, Subject } from "@/types";
import { createVideo } from "@/lib/actions/videos";
import { Video, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  levels: Level[];
  subjects: Subject[];
  modules: any[];
}

export default function VideoUploadForm({
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
      const res = await createVideo(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Video lecture published successfully!");
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
        <Video className="w-5 h-5 text-amber-500" />
        <span>Add Video Lecture</span>
      </h2>

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
