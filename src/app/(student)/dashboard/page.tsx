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
  PlayCircle,
  TrendingUp,
  Target,
  Megaphone,
  AlertCircle,
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
    quizCount,
    avgQuizScore,
    recentActivity,
    recommendations,
    announcement,
  } = await getStudentDashboardData(user.id);

  // Safely fetch subjects only if a level slug is assigned to the profile
  const subjects = profile?.level?.slug
    ? await getSubjects(profile.level.slug)
    : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* WELCOME & PROGRAMME BANNER */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-[#1e3a8a] font-extrabold text-xl flex items-center justify-center">
              {profile?.full_name?.charAt(0) || "S"}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e3a8a]">
                Welcome, {profile?.full_name || "Student"}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2.5 py-0.5 bg-[#1e3a8a] text-white text-xs font-bold rounded-md uppercase">
                  {profile?.level?.programme?.name || "Programme"}
                </span>
                <span className="text-slate-500 text-xs sm:text-sm font-medium">
                  {profile?.level?.name || "Unassigned Stage"}
                </span>
              </div>
            </div>
          </div>
          <Link
            href="/performance"
            className="w-full md:w-auto px-6 py-3.5 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-md"
          >
            <Target className="w-4 h-4" />
            <span>My Performance Profile</span>
          </Link>
        </div>

        {/* SYSTEM ANNOUNCEMENT ALERT */}
        {announcement && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 shadow-sm">
            <Megaphone className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                {announcement.title}
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                {announcement.content}
              </p>
            </div>
          </div>
        )}

        {/* METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">
                Completed Modules
              </p>
              <p className="text-3xl font-extrabold text-[#1e3a8a] mt-1">
                {completedCount}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-500 opacity-20" />
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">
                Quizzes Taken
              </p>
              <p className="text-3xl font-extrabold text-[#1e3a8a] mt-1">
                {quizCount}
              </p>
            </div>
            <Award className="w-8 h-8 text-blue-500 opacity-20" />
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">
                Average Score
              </p>
              <p className="text-3xl font-extrabold text-[#1e3a8a] mt-1">
                {quizCount > 0 ? `${avgQuizScore}%` : "N/A"}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-amber-500 opacity-20" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: ACTIVITY & RECOMMENDATIONS */}
          <div className="lg:col-span-2 space-y-8">
            {/* CONTINUE LEARNING */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-[#1e3a8a] flex items-center gap-2 border-b border-slate-100 pb-3">
                <PlayCircle className="w-5 h-5 text-[#f59e0b]" /> Continue
                Learning
              </h2>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-slate-500 py-4">
                  No recent activity. Start a course to track your progress
                  here!
                </p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity: any) => {
                    const item = activity.video || activity.resource;
                    const type = activity.video ? "video" : "doc";
                    if (!item) return null;
                    return (
                      <Link
                        href={`/resources/item/${item.id}?type=${type}`}
                        key={activity.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition group"
                      >
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm group-hover:text-[#1e3a8a] transition">
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {item.subject?.name}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#1e3a8a]" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* REVISION RECOMMENDATIONS */}
            {recommendations.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                  <div>
                    <h2 className="text-lg font-bold text-[#1e3a8a]">
                      Targeted Revision Recommended
                    </h2>
                    <p className="text-xs text-slate-500">
                      Based on recent low quiz scores, review these lectures.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recommendations.map((rec: any) => (
                    <Link
                      href={`/resources/item/${rec.id}?type=video`}
                      key={rec.id}
                      className="bg-rose-50 border border-rose-100 p-4 rounded-xl hover:shadow-md transition"
                    >
                      <h4 className="font-bold text-slate-900 text-sm">
                        {rec.title}
                      </h4>
                      <p className="text-xs text-rose-600 font-semibold mt-1">
                        {rec.subject?.name}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: SUBJECT PROGRESS */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm h-fit">
            <h2 className="text-lg font-bold text-[#1e3a8a] border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#1e3a8a]" /> Your Syllabus
            </h2>

            <div className="space-y-5 max-h-[400px] overflow-y-auto pr-2">
              {subjects.length > 0 ? (
                subjects.map((sub: any) => (
                  <div key={sub.id}>
                    <div className="flex justify-between items-end mb-1">
                      <Link
                        href={`/resources/subject/${sub.id}`}
                        className="font-bold text-sm text-slate-900 hover:text-[#f59e0b] transition"
                      >
                        {sub.name}
                      </Link>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {sub.level?.name}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#1e3a8a] h-full rounded-full w-0 transition-all duration-500"></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 space-y-3 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <p className="text-xs sm:text-sm text-slate-500 px-4">
                    Please select your ICAN or ATSWA stage during registration
                    or in your settings to view your specific syllabus here.
                  </p>
                  <Link
                    href="/resources"
                    className="inline-block text-xs font-bold text-[#f59e0b] hover:underline"
                  >
                    Browse All Courses →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
