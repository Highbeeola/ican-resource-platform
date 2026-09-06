"use client";

import { useState, useTransition } from "react";
import { Subject } from "@/types";
import { updateSubjectLiveClass } from "@/lib/actions/subjects";
import toast from "react-hot-toast";
import { Video, Loader2, Save } from "lucide-react";

export default function UpdateLiveClassForm({
  subjects,
}: {
  subjects: Subject[];
}) {
  const [isPending, startTransition] = useTransition();
  const [selectedSubId, setSelectedSubId] = useState("");
  const [meetUrl, setMeetUrl] = useState("");
  const [meetTime, setMeetTime] = useState("");

  // Auto-fill existing details when a course is selected
  function handleSubjectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const subId = e.target.value;
    setSelectedSubId(subId);
    const sub = subjects.find((s) => s.id === subId);
    if (sub) {
      setMeetUrl(sub.meet_url || "");
      setMeetTime(sub.meet_time || "");
    } else {
      setMeetUrl("");
      setMeetTime("");
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedSubId) return toast.error("Please select an existing course.");

    startTransition(async () => {
      const res = await updateSubjectLiveClass(
        selectedSubId,
        meetUrl,
        meetTime,
      );
      if (res?.error) toast.error(res.error);
      else toast.success("Live class scheduled successfully!");
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-slate-900 mt-6 space-y-4"
    >
      <div className="border-b border-slate-100 pb-3">
        <h2 className="font-bold text-[#1e3a8a] text-base flex items-center gap-2">
          <Video className="w-5 h-5 text-rose-500" />
          <span>Schedule Live Class for Existing Course</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Update or add a Google Meet link to an already created course.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Select Existing Course *
          </label>
          <select
            required
            value={selectedSubId}
            onChange={handleSubjectChange}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none"
          >
            <option value="">-- Choose Course --</option>
            {subjects.map((sub: Subject) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Google Meet Link
          </label>
          <input
            type="url"
            value={meetUrl}
            onChange={(e) => setMeetUrl(e.target.value)}
            placeholder="https://meet.google.com/..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Schedule / Time
          </label>
          <input
            type="text"
            value={meetTime}
            onChange={(e) => setMeetTime(e.target.value)}
            placeholder="e.g. Saturdays, 10 AM"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Saving Schedule...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Schedule</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
