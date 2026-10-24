import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Resource, Video } from "@/types";
import BookmarkButton from "@/components/resources/BookmarkButton";
import MarkCompletedButton from "@/components/resources/MarkCompletedButton";
import PaystackEnrollButton from "@/components/resources/PaystackEnrollButton";
import Link from "next/link";
import RatingPrompt from "@/components/resources/RatingPrompt";
import AITutorPanel from "@/components/resources/AITutorPanel";
import {
  PlayCircle,
  FileText,
  User,
  Clock,
  Star,
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

  // 2. CHECK ENROLLMENT STATUS
  let isEnrolled = false;
  if (user) {
    // Check if they are an admin (admins get free access to everything)
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_super_admin")
      .eq("id", user.id)
      .single();
    const isAdmin = profile?.role === "admin" || profile?.is_super_admin;

    // Check if they paid for this specific course
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("level_id", subject.level.id)
      .eq("status", "active")
      .maybeSingle();

    // They have access IF: They are admin, OR they are enrolled, OR the course is Free (0)
    isEnrolled =
      !!enrollment || isAdmin || subject.level?.price === 0 || !subject.price;
  }

  // Format the price in Naira
  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(subject.level?.price || 0);

  // 3. Fetch Modules for this Subject
  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .eq("subject_id", id)
    .order("display_order", { ascending: true });

  // 4. Fetch Resources and Videos
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

  // 5. Fetch Student Quiz Attempts / Analytics (only if user logged in)
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

  // 6. Fetch User Progress (only if user logged in)
  const completedResourceIds = new Set<string>();
  const completedVideoIds = new Set<string>();
  if (user && totalItems > 0) {
    const resourceIds = curriculumResources.map((r) => r.id);
    const videoIds = videos?.map((v) => v.id) || [];

    const { data: progressRows } = await supabase
      .from("user_progress")
      .select("resource_id, video_id")
      .eq("user_id", user.id)
      .or(
        `resource_id.in.(${
          resourceIds.join(",") || "00000000-0000-0000-0000-000000000000"
        }),video_id.in.(${
          videoIds.join(",") || "00000000-0000-0000-0000-000000000000"
        })`,
      );

    for (const row of progressRows || []) {
      if (row.resource_id) completedResourceIds.add(row.resource_id);
      if (row.video_id) completedVideoIds.add(row.video_id);
    }
  }
  const completedCount = completedResourceIds.size + completedVideoIds.size;

  const progressPercentage =
    totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  // 7. Calculate Dynamic Rating
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
    <div className="relative min-h-screen bg-slate-50 text-slate-900">
      {/* BACKGROUND COURSE DETAILS CONTENT */}
      <div className="p-4 sm:p-6 md:p-10">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* BACK TO COURSES */}
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 hover:text-ink transition bg-white px-3.5 py-2 rounded-lg border border-slate-200 shadow-sm w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Courses</span>
          </Link>

          {/* COURSE HEADER CARD */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <span className="px-3 py-1 bg-blue-50 text-ink border border-blue-200 text-xs font-semibold rounded-full uppercase">
                {subject.level?.programme?.slug === "atswa" ? "ATSWA" : "ICAN"}{" "}
                • {subject.level?.name} Stage
              </span>

              <div className="flex justify-between items-start gap-4 mt-3">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-ink">
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
                  <CalendarRange className="w-4 h-4 text-accent" />
                  Schedule:{" "}
                  <strong className="text-slate-900">
                    {new Date(subject.start_date).toLocaleDateString("en-GB", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {subject.end_date
                      ? ` - ${new Date(subject.end_date).toLocaleDateString(
                          "en-GB",
                          { month: "short", day: "numeric", year: "numeric" },
                        )}`
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

            {/* DYNAMIC PROGRESS BAR & ENROLLMENT ACTION */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              {user && (
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
              )}

              {/* DYNAMIC ENROLLMENT CTA */}
              <div className="w-full sm:w-auto flex flex-col gap-2">
                {!user ? (
                  <Link
                    href="/login"
                    className="px-8 py-3.5 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl flex justify-center items-center shadow-md transition"
                  >
                    Login to Enroll
                  </Link>
                ) : !isEnrolled ? (
                  <PaystackEnrollButton
                    levelId={subject.level_id}
                    amount={subject.level?.price || 0}
                    email={user.email || ""}
                    levelName={subject.level?.name || "this Stage"}
                  />
                ) : (
                  <Link
                    href={`/practice/${subject.id}`}
                    className="px-8 py-3 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <Target className="w-4 h-4" /> Take Practice Test
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* LIVE CLASS / GOOGLE MEET BANNER */}
          {subject.meet_url && isEnrolled && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-bold text-ink flex items-center gap-2">
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
                className="w-full sm:w-auto px-8 py-3.5 bg-ink hover:bg-blue-800 text-white font-bold rounded-xl text-center text-sm transition shadow-md whitespace-nowrap"
              >
                Join Google Meet
              </a>
            </div>
          )}

          {/* COURSE CONTENT BREAKDOWN */}
          <div className="space-y-6 pt-4">
            <h2 className="text-xl font-bold text-ink border-b border-slate-200 pb-2">
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
                        <h3 className="text-lg font-bold text-ink">
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
                            {modVideos.map((vid: Video, vIdx: number) => {
                              const content = (
                                <div className="group p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-blue-50/50 transition cursor-pointer">
                                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                                    <PlayCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                                    <div className="min-w-0">
                                      <h4 className="font-semibold text-slate-900 text-sm truncate sm:whitespace-normal group-hover:text-ink transition-colors">
                                        {vIdx + 1}. {vid.title}
                                      </h4>
                                      <span className="text-[10px] uppercase font-bold text-slate-400">
                                        Video Lesson
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                                    {isEnrolled ? (
                                      <>
                                        <MarkCompletedButton
                                          subjectId={id}
                                          videoId={vid.id}
                                          initialIsCompleted={completedVideoIds.has(
                                            vid.id,
                                          )}
                                        />
                                        <span className="px-3.5 py-1.5 bg-blue-50 text-ink text-xs font-bold rounded-xl group-hover:bg-ink group-hover:text-white transition-colors h-9 flex items-center">
                                          Watch →
                                        </span>
                                      </>
                                    ) : (
                                      <span className="px-3.5 py-1.5 bg-slate-100 text-slate-400 text-xs font-bold rounded-xl flex items-center gap-1.5 h-9">
                                        <Lock className="w-3.5 h-3.5" /> Locked
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );

                              return isEnrolled ? (
                                <Link
                                  key={vid.id}
                                  href={`/resources/item/${vid.id}?type=video`}
                                >
                                  {content}
                                </Link>
                              ) : (
                                <div key={vid.id}>{content}</div>
                              );
                            })}

                            {/* PDFs/NOTES IN MODULE */}
                            {modResources.map((res: Resource, rIdx: number) => {
                              const content = (
                                <div className="group p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-amber-50/50 transition cursor-pointer">
                                  <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                                    <FileText className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5 sm:mt-0" />
                                    <div className="min-w-0">
                                      <h4 className="font-semibold text-slate-900 text-sm truncate sm:whitespace-normal group-hover:text-accent-hover transition-colors">
                                        {modVideos.length + rIdx + 1}.{" "}
                                        {res.title}
                                      </h4>
                                      <span className="text-[10px] uppercase font-bold text-slate-400">
                                        {res.resource_type.replace("_", " ")}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                    {isEnrolled ? (
                                      <>
                                        <MarkCompletedButton
                                          subjectId={id}
                                          resourceId={res.id}
                                          initialIsCompleted={completedResourceIds.has(
                                            res.id,
                                          )}
                                        />
                                        <span className="inline-flex items-center justify-center px-3.5 py-1.5 bg-amber-50 text-accent-hover text-xs font-bold rounded-xl group-hover:bg-accent group-hover:text-white transition-colors h-9 shrink-0">
                                          Read →
                                        </span>
                                      </>
                                    ) : (
                                      <span className="px-3.5 py-1.5 bg-slate-100 text-slate-400 text-xs font-bold rounded-xl flex items-center gap-1.5 h-9">
                                        <Lock className="w-3.5 h-3.5" /> Locked
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );

                              return isEnrolled ? (
                                <Link
                                  key={res.id}
                                  href={`/resources/item/${res.id}?type=doc`}
                                >
                                  {content}
                                </Link>
                              ) : (
                                <div key={res.id}>{content}</div>
                              );
                            })}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {/* UNASSIGNED MATERIALS */}
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
                      {unassignedVideos.map((vid: Video) => {
                        const content = (
                          <div className="group flex items-center justify-between p-4 hover:bg-blue-50 transition gap-4 cursor-pointer">
                            <div className="flex items-center gap-3 min-w-0">
                              <PlayCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                              <span className="text-sm font-semibold truncate group-hover:text-ink transition-colors">
                                {vid.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                              {isEnrolled ? (
                                <>
                                  <MarkCompletedButton
                                    subjectId={id}
                                    videoId={vid.id}
                                    initialIsCompleted={completedVideoIds.has(
                                      vid.id,
                                    )}
                                  />
                                  <span className="px-3.5 py-1.5 bg-blue-50 text-ink text-xs font-bold rounded-xl group-hover:bg-ink group-hover:text-white transition-colors h-9 flex items-center">
                                    Watch →
                                  </span>
                                </>
                              ) : (
                                <span className="px-3.5 py-1.5 bg-slate-100 text-slate-400 text-xs font-bold rounded-xl flex items-center gap-1.5 h-9">
                                  <Lock className="w-3.5 h-3.5" /> Locked
                                </span>
                              )}
                            </div>
                          </div>
                        );

                        return isEnrolled ? (
                          <Link
                            key={vid.id}
                            href={`/resources/item/${vid.id}?type=video`}
                          >
                            {content}
                          </Link>
                        ) : (
                          <div key={vid.id}>{content}</div>
                        );
                      })}

                      {unassignedDocs.map((doc: Resource) => {
                        const content = (
                          <div className="group flex items-center justify-between p-4 hover:bg-amber-50 transition gap-4 cursor-pointer">
                            <div className="flex items-center gap-3 min-w-0">
                              <FileText className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                              <span className="text-sm font-semibold truncate group-hover:text-accent-hover transition-colors">
                                {doc.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                              {isEnrolled ? (
                                <>
                                  <MarkCompletedButton
                                    subjectId={id}
                                    resourceId={doc.id}
                                    initialIsCompleted={completedResourceIds.has(
                                      doc.id,
                                    )}
                                  />
                                  <span className="inline-flex items-center justify-center px-3.5 py-1.5 bg-amber-50 text-accent-hover text-xs font-bold rounded-xl group-hover:bg-accent group-hover:text-white transition-colors h-9 shrink-0">
                                    Read →
                                  </span>
                                </>
                              ) : (
                                <span className="px-3.5 py-1.5 bg-slate-100 text-slate-400 text-xs font-bold rounded-xl flex items-center gap-1.5 h-9">
                                  <Lock className="w-3.5 h-3.5" /> Locked
                                </span>
                              )}
                            </div>
                          </div>
                        );

                        return isEnrolled ? (
                          <Link
                            key={doc.id}
                            href={`/resources/item/${doc.id}?type=doc`}
                          >
                            {content}
                          </Link>
                        ) : (
                          <div key={doc.id}>{content}</div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* DEDICATED EXAM PREP & PATHFINDERS SECTION */}
          {examPrepResources.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-ink border-b border-slate-100 pb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-accent" /> Pathfinders & Past
                Questions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {examPrepResources.map((res: Resource) => {
                  const content = (
                    <div className="p-4 border border-slate-200 rounded-xl hover:border-amber-400 hover:shadow-md transition bg-slate-50 flex flex-col gap-2 h-full justify-between">
                      <div className="flex justify-between items-start">
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded uppercase">
                          {res.resource_type.replace("_", " ")}
                        </span>
                        {isEnrolled ? (
                          <span className="text-xs font-bold text-amber-600">
                            Access Granted →
                          </span>
                        ) : (
                          <Lock className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <h4 className="font-semibold text-slate-900 text-sm">
                        {res.title}
                      </h4>
                    </div>
                  );

                  return isEnrolled ? (
                    <Link
                      key={res.id}
                      href={`/resources/item/${res.id}?type=doc`}
                    >
                      {content}
                    </Link>
                  ) : (
                    <div key={res.id}>{content}</div>
                  );
                })}
              </div>
            </div>
          )}

          {/* QUIZ ATTEMPTS & ANALYTICS SECTION */}
          {user && quizzes.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-ink border-b border-slate-100 pb-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" /> Recent Quiz
                Attempts
              </h3>
              <div className="divide-y divide-slate-100">
                {quizzes.slice(0, 5).map((q: any) => (
                  <div
                    key={q.id}
                    className="py-3 flex justify-between items-center text-xs sm:text-sm"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">
                        Score: {q.score}%
                      </p>
                      <p className="text-slate-400 text-xs">
                        {new Date(q.completed_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                        q.score >= 50
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {q.score >= 50 ? "Passed" : "Needs Review"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RATING PROMPT */}
          {user && isEnrolled && (
            <RatingPrompt subjectId={subject.id} userId={user.id} />
          )}
        </div>
      </div>

      {/* AI TUTOR PANEL OVERLAY */}
      <AITutorPanel subjectId={subject.id} subjectName={subject.name} />
    </div>
  );
}
