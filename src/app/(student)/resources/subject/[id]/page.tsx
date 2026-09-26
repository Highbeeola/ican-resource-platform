import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Resource, Video } from "@/types";
import BookmarkButton from "@/components/resources/BookmarkButton";
import MarkCompletedButton from "@/components/resources/MarkCompletedButton";
import Link from "next/link";
import RatingPrompt from "@/components/resources/RatingPrompt";
import AITutorPanel from "@/components/resources/AITutorPanel";
import {
  PlayCircle,
  FileText,
  User,
  Clock,
  Star,
  Award,
  BarChart3,
  Target,
  CalendarRange,
  ArrowLeft,
  Lock,
} from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SubjectDetailsPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams; // Available for access if needed

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Fetch Subject with Level and Programme relations
  const { data: subject } = await supabase
    .from("subjects")
    .select("*, level:levels(*, programme:programmes(*))")
    .eq("id", id)
    .single();

  if (!subject) {
    notFound();
  }

  // 2. Fetch Modules for this Subject
  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .eq("subject_id", id)
    .order("display_order", { ascending: true });

  // 3. Fetch Resources and Videos
  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .eq("subject_id", id)
    .eq("is_published", true);

  const { data: videos } = await supabase
    .from("videos")
    .select("*")
    .eq("subject_id", id)
    .eq("is_published", true);

  // 4. Fetch Student Quiz Attempts / Analytics (only if user logged in)
  let quizzes: any[] = [];
  if (user) {
    const { data: quizData } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("subject_id", id)
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false });
    quizzes = quizData || [];
  }

  // Filter out Exam Prep & Pathfinder materials from regular curriculum
  const examPrepTypes = [
    "pathfinder",
    "past_question",
    "mock_question",
    "solution",
  ];
  const examPrepResources =
    resources?.filter((r) => examPrepTypes.includes(r.resource_type)) || [];
  const curriculumResources =
    resources?.filter((r) => !examPrepTypes.includes(r.resource_type)) || [];

  const totalItems = (curriculumResources.length || 0) + (videos?.length || 0);

  // 5. Fetch User Progress (only if user logged in)
  let completedCount = 0;
  if (user && totalItems > 0) {
    const resourceIds = curriculumResources.map((r) => r.id);
    const videoIds = videos?.map((v) => v.id) || [];

    const { count } = await supabase
      .from("user_progress")
      .select("id", { count: "exact" })
      .eq("user_id", user.id)
      .or(
        `resource_id.in.(${resourceIds.join(",") || "00000000-0000-0000-0000-000000000000"}),video_id.in.(${videoIds.join(",") || "00000000-0000-0000-0000-000000000000"})`,
      );
    completedCount = count || 0;
  }

  const progressPercentage =
    totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  // 6. Calculate Dynamic Rating
  const { data: ratings } = await supabase
    .from("course_ratings")
    .select("rating")
    .eq("subject_id", id);

  let avgRating: number | null = null;
  if (ratings && ratings.length > 0) {
    const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    avgRating = parseFloat((sum / ratings.length).toFixed(1));
  }

  return (
    <div
      className={`relative min-h-screen bg-slate-50 text-slate-900 ${
        !user ? "h-screen overflow-hidden" : ""
      }`}
    >
      {/* 🚨 OVERLAY AUTH GATE FOR UNAUTHENTICATED USERS */}
      {!user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 bg-blue-50 text-[#1e3a8a] rounded-xl flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#1e3a8a]">
                Access Restricted
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1.5 leading-relaxed">
                You need a KRL Academy account to access this course&apos;s
                syllabus, video lectures, and pathfinders.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <Link
                href="/register"
                className="w-full py-3 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold text-sm rounded-xl transition shadow-sm"
              >
                I&apos;m new here (Register Free)
              </Link>
              <Link
                href="/login"
                className="w-full py-3 bg-white border border-slate-300 text-[#1e3a8a] hover:bg-slate-50 font-bold text-sm rounded-xl transition"
              >
                I have an account (Log In)
              </Link>
            </div>

            <div>
              <Link
                href="/resources"
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
              >
                ← Back to Course Catalog
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* BACKGROUND COURSE DETAILS CONTENT */}
      <div
        className={`p-4 sm:p-6 md:p-10 ${
          !user ? "pointer-events-none select-none aria-hidden" : ""
        }`}
      >
        <div className="max-w-5xl mx-auto space-y-8">
          {/* BACK TO COURSES */}
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 hover:text-[#1e3a8a] transition bg-white px-3.5 py-2 rounded-lg border border-slate-200 shadow-sm w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Courses</span>
          </Link>

          {/* COURSE HEADER CARD */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <span className="px-3 py-1 bg-blue-50 text-[#1e3a8a] border border-blue-200 text-xs font-semibold rounded-full uppercase">
                {subject.level?.programme?.slug === "atswa" ? "ATSWA" : "ICAN"}{" "}
                • {subject.level?.name} Stage
              </span>

              <div className="flex justify-between items-start gap-4 mt-3">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1e3a8a]">
                  {subject.name}
                </h1>
                <BookmarkButton resourceId={subject.id} />
              </div>

              {subject.description && (
                <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                  {subject.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 border-t border-slate-100 pt-4">
              {subject.instructor_name && (
                <span className="flex items-center gap-1 font-semibold text-slate-900">
                  <User className="w-4 h-4 text-amber-500" />
                  {subject.instructor_name}
                </span>
              )}

              {subject.estimated_hours > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {subject.estimated_hours} Hours Total
                </span>
              )}

              {subject.start_date && (
                <p className="flex items-center gap-1.5">
                  <CalendarRange className="w-4 h-4 text-[#f59e0b]" />
                  Schedule:{" "}
                  <strong className="text-slate-900">
                    {new Date(subject.start_date).toLocaleDateString("en-GB", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {subject.end_date
                      ? ` - ${new Date(subject.end_date).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}`
                      : " (Ongoing)"}
                  </strong>
                </p>
              )}

              {avgRating !== null ? (
                <span className="flex items-center gap-1 text-amber-600 font-semibold">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  {avgRating} / 5.0 ({ratings?.length} student reviews)
                </span>
              ) : (
                <span className="text-slate-400 font-medium">
                  No reviews yet
                </span>
              )}
            </div>

            {/* DYNAMIC PROGRESS BAR & PRACTICE TEST ACTION */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Your Progress</span>
                  <span>
                    {progressPercentage}% Complete ({completedCount}/
                    {totalItems} items)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <Link
                  href={`/practice/${subject.id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm transition"
                >
                  <Award className="w-4 h-4" />
                  <span>Take Practice Test</span>
                </Link>
              </div>
            </div>
          </div>

          {/* LIVE CLASS / GOOGLE MEET BANNER */}
          {subject.meet_url && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-bold text-[#1e3a8a] flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  Live Class Session
                </h3>
                <p className="text-slate-600 text-sm mt-1">
                  {subject.meet_time ||
                    "Join the live interactive class with your lecturer."}
                </p>
              </div>
              <a
                href={subject.meet_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#1e3a8a] hover:bg-blue-800 text-white font-bold rounded-xl text-center text-sm transition shadow-md whitespace-nowrap"
              >
                Join Google Meet
              </a>
            </div>
          )}

          {/* COURSE CONTENT BREAKDOWN */}
          <div className="space-y-6 pt-4">
            <h2 className="text-xl font-bold text-[#1e3a8a] border-b border-slate-200 pb-2">
              Course Curriculum ({totalItems} Materials)
            </h2>

            <div className="space-y-6">
              {!modules || modules.length === 0 ? (
                <p className="text-sm text-slate-500 italic p-6 bg-white border border-slate-200 rounded-2xl">
                  Course modules are currently being updated by the faculty.
                </p>
              ) : (
                modules.map((mod) => {
                  const modVideos =
                    videos?.filter((v) => v.module_id === mod.id) || [];
                  const modResources =
                    curriculumResources.filter((r) => r.module_id === mod.id) ||
                    [];
                  const hasContent =
                    modVideos.length > 0 || modResources.length > 0;

                  return (
                    <div
                      key={mod.id}
                      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
                    >
                      <div className="bg-slate-50 border-b border-slate-200 p-5 sm:p-6">
                        <h3 className="text-lg font-bold text-[#1e3a8a]">
                          {mod.title}
                        </h3>
                        {mod.description && (
                          <p className="text-xs sm:text-sm text-slate-600 mt-1">
                            {mod.description}
                          </p>
                        )}
                      </div>

                      <div className="divide-y divide-slate-100">
                        {!hasContent ? (
                          <div className="p-5 text-xs text-slate-400 italic">
                            No content uploaded to this module yet.
                          </div>
                        ) : (
                          <>
                            {/* VIDEOS IN MODULE */}
                            {modVideos.map((vid: Video, vIdx: number) => (
                              <Link
                                key={vid.id}
                                href={`/resources/item/${vid.id}?type=video`}
                                className="group p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-blue-50/50 transition cursor-pointer"
                              >
                                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                                  <PlayCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                                  <div className="min-w-0">
                                    <h4 className="font-semibold text-slate-900 text-sm truncate sm:whitespace-normal group-hover:text-[#1e3a8a] transition-colors">
                                      {vIdx + 1}. {vid.title}
                                    </h4>
                                    <span className="text-[10px] uppercase font-bold text-slate-400">
                                      Video Lesson
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0 self-end sm:self-auto">
                                  <MarkCompletedButton
                                    subjectId={id}
                                    videoId={vid.id}
                                  />
                                  <span className="px-4 py-2 bg-blue-50 text-[#1e3a8a] text-xs font-bold rounded-lg group-hover:bg-[#1e3a8a] group-hover:text-white transition-colors whitespace-nowrap">
                                    Watch →
                                  </span>
                                </div>
                              </Link>
                            ))}

                            {/* PDFs/NOTES IN MODULE */}
                            {modResources.map((res: Resource, rIdx: number) => (
                              <Link
                                key={res.id}
                                href={`/resources/item/${res.id}?type=doc`}
                                className="group p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-amber-50/50 transition cursor-pointer"
                              >
                                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                                  <FileText className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5 sm:mt-0" />
                                  <div className="min-w-0">
                                    <h4 className="font-semibold text-slate-900 text-sm truncate sm:whitespace-normal group-hover:text-[#d97706] transition-colors">
                                      {modVideos.length + rIdx + 1}. {res.title}
                                    </h4>
                                    <span className="text-[10px] uppercase font-bold text-slate-400">
                                      {res.resource_type.replace("_", " ")}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 flex-shrink-0 self-end sm:self-auto">
                                  <MarkCompletedButton
                                    subjectId={id}
                                    resourceId={res.id}
                                  />
                                  <span className="px-4 py-2 bg-amber-50 text-[#d97706] text-xs font-bold rounded-lg group-hover:bg-[#f59e0b] group-hover:text-white transition-colors whitespace-nowrap">
                                    Read →
                                  </span>
                                </div>
                              </Link>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {/* UNASSIGNED MATERIALS (Files/Notes not linked to a specific module) */}
              {(() => {
                const unassignedVideos =
                  videos?.filter((v) => !v.module_id) || [];
                const unassignedDocs =
                  curriculumResources.filter((r) => !r.module_id) || [];

                if (
                  unassignedVideos.length === 0 &&
                  unassignedDocs.length === 0
                )
                  return null;

                return (
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mt-6">
                    <div className="bg-amber-50 p-5 border-b border-amber-100">
                      <h3 className="font-bold text-amber-900">
                        General Course Materials
                      </h3>
                      <p className="text-xs text-amber-700 mt-1">
                        Materials not assigned to a specific module.
                      </p>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {unassignedVideos.map((vid: Video) => (
                        <Link
                          key={vid.id}
                          href={`/resources/item/${vid.id}?type=video`}
                          className="group flex items-center justify-between p-4 hover:bg-blue-50 transition gap-4 cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <PlayCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                            <span className="text-sm font-semibold truncate group-hover:text-[#1e3a8a] transition-colors">
                              {vid.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0 self-end sm:self-auto">
                            <MarkCompletedButton
                              subjectId={id}
                              videoId={vid.id}
                            />
                            <span className="px-4 py-2 bg-blue-50 text-[#1e3a8a] text-xs font-bold rounded-lg group-hover:bg-[#1e3a8a] group-hover:text-white transition-colors whitespace-nowrap">
                              Watch →
                            </span>
                          </div>
                        </Link>
                      ))}
                      {unassignedDocs.map((doc: Resource) => (
                        <Link
                          key={doc.id}
                          href={`/resources/item/${doc.id}?type=doc`}
                          className="group flex items-center justify-between p-4 hover:bg-amber-50 transition gap-4 cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <FileText className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                            <span className="text-sm font-semibold truncate group-hover:text-[#d97706] transition-colors">
                              {doc.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0 self-end sm:self-auto">
                            <MarkCompletedButton
                              subjectId={id}
                              resourceId={doc.id}
                            />
                            <span className="px-4 py-2 bg-amber-50 text-[#d97706] text-xs font-bold rounded-lg group-hover:bg-[#f59e0b] group-hover:text-white transition-colors whitespace-nowrap">
                              Read →
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* DEDICATED EXAM PREP & PATHFINDERS SECTION */}
          {examPrepResources.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-[#1e3a8a] border-b border-slate-100 pb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#f59e0b]" /> Pathfinders & Past
                Questions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {examPrepResources.map((res: Resource) => (
                  <Link
                    href={`/resources/item/${res.id}?type=doc`}
                    key={res.id}
                    className="p-4 border border-slate-200 rounded-xl hover:border-amber-400 hover:shadow-md transition bg-slate-50 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded uppercase">
                        {res.resource_type.replace("_", " ")}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {res.exam_year || "PDF"}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 leading-tight">
                      {res.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* STUDENT QUIZ HISTORY / ANALYTICS */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#1e3a8a]" />
              <h3 className="text-lg font-bold text-[#1e3a8a]">
                Your Quiz History
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Date Taken</th>
                    <th className="p-4">Correct Answers</th>
                    <th className="p-4 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quizzes.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="p-6 text-center text-slate-500"
                      >
                        No quizzes taken for this subject yet.
                      </td>
                    </tr>
                  ) : (
                    quizzes.map((q: any) => (
                      <tr key={q.id}>
                        <td className="p-4">
                          {new Date(q.completed_at).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          {q.correct_answers} / {q.total_questions}
                        </td>
                        <td className="p-4 text-right">
                          <span
                            className={`px-2 py-1 rounded font-bold text-xs ${
                              q.score_percentage >= 50
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {q.score_percentage}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* STUDENT RATING PROMPT */}
          <RatingPrompt subjectId={id} />
        </div>

        {/* AI TUTOR PANEL */}
        <AITutorPanel subjectName={subject.name} />
      </div>
    </div>
  );
}
