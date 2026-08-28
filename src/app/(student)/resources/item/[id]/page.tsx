import { createClient } from "@/lib/supabase/server";
import MarkCompletedButton from "@/components/resources/MarkCompletedButton";
import { getYouTubeEmbedUrl } from "@/lib/utils";
import Link from "next/link";
import DownloadButton from "@/components/resources/DownloadButton";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Lightbulb,
  ExternalLink,
  Video,
} from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}

export default async function ResourceItemPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { type } = await searchParams;
  const supabase = await createClient();

  let itemData: any = null;
  let isVideo = type === "video";

  if (isVideo) {
    const { data } = await supabase
      .from("videos")
      .select("*, subject:subjects(*)")
      .eq("id", id)
      .single();
    itemData = data;
  } else {
    const { data } = await supabase
      .from("resources")
      .select("*, subject:subjects(*)")
      .eq("id", id)
      .single();
    itemData = data;
  }

  if (!itemData) {
    notFound();
  }

  // Check user auth and completion status
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let isCompleted = false;

  if (user) {
    const { data: progress } = await supabase
      .from("user_progress")
      .select("id")
      .eq("user_id", user.id)
      .eq(isVideo ? "video_id" : "resource_id", id)
      .maybeSingle();

    isCompleted = !!progress;
  }

  // Query other PDF resources (excluding current item)
  const { data: otherResources } = await supabase
    .from("resources")
    .select("id, title, resource_type")
    .eq("subject_id", itemData.subject_id)
    .neq("id", id);

  // Query other Video lectures (excluding current item)
  const { data: otherVideos } = await supabase
    .from("videos")
    .select("id, title")
    .eq("subject_id", itemData.subject_id)
    .neq("id", id);

  // Format YouTube URL safely
  const embedVideoUrl = isVideo ? getYouTubeEmbedUrl(itemData.video_url) : "";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* BACK TO SUBJECT HUB */}
        <Link
          href={`/resources/subject/${itemData.subject_id}`}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition bg-white px-3.5 py-2 rounded-lg border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {itemData.subject?.name} Course</span>
        </Link>

        {/* HEADER */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e3a8a]">
            {itemData.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {itemData.subject?.name} • ICAN Professional Syllabus
          </p>
        </div>

        {/* MAIN VIEWER & SIDEBAR GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN PLAYER / EMBEDDED PDF VIEWER */}
          <div className="lg:col-span-2 space-y-6">
            {/* EMBEDDED VIEWER FRAME WITH POP-OUT ICON */}
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm aspect-video flex items-center justify-center border border-slate-200 group">
              {isVideo ? (
                <iframe
                  src={embedVideoUrl}
                  title={itemData.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <>
                  <iframe
                    src={`${itemData.file_url}#toolbar=0`}
                    title={itemData.title}
                    className="w-full h-full border-0"
                  ></iframe>
                  {/* POP-OUT TO NEW TAB ICON BUTTON */}
                  {itemData.file_url && (
                    <a
                      href={itemData.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-3 right-3 p-2.5 bg-slate-900/90 hover:bg-amber-500 hover:text-white text-white rounded-xl border border-slate-700 transition shadow-lg flex items-center gap-1.5 text-xs font-bold"
                      title="Open PDF in full tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="hidden sm:inline">Pop Out Viewer</span>
                    </a>
                  )}
                </>
              )}
            </div>

            {/* DYNAMIC LESSON OVERVIEW CARD (DISTINGUISHES VIDEO VS DOCUMENT) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
              <h3 className="font-bold text-[#1e3a8a] text-base flex items-center gap-2">
                {isVideo ? (
                  <Video className="w-5 h-5 text-amber-500" />
                ) : (
                  <FileText className="w-5 h-5 text-amber-500" />
                )}
                <span>
                  {isVideo
                    ? "Video Lecture Overview"
                    : "Document Details & Downloads"}
                </span>
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {itemData.description ||
                  (isVideo
                    ? "Watch the video lecture above to master key exam concepts for this topic."
                    : "Download the PDF document below for offline study and revision.")}
              </p>

              {/* ONLY SHOW DOWNLOAD BUTTON FOR PDF DOCUMENTS WITH A FILE URL */}
              {!isVideo && itemData.file_url && (
                <DownloadButton
                  fileUrl={itemData.file_url}
                  fileName={itemData.title}
                />
              )}
            </div>

            {/* KEY LEARNING POINTS */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
              <h3 className="font-bold text-[#1e3a8a] text-base flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <span>Key Learning Points</span>
              </h3>
              <ul className="text-xs sm:text-sm text-slate-600 space-y-2 list-disc pl-5">
                <li>
                  Study the document thoroughly before attempting practice
                  questions.
                </li>
                <li>
                  Take notes while studying for better retention during exam
                  diet preparation.
                </li>
                <li>Revise the summary section after completing the module.</li>
                <li>
                  Attempt related ICAN pathfinders to test your understanding.
                </li>
              </ul>
            </div>

            {/* INTERACTIVE MARK AS COMPLETED BUTTON */}
            {user ? (
              <MarkCompletedButton
                subjectId={itemData.subject_id}
                resourceId={!isVideo ? id : undefined}
                videoId={isVideo ? id : undefined}
                initialIsCompleted={isCompleted}
              />
            ) : (
              <Link
                href="/login"
                className="w-full py-3.5 bg-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition font-bold rounded-xl text-sm flex items-center justify-center gap-2 border border-slate-200"
              >
                Login to track your progress
              </Link>
            )}
          </div>

          {/* OTHER COURSE MODULES SIDEBAR */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-fit space-y-4">
            <h3 className="font-bold text-[#1e3a8a] text-base border-b border-slate-100 pb-3">
              Other Course Modules
            </h3>

            <div className="space-y-2">
              {/* LIST OTHER VIDEOS */}
              {otherVideos?.map((vid: any) => (
                <Link
                  key={vid.id}
                  href={`/resources/item/${vid.id}?type=video`}
                  className="p-3 rounded-xl block text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
                >
                  🎥 {vid.title}
                </Link>
              ))}

              {/* LIST OTHER DOCUMENTS */}
              {otherResources?.map((res: any) => (
                <Link
                  key={res.id}
                  href={`/resources/item/${res.id}?type=doc`}
                  className="p-3 rounded-xl block text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
                >
                  📄 {res.title}
                </Link>
              ))}

              {(!otherVideos || otherVideos.length === 0) &&
                (!otherResources || otherResources.length === 0) && (
                  <p className="text-xs text-slate-400">
                    No other modules in this subject yet.
                  </p>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
