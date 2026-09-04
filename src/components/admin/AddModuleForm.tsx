"use client";

import { useTransition } from "react";
import { Subject } from "@/types";
import { createModule } from "@/lib/actions/modules";
import { Layers, Loader2, Plus } from "lucide-react";
import toast from "react-hot-toast";

export default function AddModuleForm({ subjects }: { subjects: Subject[] }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createModule(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Learning Module created successfully!");
        form.reset();
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm text-slate-900"
    >
      <div className="border-b border-slate-100 pb-3">
        <h2 className="font-bold text-[#1e3a8a] text-base flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#f59e0b]" />
          <span>Create Learning Module</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Group your videos and PDFs into structured lessons (e.g. "Week 1",
          "Module 1").
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Target Subject *
          </label>
          <select
            name="subject_id"
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none"
          >
            <option value="">Select Subject</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Module Title *
          </label>
          <input
            type="text"
            name="title"
            required
            placeholder="e.g. Module 1: Intro to Accounting"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Description
          </label>
          <input
            type="text"
            name="description"
            placeholder="What will students learn in this module?"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Display Order (e.g. 1, 2, 3)
          </label>
          <input
            type="number"
            name="display_order"
            defaultValue={1}
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
        <span>Create Module</span>
      </button>
    </form>
  );
}
