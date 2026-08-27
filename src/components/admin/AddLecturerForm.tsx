"use client";

import { useState, useEffect, useTransition } from "react";
import {
  createLecturer,
  getLecturers,
  deleteLecturer,
} from "@/lib/actions/lecturers";
import {
  UserPlus,
  Loader2,
  CheckCircle,
  AlertCircle,
  Trash2,
} from "lucide-react";

export default function AddLecturerForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [lecturers, setLecturers] = useState<any[]>([]);

  // Fetch the list of lecturers
  useEffect(() => {
    getLecturers().then(setLecturers);
  }, [message]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createLecturer(formData);
      if (res?.error) {
        setMessage({ type: "error", text: res.error });
      } else {
        setMessage({ type: "success", text: "Lecturer profile created!" });
        form.reset();
      }
    });
  }

  function handleDelete(id: string, name: string) {
    if (
      confirm(
        `Are you sure you want to remove ${name} from the public directory?`,
      )
    ) {
      startTransition(async () => {
        const res = await deleteLecturer(id);
        if (res.success) {
          setMessage({
            type: "success",
            text: "Lecturer removed successfully!",
          });
        }
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* CREATION FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm text-slate-900"
      >
        <div className="border-b border-slate-100 pb-3">
          <h2 className="font-bold text-[#1e3a8a] text-base flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#f59e0b]" />
            <span>Create Lecturer Profile</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Add faculty members so students can view their qualifications.
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 text-xs sm:text-sm font-medium ${message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="full_name"
              required
              placeholder="e.g. CA Rajesh Kumar"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Qualifications
            </label>
            <input
              type="text"
              name="qualifications"
              placeholder="e.g. FCA, MBA Finance"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Years of Experience
            </label>
            <input
              type="number"
              name="experience_years"
              placeholder="e.g. 15"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Biography
          </label>
          <textarea
            name="biography"
            rows={3}
            placeholder="Brief background about the lecturer..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold px-6 py-3 rounded-xl text-sm transition flex items-center gap-2 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UserPlus className="w-4 h-4" />
          )}
          <span>Save Lecturer Profile</span>
        </button>
      </form>

      {/* ACTIVE LECTURERS LIST */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-[#1e3a8a] text-base border-b border-slate-100 pb-3">
          Published Profiles ({lecturers.length})
        </h3>

        <div className="divide-y divide-slate-100">
          {lecturers.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">
              No lecturer profiles created yet.
            </p>
          ) : (
            lecturers.map((lecturer) => (
              <div
                key={lecturer.id}
                className="py-3 flex justify-between items-center text-xs sm:text-sm"
              >
                <div>
                  <p className="font-bold text-slate-900">
                    {lecturer.full_name}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {lecturer.qualifications} • {lecturer.experience_years} Yrs
                    Exp.
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(lecturer.id, lecturer.full_name)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Remove</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
