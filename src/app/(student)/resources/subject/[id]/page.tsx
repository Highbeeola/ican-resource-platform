import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Subject, Resource, Video } from "@/types";
import BookmarkButton from "@/components/resources/BookmarkButton";
import BackButton from "@/components/navigation/BackButton";
import Link from "next/link";
import { notFound } from "next/navigation";
import RatingPrompt from "@/components/resources/RatingPrompt";
import { PlayCircle, FileText, User, Clock, Star, Award } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SubjectDetailsPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/register");
  }

  // 1. Fetch Subject
  const { data: subject } = await supabase
    .from("subjects")
    .select("*, level:levels(*)")
    .eq("id", id)
    .single();

  if (!subject) {
    notFound();
  }

  // 2. Fetch Resources and Videos
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

  const totalItems = (resources?.length || 0) + (videos?.length || 0);

  // 3. Fetch User Progress (Calculate real progress %)
  let completedCount = 0;
  if (user && totalItems > 0) {
    const resourceIds = resources?.map((r) => r.id) || [];
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

  // 4. Calculate Dynamic Rating
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
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* BACK TO COURSES */}
        <BackButton text="Back to Courses" />

        {/* COURSE HEADER CARD */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <span className="px-3 py-1 bg-blue-50 text-[#1e3a8a] border border-blue-200 text-xs font-semibold rounded-full uppercase">
              {subject.level?.name} Stage
            </span>

            {/* SUBJECT NAME & BOOKMARK BUTTON */}
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

            {/* DYNAMIC RATING DISPLAY */}
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

              {/* TAKE PRACTICE TEST BUTTON */}
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

        {/* COURSE CONTENT BREAKDOWN (SIDE-BY-SIDE ON DESKTOP) */}
        <div className="space-y-6 pt-4">
          <h2 className="text-xl font-bold text-[#1e3a8a] border-b border-slate-200 pb-2">
            Course Content & Modules ({totalItems})
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT COLUMN: VIDEO LECTURES */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-rose-500" />
                <span>Video Lectures ({videos?.length || 0})</span>
              </h3>

              <div className="space-y-3">
                {!videos || videos.length === 0 ? (
                  <p className="text-sm text-slate-500 italic p-4 border border-dashed border-slate-200 rounded-xl">
                    No video lectures uploaded yet.
                  </p>
                ) : (
                  videos.map((vid: Video, index: number) => (
                    <div
                      key={vid.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-400 transition shadow-sm"
                    >
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg flex-shrink-0">
                          <PlayCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 text-sm">
                            {index + 1}. {vid.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {vid.duration_minutes
                              ? `${vid.duration_minutes} mins`
                              : "Video Lecture"}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/resources/item/${vid.id}?type=video`}
                        className="w-full sm:w-auto px-4 py-2 bg-[#f59e0b] hover:bg-[#d97706] text-white text-xs font-bold rounded-lg transition text-center whitespace-nowrap"
                      >
                        Start Video →
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: PDF STUDY MATERIALS */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-500" />
                <span>Study Documents ({resources?.length || 0})</span>
              </h3>

              <div className="space-y-3">
                {!resources || resources.length === 0 ? (
                  <p className="text-sm text-slate-500 italic p-4 border border-dashed border-slate-200 rounded-xl">
                    No documents uploaded yet.
                  </p>
                ) : (
                  resources.map((res: Resource, index: number) => (
                    <div
                      key={res.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-amber-400 transition shadow-sm"
                    >
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className="bg-amber-50 text-amber-700 p-2.5 rounded-lg flex-shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 text-sm">
                            {index + 1}. {res.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5 capitalize">
                            {res.resource_type.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/resources/item/${res.id}?type=doc`}
                        className="w-full sm:w-auto px-4 py-2 bg-[#f59e0b] hover:bg-[#d97706] text-white text-xs font-bold rounded-lg transition text-center whitespace-nowrap"
                      >
                        View Material →
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* STUDENT RATING PROMPT */}
        {user && <RatingPrompt subjectId={id} />}
      </div>
    </div>
  );
}
