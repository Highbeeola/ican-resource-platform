import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Video,
  FileCheck,
  BookOpen,
  TrendingUp,
  Award,
  MessageSquare,
  ArrowRight,
  GraduationCap,
} from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="bg-slate-950 text-white min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden py-16 lg:py-24 px-4 sm:px-6 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            <span>
              Access ICAN study materials, Pathfinders, past questions and
              revision resources — organised by level and subject.
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Master Your ICAN Journey with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
              CA Prep Academy
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-normal">
            Comprehensive preparation for ICAN Foundation, Skills & Professional
            exams with expert study materials, pathfinders, and revision guides.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-2">
            <Link
              href="/resources"
              className="w-full sm:w-auto px-7 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition text-sm"
            >
              <span>Explore Study Materials</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* ONLY SHOW REGISTER BUTTON IF NOT LOGGED IN */}
            {!user && (
              <Link
                href="/register"
                className="w-full sm:w-auto px-7 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl flex items-center justify-center gap-2 transition text-sm"
              >
                <span>Register Free</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 1: WHY CHOOSE CA PREP ACADEMY? */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Why Choose CA Prep Academy?
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Everything you need to excel in your ICAN professional examinations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* CARD 1: Video Lectures */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-amber-500/50 transition">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-semibold">
              <Video className="w-3.5 h-3.5" />
              <span>Video Resources</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              Recorded Class Sessions
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Watch video lectures by experienced ICAN faculty anytime,
              anywhere. Learn and revise at your own pace.
            </p>
          </div>

          {/* CARD 2: Mock Tests */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-amber-500/50 transition">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-semibold">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Practice Tests</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              ICAN Pattern Mock Tests
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Practice questions, pathfinders, and mock exams designed on the
              latest ICAN exam pattern with detailed solutions.
            </p>
          </div>

          {/* CARD 3: Comprehensive Notes */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-amber-500/50 transition">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Study Material</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              Comprehensive Notes
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Download PDF notes, study texts, summary sheets, revision guides,
              and past year papers for every subject.
            </p>
          </div>

          {/* CARD 4: Progress Tracking */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-amber-500/50 transition">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Progress Tracking</span>
            </div>
            <h3 className="text-lg font-bold text-white">Track Your Growth</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Organize your study path across Foundation, Skills, and
              Professional stages as you prepare for exam diets.
            </p>
          </div>

          {/* CARD 5: Expert Faculty */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-amber-500/50 transition">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 text-rose-400 rounded-full text-xs font-semibold">
              <Award className="w-3.5 h-3.5" />
              <span>Expert Lecturers</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              Learn from the Best
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Our materials and resources are compiled by qualified Chartered
              Accountants with years of teaching experience.
            </p>
          </div>

          {/* CARD 6: Support */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-amber-500/50 transition">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-xs font-semibold">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Student Support</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              Centralized Resource Hub
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Find solutions to past questions quickly without hopping across
              fragmented web pages or PDF folders.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: OUR PROGRAMS / ICAN LEVELS */}
      <section className="py-16 px-4 sm:px-6 bg-slate-900/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Our Programs
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Select your current ICAN examination stage to browse tailored
              study materials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* PROGRAM 1: FOUNDATION */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 hover:border-amber-500/50 transition flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full uppercase">
                  Foundation
                </span>
                <h3 className="text-xl font-bold text-white">
                  ICAN Foundation Stage
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Entry-level program covering Business Environment, Financial
                  Accounting, Management Accounting, and Corporate Law.
                </p>
              </div>

              <Link
                href="/resources?level=foundation"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-center transition text-sm block"
              >
                Access Materials
              </Link>
            </div>

            {/* PROGRAM 2: SKILLS */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 hover:border-amber-500/50 transition flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full uppercase">
                  Skills
                </span>
                <h3 className="text-xl font-bold text-white">
                  ICAN Skills Stage
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Intermediate program covering Financial Reporting, Audit &
                  Assurance, Taxation, Performance Mgmt, Financial Mgmt, and
                  Public Sector.
                </p>
              </div>

              <Link
                href="/resources?level=skills"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-center transition text-sm block"
              >
                Access Materials
              </Link>
            </div>

            {/* PROGRAM 3: PROFESSIONAL */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 hover:border-amber-500/50 transition flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full uppercase">
                  Professional
                </span>
                <h3 className="text-xl font-bold text-white">
                  ICAN Professional Stage
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Advanced program covering Strategic Business Reporting,
                  Advanced Audit, Strategic Financial Mgmt, Advanced Tax, and
                  Case Study.
                </p>
              </div>

              <Link
                href="/resources?level=professional"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-center transition text-sm block"
              >
                Access Materials
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      
    </div>
  );
}
