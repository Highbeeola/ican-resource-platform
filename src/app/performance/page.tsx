import { createClient } from "@/lib/supabase/server";
import { getStudentPerformance } from "@/lib/services/performance";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Target,
  TrendingUp,
  TrendingDown,
  Award,
  BrainCircuit,
  Activity,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default async function PerformancePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { attempts, subjectAverages, overallAvg, totalQuestions } =
    await getStudentPerformance(user.id);

  const strongSubjects = subjectAverages.filter((s) => s.avgScore >= 70);
  const averageSubjects = subjectAverages.filter(
    (s) => s.avgScore >= 50 && s.avgScore < 70,
  );
  const weakSubjects = subjectAverages.filter((s) => s.avgScore < 50);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#f59e0b] transition mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e3a8a] flex items-center gap-3">
              <Target className="w-8 h-8 text-[#f59e0b]" />
              <span>Performance Analytics</span>
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Analyze your quiz scores, track progress across subjects, and
              identify areas needing improvement.
            </p>
          </div>
        </div>

        {attempts.length === 0 ? (
          /* EMPTY STATE */
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
              <BrainCircuit className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-[#1e3a8a]">
              No Performance Data Yet
            </h2>
            <p className="text-slate-500 max-w-md mx-auto text-xs sm:text-sm leading-relaxed">
              You haven't completed any practice quizzes yet. Take a test in the
              resources section to start building your diagnostic report.
            </p>
            <Link
              href="/resources"
              className="inline-flex items-center gap-2 mt-2 px-6 py-3.5 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold rounded-xl transition shadow-sm text-xs sm:text-sm"
            >
              <span>Explore Practice Quizzes</span>
            </Link>
          </div>
        ) : (
          <>
            {/* OVERALL METRICS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-sm flex flex-col justify-between">
                <div className="absolute -right-4 -top-4 opacity-5 text-[#1e3a8a]">
                  <Award className="w-32 h-32" />
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                    Overall Average
                  </p>
                  <p
                    className={`text-4xl font-black ${
                      overallAvg >= 50 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {overallAvg}%
                  </p>
                </div>
                <p className="text-[11px] text-slate-400 mt-4">
                  Aggregate score across all subjects
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                    Quizzes Completed
                  </p>
                  <p className="text-4xl font-black text-[#1e3a8a]">
                    {attempts.length}
                  </p>
                </div>
                <p className="text-[11px] text-slate-400 mt-4">
                  Total practice tests submitted
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                    Questions Attempted
                  </p>
                  <p className="text-4xl font-black text-[#d97706]">
                    {totalQuestions}
                  </p>
                </div>
                <p className="text-[11px] text-slate-400 mt-4">
                  Total multiple-choice questions evaluated
                </p>
              </div>
            </div>

            {/* STRENGTHS AND WEAKNESSES GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* STRONG SUBJECTS */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-[#1e3a8a] text-base">
                    Strong Subjects (70%+)
                  </h3>
                </div>
                {strongSubjects.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    No subjects have met the 70% mastery threshold yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {strongSubjects.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200"
                      >
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {sub.name}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {sub.totalAttempts}{" "}
                            {sub.totalAttempts === 1 ? "attempt" : "attempts"}
                          </p>
                        </div>
                        <span className="text-emerald-600 font-extrabold text-lg">
                          {sub.avgScore}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* WEAK SUBJECTS */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                  <TrendingDown className="w-5 h-5 text-rose-600" />
                  <h3 className="font-bold text-[#1e3a8a] text-base">
                    Requires Attention (&lt; 50%)
                  </h3>
                </div>
                {weakSubjects.length === 0 ? (
                  <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 p-3 rounded-xl font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      Great job! No weak subjects currently identified.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {weakSubjects.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex justify-between items-center bg-rose-50/50 p-4 rounded-xl border border-rose-200"
                      >
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {sub.name}
                          </p>
                          <p className="text-xs text-rose-600/80 mt-0.5">
                            {sub.totalAttempts}{" "}
                            {sub.totalAttempts === 1 ? "attempt" : "attempts"}
                          </p>
                        </div>
                        <span className="text-rose-600 font-extrabold text-lg">
                          {sub.avgScore}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RECENT ATTEMPTS TABLE */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#f59e0b]" />
                <h2 className="font-bold text-[#1e3a8a] text-base">
                  Recent Quiz History
                </h2>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[500px]">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-4">Date</th>
                      <th className="p-4">Subject</th>
                      <th className="p-4">Accuracy</th>
                      <th className="p-4 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {attempts.slice(0, 10).map((attempt) => (
                      <tr
                        key={attempt.id}
                        className="hover:bg-slate-50/80 transition"
                      >
                        <td className="p-4 whitespace-nowrap text-slate-500">
                          {new Date(attempt.completed_at).toLocaleDateString(
                            "en-GB",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        </td>
                        <td className="p-4 font-bold text-slate-900">
                          {attempt.subject?.name || "General Quiz"}
                        </td>
                        <td className="p-4 text-slate-500">
                          {attempt.correct_answers} / {attempt.total_questions}{" "}
                          correct
                        </td>
                        <td className="p-4 text-right">
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                              attempt.score_percentage >= 50
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {attempt.score_percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
