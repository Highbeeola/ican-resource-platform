"use client";

import { useState, useTransition } from "react";
import { Subject } from "@/types";
import { updateSubjectSettings } from "@/lib/actions/subjects";
import toast from "react-hot-toast";
import {
  Settings2,
  Loader2,
  Save,
  Banknote,
  Video,
  Clock,
  BookOpen,
} from "lucide-react";

export default function UpdateLiveClassForm({
  subjects,
}: {
  subjects: Subject[];
}) {
  const [isPending, startTransition] = useTransition();
  const [selectedSubId, setSelectedSubId] = useState("");
  const [meetUrl, setMeetUrl] = useState("");
  const [meetTime, setMeetTime] = useState("");
  const [price, setPrice] = useState<string>("");

  // Auto-fill existing details when a course is selected
  function handleSubjectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const subId = e.target.value;
    setSelectedSubId(subId);
    const sub = subjects.find((s) => s.id === subId);
    if (sub) {
      setMeetUrl(sub.meet_url || "");
      setMeetTime(sub.meet_time || "");
      setPrice(
        sub.price !== undefined && sub.price !== null ? String(sub.price) : "0",
      );
    } else {
      setMeetUrl("");
      setMeetTime("");
      setPrice("");
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedSubId) return toast.error("Please select an existing course.");

    const parsedPrice = parseFloat(price) || 0;

    startTransition(async () => {
      const res = await updateSubjectSettings(
        selectedSubId,
        meetUrl,
        meetTime,
        parsedPrice,
      );
      if (res.error) toast.error(res.error);
      else toast.success("Course settings updated successfully!");
    });
  }

  const selectedSubject = subjects.find((s) => s.id === selectedSubId);

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-slate-900 mt-6"
    >
      {/* HEADER SECTION */}
      <div className="border-b border-slate-100 pb-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="font-bold text-[#1e3a8a] text-base flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-amber-500" />
            <span>Update Existing Course Settings</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage course pricing, Google Meet access links, and live class
            schedules.
          </p>
        </div>

        {selectedSubject && (
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-3 py-1 rounded-full font-bold border ${
                (parseFloat(price) || 0) > 0
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
            >
              {(parseFloat(price) || 0) > 0
                ? `Paid Course (₦${Number(price).toLocaleString()})`
                : "Free Access"}
            </span>
          </div>
        )}
      </div>

      {/* FORM INPUTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* SELECT COURSE */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>Select Existing Course *</span>
          </label>
          <select
            required
            value={selectedSubId}
            onChange={handleSubjectChange}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none transition cursor-pointer"
          >
            <option value="">-- Choose a Course to Edit --</option>
            {subjects.map((sub: any) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        {/* PRICE INPUT FIELD */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Banknote className="w-3.5 h-3.5 text-slate-400" />
            <span>Course Price (NGN)</span>
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-0 top-0 bottom-0 px-3.5 bg-slate-100 border-r border-slate-200 rounded-l-xl flex items-center text-slate-600 font-bold text-sm select-none">
              ₦
            </div>
            <input
              type="number"
              min={0}
              step={100}
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none transition"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Set to <strong>0</strong> to make this course free for all students.
          </p>
        </div>

        {/* SCHEDULE / TIME */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Schedule / Live Class Time</span>
          </label>
          <input
            type="text"
            value={meetTime}
            onChange={(e) => setMeetTime(e.target.value)}
            placeholder="e.g. Saturdays at 10:00 AM"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none transition"
          />
        </div>

        {/* GOOGLE MEET LINK */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-slate-400" />
            <span>Google Meet Link</span>
          </label>
          <input
            type="url"
            value={meetUrl}
            onChange={(e) => setMeetUrl(e.target.value)}
            placeholder="https://meet.google.com/abc-defg-hij"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none transition font-mono text-slate-800 placeholder:font-sans"
          />
        </div>
      </div>

      {/* FOOTER / SUBMIT BUTTON */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
        <button
          type="submit"
          disabled={isPending || !selectedSubId}
          className="bg-[#1e3a8a] hover:bg-blue-900 active:scale-[0.98] text-white font-bold px-6 py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Course Settings</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
