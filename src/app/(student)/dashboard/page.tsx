import { createClient } from "@/lib/supabase/server";
import { getStudentDashboardData } from "@/lib/services/dashboard";
import { getSubjects } from "@/lib/services/resources";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle,
  Award,
  ArrowRight,
  Bookmark,
  TrendingUp,
  Target,
} from "lucide-react";

export default async function StudentDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const {
    profile,
    completedCount,
    favoritesCount,
    quizCount,
    avgQuizScore,
    favorites,
  } = await getStudentDashboardData(user.id);
  const subjects = await getSubjects();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* STUDENT PROFILE BANNER */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-[#1e3a8a] font-extrabold text-xl flex items-center justify-center flex-shrink-0">
              {profile?.full_name?.charAt(0) || "S"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e3a8a]">
                  Welcome back, {profile?.full_name || "Student"}!
                </h1>
                <span className="px-2.5 py-0.5 bg-[#f59e0b]/10 text-[#d97706] text-xs font-bold rounded-full border border-[#f59e0b]/20">
                  {profile?.role === "admin"
                    ? "Faculty Admin"
                    : "Active Student"}
                </span>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                {user.email} •{" "}
                {profile?.level?.name || "ICAN / ATSWA Candidate"}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              href="/performance"
              className="w-full md:w-auto px-6 py-3.5 bg-blue-50 hover:bg-blue-100 text-[#1e3a8a] font-bold rounded-xl text-center text-xs sm:text-sm transition flex items-center justify-center gap-2 border border-blue-200"
            >
              <Target className="w-4 h-4" />
              <span>View Analytics</span>
            </Link>
            <Link
              href="/resources"
              className="w-full md:w-auto px-6 py-3.5 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold rounded-xl text-center text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-md"
            >
              <span>Continue Learning</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* METRICS STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm">
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-xs font-semibold uppercase">
                Completed Modules
              </span>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-3xl font-extrabold text-[#1e3a8a]">
              {completedCount}
            </p>
            <p className="text-[11px] text-slate-500">
              PDFs and videos finished
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm">
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-xs font-semibold uppercase">
                Practice Quizzes
              </span>
              <Award className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-3xl font-extrabold text-[#1e3a8a]">
              {quizCount}
            </p>
            <p className="text-[11px] text-slate-500">Attempts completed</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm">
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-xs font-semibold uppercase">
                Average Score
              </span>
              <TrendingUp className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-3xl font-extrabold text-[#1e3a8a]">
              {quizCount > 0 ? `${avgQuizScore}%` : "N/A"}
            </p>
            <p className="text-[11px] text-slate-500">
              Across all subject tests
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm">
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-xs font-semibold uppercase">
                Saved Items
              </span>
              <Bookmark className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-3xl font-extrabold text-[#1e3a8a]">
              {favoritesCount}
            </p>
            <p className="text-[11px] text-slate-500">Bookmarked resources</p>
          </div>
        </div>

        {/* SUBJECT PROGRESS BREAKDOWN */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-[#1e3a8a] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#f59e0b]" />
                <span>Subject Learning Progress</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Track your study completion rate per subject.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {subjects.slice(0, 6).map((sub) => (
              <div
                key={sub.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      {sub.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {sub.level?.name || "ICAN"} Stage
                    </p>
                  </div>
                  <Link
                    href={`/resources/subject/${sub.id}`}
                    className="text-xs font-bold text-[#f59e0b] hover:underline flex items-center gap-1"
                  >
                    <span>Study</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#1e3a8a] h-full rounded-full w-0 transition-all duration-500"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SAVED & BOOKMARKED MATERIALS */}
        {favorites.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
            <h2 className="text-xl font-bold text-[#1e3a8a] flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-purple-600" />
              <span>Saved Bookmarks</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((fav: any) => {
                const item = fav.resource || fav.video;
                return (
                  <div
                    key={fav.id}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2"
                  >
                    <span className="text-[10px] font-bold uppercase text-[#d97706] px-2 py-0.5 bg-[#f59e0b]/10 rounded-full border border-[#f59e0b]/20">
                      {fav.resource ? "Document" : "Video"}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                      {item?.title}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {item?.subject?.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
