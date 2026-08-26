import { getLevels, getSubjects } from "@/lib/services/resources";
import { Level, Subject } from "@/types";
import AddSubjectForm from "@/components/admin/AddSubjectForm";
import Link from "next/link";
import { ArrowLeft, Layers } from "lucide-react";

export default async function AdminSubjectsPage() {
  const levels = await getLevels();
  const subjects = await getSubjects();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* BACK NAVIGATION */}
        <Link
          href="/admin/resources"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition bg-white px-3.5 py-2 rounded-lg border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Resource Management</span>
        </Link>

        {/* HEADER */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e3a8a] tracking-tight">
            Manage ICAN Subjects
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Add or update subjects assigned to Foundation, Skills, and
            Professional levels.
          </p>
        </div>

        {/* CLIENT ADD FORM CONTAINER */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
          <AddSubjectForm levels={levels} />
        </div>

        {/* EXISTING SUBJECTS LIST */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-base sm:text-lg font-bold text-[#1e3a8a] flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              <span>Current Subjects ({subjects.length})</span>
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {subjects.length === 0 ? (
              <p className="py-6 text-center text-xs sm:text-sm text-slate-500">
                No subjects found. Create one above!
              </p>
            ) : (
              subjects.map((sub: Subject) => (
                <div
                  key={sub.id}
                  className="py-3 sm:py-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-4 hover:bg-slate-50 px-2.5 rounded-xl transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {sub.code || "SUB"}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">
                        {sub.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {sub.level?.name} Stage
                      </p>
                    </div>
                  </div>

                  <span className="self-start sm:self-auto text-[11px] font-semibold uppercase px-3 py-1 bg-blue-50 text-[#1e3a8a] border border-blue-200 rounded-full">
                    {sub.level?.name}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
