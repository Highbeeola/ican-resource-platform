"use client";

import { useState } from "react";
import { Level, Subject, Resource } from "@/types";
import ResourceUploadForm from "@/components/admin/ResourceUploadForm";
import VideoUploadForm from "@/components/admin/VideoUploadForm";
import AddSubjectForm from "@/components/admin/AddSubjectForm";
import AddAnnouncementForm from "@/components/admin/AddAnnouncementForm";
import {
  FileText,
  Video,
  BookOpen,
  Layers,
  Download,
  Megaphone,
} from "lucide-react";

interface Props {
  levels: Level[];
  subjects: Subject[];
  resources: Resource[];
}

type TabType = "pdf" | "video" | "subject" | "announcement" | "list";

export default function AdminDashboardTabs({
  levels,
  subjects,
  resources,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("pdf");

  return (
    <div className="space-y-6">
      {/* TAB NAVIGATION BAR */}
      <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2xl w-full overflow-x-auto">
        <button
          onClick={() => setActiveTab("pdf")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer flex-1 justify-center ${
            activeTab === "pdf"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Upload PDF</span>
        </button>

        <button
          onClick={() => setActiveTab("video")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer flex-1 justify-center ${
            activeTab === "video"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Add Video</span>
        </button>

        <button
          onClick={() => setActiveTab("subject")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer flex-1 justify-center ${
            activeTab === "subject"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Manage Subjects</span>
        </button>

        <button
          onClick={() => setActiveTab("announcement")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer flex-1 justify-center ${
            activeTab === "announcement"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Broadcast</span>
        </button>

        <button
          onClick={() => setActiveTab("list")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer flex-1 justify-center ${
            activeTab === "list"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Published ({resources.length})</span>
        </button>
      </div>

      {/* TAB 1: PDF UPLOADER */}
      {activeTab === "pdf" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 text-xs sm:text-sm text-slate-400 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-white text-base">
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 text-xs sm:text-sm text-slate-400 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-white text-base">
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">
              Existing ICAN Subjects ({subjects.length})
            </h3>
            <div className="divide-y divide-slate-800">
              {subjects.map((sub: Subject) => (
                <div
                  key={sub.id}
                  className="py-3 flex justify-between items-center text-xs sm:text-sm"
                >
                  <div>
                    <p className="font-semibold text-white">
                      {sub.name}{" "}
                      {sub.code && (
                        <span className="text-slate-500">({sub.code})</span>
                      )}
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {sub.level?.name} Stage •{" "}
                      {sub.instructor_name || "CA Prep Academy"}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full font-semibold uppercase text-[11px]">
                    {sub.level?.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ANNOUNCEMENT COMPONENT */}
      {activeTab === "announcement" && <AddAnnouncementForm />}

      {/* TAB 5: ALL PUBLISHED MATERIALS TABLE */}
      {activeTab === "list" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 sm:p-6 border-b border-slate-800">
            <h2 className="font-bold text-white text-base">
              Published Resources Library
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              View and manage all uploaded documents across levels.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Title</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Stage</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Diet / Year</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {resources.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No materials published yet. Use the tabs above to upload
                      your first PDF or video!
                    </td>
                  </tr>
                ) : (
                  resources.map((res: Resource) => (
                    <tr
                      key={res.id}
                      className="hover:bg-slate-800/50 transition"
                    >
                      <td className="p-4 font-semibold text-white">
                        {res.title}
                      </td>
                      <td className="p-4 text-slate-400">
                        {res.subject?.name}
                      </td>
                      <td className="p-4 text-slate-400">{res.level?.name}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 text-[11px] font-semibold rounded-full uppercase">
                          {res.resource_type.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">
                        {res.exam_diet} {res.exam_year}
                      </td>
                      <td className="p-4 text-right">
                        <a
                          href={res.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-amber-400 hover:underline font-semibold"
                        >
                          <Download className="w-3.5 h-3.5" />
                          PDF
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
