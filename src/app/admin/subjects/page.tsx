import { getLevels, getSubjects } from "@/lib/services/resources";
import { Level, Subject } from "@/types";
import AddSubjectForm from "@/components/admin/AddSubjectForm";
import Link from "next/link";
import { ArrowLeft, BookOpen, Layers } from "lucide-react";

export default async function AdminSubjectsPage() {
  const levels = await getLevels();
  const subjects = await getSubjects();

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10 text-slate-900">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* BACK NAVIGATION */}
        <Link
          href="/admin/resources"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Resource Management</span>
        </Link>

        {/* HEADER */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Manage ICAN Subjects
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Add or update subjects assigned to Foundation, Skills, and
            Professional levels.
          </p>
        </div>

        {/* CLIENT ADD FORM */}
        <AddSubjectForm levels={levels} />

        {/* EXISTING SUBJECTS LIST */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
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
                  className="py-3 sm:py-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-1 sm:gap-4 hover:bg-slate-50 px-2 rounded-lg transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {sub.code || "SUB"}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">
                        {sub.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {sub.level?.name} Level
                      </p>
                    </div>
                  </div>

                  <span className="self-start sm:self-auto text-[11px] font-semibold uppercase px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
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
