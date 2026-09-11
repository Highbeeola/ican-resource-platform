import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Resource, Video } from "@/types";
import BookmarkButton from "@/components/resources/BookmarkButton";
import BackButton from "@/components/navigation/BackButton";
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
  FolderOpen,
  BarChart3,
  Target,
  CalendarRange,
} from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SubjectDetailsPage({ params }: Props) {
  const { id } = await params;
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

  // 4. Fetch Student Quiz Attempts / Analytics
  let quizzes: any[] = [];
  if (user) {
    const { data: quizData } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("quiz_id", id)
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

  // 5. Fetch User Progress
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

  // Unassigned Content (Items without module_id assigned, excluding pathfinders)
  const unassignedVideos = videos?.filter((v) => !v.module_id) || [];
  const unassignedResources =
    curriculumResources.filter((r) => !r.module_id) || [];
  const hasUnassignedContent =
    unassignedVideos.length > 0 || unassignedResources.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* BACK TO COURSES */}
        <BackButton text="Back to Courses" />

        {/* COURSE HEADER CARD */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <span className="px-3 py-1 bg-blue-50 text-[#1e3a8a] border border-blue-200 text-xs font-semibold rounded-full uppercase">
              {subject.level?.programme?.slug === "atswa" ? "ATSWA" : "ICAN"} •{" "}
              {subject.level?.name} Stage
            </span>

            <div className="flex justify-between items-start gap-4 mt-3">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1e3a8a]">
                {subject.name}
              </h1>
              {user && <BookmarkButton resourceId={subject.id} />}
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
              <span className="text-slate-400 font-medium">No reviews yet</span>
            )}
          </div>

          {/* DYNAMIC PROGRESS BAR & PRACTICE TEST ACTION */}
          {user && (
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
          )}
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
            {user ? (
              <a
                href={subject.meet_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#1e3a8a] hover:bg-blue-800 text-white font-bold rounded-xl text-center text-sm transition shadow-md whitespace-nowrap"
              >
                Join Google Meet
              </a>
            ) : (
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-200 text-slate-700 font-bold rounded-xl text-center text-sm transition whitespace-nowrap flex items-center justify-center gap-1.5"
              >
                🔒 Login to Join
              </Link>
            )}
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
              modules.map((mod, index) => {
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
                        Module {index + 1}: {mod.title}
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
                            <div
                              key={vid.id}
                              className="p-4 sm:p-5 flex items-center justify-between hover:bg-blue-50/50 transition"
                            >
                              <div className="flex items-center gap-3.5">
                                <PlayCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                                <div>
                                  <h4 className="font-semibold text-slate-900 text-sm">
                                    {vIdx + 1}. {vid.title}
                                  </h4>
                                  <span className="text-[10px] uppercase font-bold text-slate-400">
                                    Video Lesson
                                  </span>
                                </div>
                              </div>
                              {user ? (
                                <div className="flex items-center gap-2">
                                  <MarkCompletedButton
                                    subjectId={id}
                                    videoId={vid.id}
                                  />
                                  <Link
                                    href={`/resources/item/${vid.id}?type=video`}
                                    className="px-4 py-2 bg-blue-50 text-[#1e3a8a] text-xs font-bold rounded-lg hover:bg-blue-100 transition whitespace-nowrap"
                                  >
                                    Watch →
                                  </Link>
                                </div>
                              ) : (
                                <Link
                                  href="/register"
                                  className="px-4 py-2 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg hover:bg-slate-200 transition flex items-center gap-1 whitespace-nowrap"
                                >
                                  🔒 Login to Watch
                                </Link>
                              )}
                            </div>
                          ))}

                          {/* PDFs/NOTES IN MODULE */}
                          {modResources.map((res: Resource, rIdx: number) => (
                            <div
                              key={res.id}
                              className="p-4 sm:p-5 flex items-center justify-between hover:bg-amber-50/50 transition"
                            >
                              <div className="flex items-center gap-3.5">
                                <FileText className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                <div>
                                  <h4 className="font-semibold text-slate-900 text-sm">
                                    {modVideos.length + rIdx + 1}. {res.title}
                                  </h4>
                                  <span className="text-[10px] uppercase font-bold text-slate-400">
                                    {res.resource_type.replace("_", " ")}
                                  </span>
                                </div>
                              </div>
                              {user ? (
                                <div className="flex items-center gap-2">
                                  <MarkCompletedButton
                                    subjectId={id}
                                    resourceId={res.id}
                                  />
                                  <Link
                                    href={`/resources/item/${res.id}?type=doc`}
                                    className="px-4 py-2 bg-amber-50 text-[#d97706] text-xs font-bold rounded-lg hover:bg-[#f59e0b] hover:text-white transition whitespace-nowrap"
                                  >
                                    Read →
                                  </Link>
                                </div>
                              ) : (
                                <Link
                                  href="/register"
                                  className="px-4 py-2 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg hover:bg-slate-200 transition flex items-center gap-1 whitespace-nowrap"
                                >
                                  🔒 Login to Read
                                </Link>
                              )}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* UNASSIGNED GENERAL MATERIALS */}
            {hasUnassignedContent && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mt-8">
                <div className="bg-slate-100 border-b border-slate-200 p-5 sm:p-6 flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-[#1e3a8a]" />
                  <h3 className="text-lg font-bold text-[#1e3a8a]">
                    General Course Materials
                  </h3>
                </div>

                <div className="divide-y divide-slate-100">
                  {unassignedVideos.map((vid: Video, vIdx: number) => (
                    <div
                      key={vid.id}
                      className="p-4 sm:p-5 flex items-center justify-between hover:bg-blue-50/50 transition"
                    >
                      <div className="flex items-center gap-3.5">
                        <PlayCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-slate-900 text-sm">
                            {vIdx + 1}. {vid.title}
                          </h4>
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            Video Lesson
                          </span>
                        </div>
                      </div>
                      {user ? (
                        <div className="flex items-center gap-2">
                          <MarkCompletedButton
                            subjectId={id}
                            videoId={vid.id}
                          />
                          <Link
                            href={`/resources/item/${vid.id}?type=video`}
                            className="px-4 py-2 bg-blue-50 text-[#1e3a8a] text-xs font-bold rounded-lg hover:bg-[#1e3a8a] hover:text-white transition whitespace-nowrap"
                          >
                            Watch →
                          </Link>
                        </div>
                      ) : (
                        <Link
                          href="/register"
                          className="px-4 py-2 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg hover:bg-slate-200 transition flex items-center gap-1 whitespace-nowrap"
                        >
                          🔒 Login to Watch
                        </Link>
                      )}
                    </div>
                  ))}

                  {unassignedResources.map((res: Resource, rIdx: number) => (
                    <div
                      key={res.id}
                      className="p-4 sm:p-5 flex items-center justify-between hover:bg-amber-50/50 transition"
                    >
                      <div className="flex items-center gap-3.5">
                        <FileText className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-slate-900 text-sm">
                            {unassignedVideos.length + rIdx + 1}. {res.title}
                          </h4>
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            {res.resource_type.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                      {user ? (
                        <div className="flex items-center gap-2">
                          <MarkCompletedButton
                            subjectId={id}
                            resourceId={res.id}
                          />
                          <Link
                            href={`/resources/item/${res.id}?type=doc`}
                            className="px-4 py-2 bg-amber-50 text-[#d97706] text-xs font-bold rounded-lg hover:bg-[#f59e0b] hover:text-white transition whitespace-nowrap"
                          >
                            Read →
                          </Link>
                        </div>
                      ) : (
                        <Link
                          href="/register"
                          className="px-4 py-2 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg hover:bg-slate-200 transition flex items-center gap-1 whitespace-nowrap"
                        >
                          🔒 Login to Read
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                  href={
                    user ? `/resources/item/${res.id}?type=doc` : "/register"
                  }
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
                  {!user && (
                    <span className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-1">
                      🔒 Login to Read
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* STUDENT QUIZ HISTORY / ANALYTICS */}
        {user && (
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
                  {!quizzes || quizzes.length === 0 ? (
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
        )}

        {/* STUDENT RATING PROMPT */}
        {user && <RatingPrompt subjectId={id} />}
      </div>

      {/* AI TUTOR PANEL */}
      {user && <AITutorPanel subjectName={subject.name} />}
    </div>
  );
}
