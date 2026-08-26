"use client";

import { useState, useTransition } from "react";
import { Level, Subject, Resource, Video } from "@/types";
import ResourceUploadForm from "@/components/admin/ResourceUploadForm";
import VideoUploadForm from "@/components/admin/VideoUploadForm";
import AddSubjectForm from "@/components/admin/AddSubjectForm";
import AddAnnouncementForm from "@/components/admin/AddAnnouncementForm";
import ManageFacultyForm from "@/components/admin/ManageFacultyForm";
import AddQuestionForm from "@/components/admin/AddQuestionForm";
import { deleteResource } from "@/lib/actions/resources";
import { deleteVideo } from "@/lib/actions/videos";
import {
  FileText,
  Video as VideoIcon,
  BookOpen,
  Layers,
  Download,
  Megaphone,
  ShieldCheck,
  Trash2,
  Loader2,
  HelpCircle,
} from "lucide-react";

interface Props {
  levels: Level[];
  subjects: Subject[];
  resources: Resource[];
  videos?: Video[];
}

type TabType =
  | "pdf"
  | "video"
  | "subject"
  | "announcement"
  | "faculty"
  | "question"
  | "list";

export default function AdminDashboardTabs({
  levels,
  subjects,
  resources: initialResources,
  videos: initialVideos = [],
}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("pdf");
  const [resourcesList, setResourcesList] =
    useState<Resource[]>(initialResources);
  const [videosList, setVideosList] = useState<Video[]>(initialVideos);
  const [isPending, startTransition] = useTransition();

  const handleDeleteResource = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;

    startTransition(async () => {
      const res = await deleteResource(id);
      if (!res?.error) {
        setResourcesList((prev) => prev.filter((item) => item.id !== id));
      }
    });
  };

  const handleDeleteVideo = (id: string, title: string) => {
    if (!confirm(`Delete video "${title}"?`)) return;

    startTransition(async () => {
      const res = await deleteVideo(id);
      if (!res?.error) {
        setVideosList((prev) => prev.filter((item) => item.id !== id));
      }
    });
  };

  const totalPublishedCount = resourcesList.length + videosList.length;

  return (
    <div className="space-y-6">
      {/* TAB NAVIGATION BAR */}
      <div className="flex bg-slate-100 border border-slate-200 p-1.5 rounded-2xl w-full overflow-x-auto">
        <button
          onClick={() => setActiveTab("pdf")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer flex-1 justify-center ${
            activeTab === "pdf"
              ? "bg-[#1e3a8a] text-white shadow-md"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Upload PDF</span>
        </button>

        <button
          onClick={() => setActiveTab("video")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer flex-1 justify-center ${
            activeTab === "video"
              ? "bg-[#1e3a8a] text-white shadow-md"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <VideoIcon className="w-4 h-4" />
          <span>Add Video</span>
        </button>

        <button
          onClick={() => setActiveTab("subject")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer flex-1 justify-center ${
            activeTab === "subject"
              ? "bg-[#1e3a8a] text-white shadow-md"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Manage Subjects</span>
        </button>

        <button
          onClick={() => setActiveTab("question")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer flex-1 justify-center ${
            activeTab === "question"
              ? "bg-[#1e3a8a] text-white shadow-md"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Question Bank</span>
        </button>

        <button
          onClick={() => setActiveTab("announcement")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer flex-1 justify-center ${
            activeTab === "announcement"
              ? "bg-[#1e3a8a] text-white shadow-md"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Broadcast</span>
        </button>

        <button
          onClick={() => setActiveTab("faculty")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer flex-1 justify-center ${
            activeTab === "faculty"
              ? "bg-[#1e3a8a] text-white shadow-md"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Faculty Access</span>
        </button>

        <button
          onClick={() => setActiveTab("list")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer flex-1 justify-center ${
            activeTab === "list"
              ? "bg-[#1e3a8a] text-white shadow-md"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Published ({totalPublishedCount})</span>
        </button>
      </div>

      {/* TAB 1: PDF UPLOADER */}
      {activeTab === "pdf" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 text-xs sm:text-sm text-slate-600 flex items-center justify-between shadow-sm">
            <div>
              <h2 className="font-bold text-[#1e3a8a] text-base">
                Upload PDF Study Material
              </h2>
              <p className="mt-1">
                Upload Pathfinders, Study Texts, Past Questions, or Mock papers
                to Supabase Storage.
              </p>
            </div>
          </div>
          <ResourceUploadForm levels={levels} subjects={subjects} />
        </div>
      )}

      {/* TAB 2: VIDEO UPLOADER */}
      {activeTab === "video" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 text-xs sm:text-sm text-slate-600 flex items-center justify-between shadow-sm">
            <div>
              <h2 className="font-bold text-[#1e3a8a] text-base">
                Embed Video Lecture
              </h2>
              <p className="mt-1">
                Embed YouTube or Vimeo video class sessions assigned to an ICAN
                subject.
              </p>
            </div>
          </div>
          <VideoUploadForm levels={levels} subjects={subjects} />
        </div>
      )}

      {/* TAB 3: SUBJECT MANAGEMENT */}
      {activeTab === "subject" && (
        <div className="space-y-6">
          <AddSubjectForm levels={levels} />

          {/* EXISTING SUBJECTS LIST */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm text-slate-900">
            <h3 className="font-bold text-[#1e3a8a] text-base border-b border-slate-100 pb-3">
              Existing ICAN Subjects ({subjects.length})
            </h3>
            <div className="divide-y divide-slate-100">
              {subjects.map((sub: Subject) => (
                <div
                  key={sub.id}
                  className="py-3 flex justify-between items-center text-xs sm:text-sm"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {sub.name}{" "}
                      {sub.code && (
                        <span className="text-slate-400">({sub.code})</span>
                      )}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {sub.level?.name} Stage •{" "}
                      {sub.instructor_name || "KRL Academy"}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-full font-semibold uppercase text-[11px]">
                    {sub.level?.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: QUESTION BANK */}
      {activeTab === "question" && <AddQuestionForm subjects={subjects} />}

      {/* TAB 5: ANNOUNCEMENT COMPONENT */}
      {activeTab === "announcement" && <AddAnnouncementForm />}

      {/* TAB 6: FACULTY ACCESS MANAGEMENT */}
      {activeTab === "faculty" && <ManageFacultyForm />}

      {/* TAB 7: ALL PUBLISHED MATERIALS TABLE (PDFs & VIDEOS WITH DELETE BUTTONS) */}
      {activeTab === "list" && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm text-slate-900">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-[#1e3a8a] text-base">
                Published Resources Library ({totalPublishedCount})
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                View and manage all uploaded PDF documents and embedded video
                lectures.
              </p>
            </div>
            {isPending && (
              <Loader2 className="w-5 h-5 text-amber-500 animate-spin flex-shrink-0" />
            )}
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[600px]">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] sm:text-[11px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3 sm:p-4">Title</th>
                  <th className="p-3 sm:p-4">Subject</th>
                  <th className="p-3 sm:p-4">Stage</th>
                  <th className="p-3 sm:p-4">Type</th>
                  <th className="p-3 sm:p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {resourcesList.length === 0 && videosList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No materials published yet. Use the tabs above to upload
                      your first PDF or video!
                    </td>
                  </tr>
                ) : (
                  <>
                    {/* LIST PDF DOCUMENTS */}
                    {resourcesList.map((res: Resource) => (
                      <tr key={res.id} className="hover:bg-slate-50 transition">
                        <td className="p-3 sm:p-4 font-semibold text-slate-900">
                          📄 {res.title}
                        </td>
                        <td className="p-3 sm:p-4 text-slate-500">
                          {res.subject?.name || "—"}
                        </td>
                        <td className="p-3 sm:p-4 text-slate-500">
                          {res.level?.name || "—"}
                        </td>
                        <td className="p-3 sm:p-4">
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/60 text-[10px] font-bold rounded-full uppercase whitespace-nowrap">
                            {res.resource_type.replace("_", " ")}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4 text-right flex items-center justify-end gap-3">
                          <a
                            href={res.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#1e3a8a] font-semibold hover:underline flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" /> PDF
                          </a>
                          <button
                            onClick={() =>
                              handleDeleteResource(res.id, res.title)
                            }
                            disabled={isPending}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg transition cursor-pointer disabled:opacity-50"
                            title="Delete PDF"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {/* LIST VIDEO LECTURES */}
                    {videosList.map((vid: Video) => (
                      <tr key={vid.id} className="hover:bg-slate-50 transition">
                        <td className="p-3 sm:p-4 font-semibold text-slate-900">
                          🎥 {vid.title}
                        </td>
                        <td className="p-3 sm:p-4 text-slate-500">
                          {vid.subject?.name || "—"}
                        </td>
                        <td className="p-3 sm:p-4 text-slate-500">
                          {vid.level?.name || "—"}
                        </td>
                        <td className="p-3 sm:p-4">
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200/60 text-[10px] font-bold rounded-full uppercase whitespace-nowrap">
                            VIDEO LECTURE
                          </span>
                        </td>
                        <td className="p-3 sm:p-4 text-right">
                          <button
                            onClick={() => handleDeleteVideo(vid.id, vid.title)}
                            disabled={isPending}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg transition cursor-pointer disabled:opacity-50"
                            title="Delete Video"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
