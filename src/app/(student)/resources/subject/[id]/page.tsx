import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Resource, Video } from "@/types";
import BookmarkButton from "@/components/resources/BookmarkButton";
import BackButton from "@/components/navigation/BackButton";
import Link from "next/link";
import RatingPrompt from "@/components/resources/RatingPrompt";
import {
  PlayCircle,
  FileText,
  User,
  Clock,
  Star,
  Award,
  FolderOpen,
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

  const totalItems = (resources?.length || 0) + (videos?.length || 0);

  // 4. Fetch User Progress
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

  // 5. Calculate Dynamic Rating
  const { data: ratings } = await supabase
    .from("course_ratings")
    .select("rating")
    .eq("subject_id", id);

  let avgRating: number | null = null;
  if (ratings && ratings.length > 0) {
    const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    avgRating = parseFloat((sum / ratings.length).toFixed(1));
  }

  // Unassigned Content (Items without module_id assigned)
  const unassignedVideos = videos?.filter((v) => !v.module_id) || [];
  const unassignedResources = resources?.filter((r) => !r.module_id) || [];
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

        {/* COURSE CONTENT BREAKDOWN (LMS CLASSROOM VIEW) */}
        <div className="space-y-6 pt-4">
          <h2 className="text-xl font-bold text-[#1e3a8a] border-b border-slate-200 pb-2">
            Course Curriculum ({totalItems} Materials)
          </h2>

          <div className="space-y-6">
            {/* LOOP THROUGH EACH MODULE */}
            {!modules || modules.length === 0 ? (
              <p className="text-sm text-slate-500 italic p-6 bg-white border border-slate-200 rounded-2xl">
                Course modules are currently being updated by the faculty.
              </p>
            ) : (
              modules.map((mod, index) => {
                const modVideos =
                  videos?.filter((v) => v.module_id === mod.id) || [];
                const modResources =
                  resources?.filter((r) => r.module_id === mod.id) || [];
                const hasContent =
                  modVideos.length > 0 || modResources.length > 0;

                return (
                  <div
                    key={mod.id}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
                  >
                    {/* MODULE HEADER */}
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

                    {/* MODULE CONTENT LIST */}
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
                              <Link
                                href={`/resources/item/${vid.id}?type=video`}
                                className="px-4 py-2 bg-blue-50 text-[#1e3a8a] text-xs font-bold rounded-lg hover:bg-[#1e3a8a] hover:text-white transition whitespace-nowrap"
                              >
                                Watch →
                              </Link>
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
                              <Link
                                href={`/resources/item/${res.id}?type=doc`}
                                className="px-4 py-2 bg-amber-50 text-[#d97706] text-xs font-bold rounded-lg hover:bg-[#f59e0b] hover:text-white transition whitespace-nowrap"
                              >
                                Read →
                              </Link>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* UNASSIGNED CONTENT (General Course Resources, Past Papers & Pathfinders) */}
            {hasUnassignedContent && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mt-8">
                <div className="bg-slate-100 border-b border-slate-200 p-5 sm:p-6 flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-[#1e3a8a]" />
                  <h3 className="text-lg font-bold text-[#1e3a8a]">
                    General Course Materials & Past Questions
                  </h3>
                </div>

                <div className="divide-y divide-slate-100">
                  {/* UNASSIGNED VIDEOS */}
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
                      <Link
                        href={`/resources/item/${vid.id}?type=video`}
                        className="px-4 py-2 bg-blue-50 text-[#1e3a8a] text-xs font-bold rounded-lg hover:bg-[#1e3a8a] hover:text-white transition whitespace-nowrap"
                      >
                        Watch →
                      </Link>
                    </div>
                  ))}

                  {/* UNASSIGNED RESOURCES */}
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
                      <Link
                        href={`/resources/item/${res.id}?type=doc`}
                        className="px-4 py-2 bg-amber-50 text-[#d97706] text-xs font-bold rounded-lg hover:bg-[#f59e0b] hover:text-white transition whitespace-nowrap"
                      >
                        Read →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* STUDENT RATING PROMPT */}
        {user && <RatingPrompt subjectId={id} />}
      </div>
    </div>
  );
}
