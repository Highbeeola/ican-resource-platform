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
    <div className="bg-white text-slate-900 min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden py-16 lg:py-24 px-4 sm:px-6 bg-[#2a52be] border-b-4 border-amber-500">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Master Your Professional Journey with <br />
            <span className="text-amber-400">KRL Academy</span>
          </h1>

          <p className="text-blue-100 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-normal">
            Comprehensive preparation for ICAN & ATSWA professional exams with
            expert study materials, pathfinders, and revision guides.
          </p>

          {/* INTEGRATED CTA BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            {/* ALWAYS SHOW EXPLORE COURSES */}
            <Link
              href="/resources"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold rounded-md shadow-md transition text-center"
            >
              Explore Courses &rarr;
            </Link>

            {/* DYNAMIC SECONDARY BUTTON — only shown once we know the visitor
                is signed in. The nav bar already offers Login/Register to
                guests, so repeating "Register Free" here was a duplicate
                CTA; guests now see a single, unambiguous hero action. */}
            {user && (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-3.5 bg-transparent border-2 border-white hover:bg-white hover:text-[#1e3a8a] text-white font-bold rounded-md transition text-center"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 1: PROGRAMME SELECTION (moved up — this is the actual
          decision point for most visitors, who already know which exam
          body they're preparing for) */}
      <section className="py-16 px-4 sm:px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1e3a8a]">
              Select Your Learning Track
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Choose your registered professional body to jump straight into
              tailored study materials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 hover:border-amber-500 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="p-3 bg-blue-50 text-[#1e3a8a] rounded-xl">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                    Professional Track
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-[#1e3a8a]">
                  ICAN Programme
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  Access comprehensive study texts, video lectures, pathfinders,
                  and past questions for Foundation, Skills, and Professional
                  stages.
                </p>
              </div>

              <Link
                href="/resources?prog=ican"
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-center transition text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Explore ICAN Courses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 hover:border-amber-500 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="p-3 bg-blue-50 text-[#1e3a8a] rounded-xl">
                    <Award className="w-7 h-7" />
                  </div>
                  <span className="px-3 py-1 bg-blue-50 text-[#1e3a8a] text-xs font-semibold rounded-full border border-blue-200">
                    Technician Track
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-[#1e3a8a]">
                  ATSWA Programme
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  Browse structured study materials and exam pathfinders for
                  Accounting Technicians Scheme West Africa across Parts I, II &
                  III.
                </p>
              </div>

              <Link
                href="/resources?prog=atswa"
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-center transition text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Explore ATSWA Courses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: WHY CHOOSE KRL ACADEMY? (now supporting detail,
          reinforcing the choice after the visitor has picked a track) */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1e3a8a]">
            Why Choose KRL Academy?
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            Everything you need to excel in your professional examinations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 hover:border-amber-500 shadow-sm hover:shadow-md transition">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">
              <Video className="w-3.5 h-3.5" />
              <span>Video Resources</span>
            </div>
            <h3 className="text-lg font-bold text-[#1e3a8a]">
              Recorded Class Sessions
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Watch video lectures by experienced faculty anytime, anywhere.
              Learn and revise at your own pace.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 hover:border-amber-500 shadow-sm hover:shadow-md transition">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-semibold">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Practice Tests</span>
            </div>
            <h3 className="text-lg font-bold text-[#1e3a8a]">
              Exam Pattern Mock Tests
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Practice questions, pathfinders, and mock exams designed on the
              latest exam patterns with detailed solutions.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 hover:border-amber-500 shadow-sm hover:shadow-md transition">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Study Material</span>
            </div>
            <h3 className="text-lg font-bold text-[#1e3a8a]">
              Comprehensive Notes
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Download PDF notes, study texts, summary sheets, revision guides,
              and past year papers for every subject.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 hover:border-amber-500 shadow-sm hover:shadow-md transition">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Progress Tracking</span>
            </div>
            <h3 className="text-lg font-bold text-[#1e3a8a]">
              Track Your Growth
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Organize your study path across various stages as you prepare for
              your upcoming exam diets.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 hover:border-amber-500 shadow-sm hover:shadow-md transition">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-semibold">
              <Award className="w-3.5 h-3.5" />
              <span>Expert Lecturers</span>
            </div>
            <h3 className="text-lg font-bold text-[#1e3a8a]">
              Learn from the Best
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Our materials and resources are compiled by qualified
              professionals with years of teaching experience.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 hover:border-amber-500 shadow-sm hover:shadow-md transition">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-50 text-cyan-600 rounded-full text-xs font-semibold">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Support Hub</span>
            </div>
            <h3 className="text-lg font-bold text-[#1e3a8a]">
              Centralized Resource Hub
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Find solutions to past questions quickly without hopping across
              fragmented web pages or PDF folders.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: CLOSING CTA BAND — fills the dead whitespace that used
          to sit between the programme cards and the footer, and gives
          guests one last unambiguous next step. Same navy/amber palette
          as the hero, just inverted (light bg, colored text) so it reads
          as a footer-adjacent band rather than a second hero. */}
      {!user && (
        <section className="py-14 px-4 sm:px-6 border-t border-slate-200">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1e3a8a]">
              Ready to start your exam prep?
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Create a free account to unlock full course access, video
              lectures, and practice tests.
            </p>
            <Link
              href="/register"
              className="inline-block px-8 py-3.5 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold rounded-md shadow-md transition"
            >
              Register Free &rarr;
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
