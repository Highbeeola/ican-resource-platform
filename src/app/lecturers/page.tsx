import { getLecturers } from "@/lib/actions/lecturers";
import { Award, BookOpen, Briefcase } from "lucide-react";

export default async function LecturersPage() {
  const lecturers = await getLecturers();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1e3a8a]">
            Our Expert Faculty
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Learn from industry-leading Chartered Accountants and subject matter
            experts dedicated to your ICAN success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lecturers.length === 0 ? (
            <div className="col-span-full text-center text-slate-500 py-12">
              No faculty profiles published yet.
            </div>
          ) : (
            lecturers.map((lecturer: any) => (
              <div
                key={lecturer.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center text-[#1e3a8a] font-bold text-xl">
                    {lecturer.full_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#1e3a8a]">
                      {lecturer.full_name}
                    </h3>
                    <p className="text-sm font-semibold text-[#f59e0b]">
                      {lecturer.qualifications || "Subject Expert"}
                    </p>
                  </div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
                  {lecturer.biography ||
                    "A dedicated professional guiding students through their ICAN examination journey."}
                </p>

                <div className="flex items-center gap-4 pt-2 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-[#1e3a8a]" />
                    {lecturer.experience_years}+ Years Exp.
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#1e3a8a]" />
                    KRL Academy
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
