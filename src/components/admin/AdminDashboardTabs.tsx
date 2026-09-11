"use client";

import { useState, useTransition } from "react";
import { Level, Subject, Resource, Video } from "@/types";
import ResourceUploadForm from "@/components/admin/ResourceUploadForm";
import VideoUploadForm from "@/components/admin/VideoUploadForm";
import AddArticleForm from "@/components/admin/AddArticleForm";
import AddSubjectForm from "@/components/admin/AddSubjectForm";
import AddAnnouncementForm from "@/components/admin/AddAnnouncementForm";
import ManageFacultyForm from "@/components/admin/ManageFacultyForm";
import AddQuestionForm from "@/components/admin/AddQuestionForm";
import AddLecturerForm from "@/components/admin/AddLecturerForm";
import AddModuleForm from "@/components/admin/AddModuleForm";
import UpdateLiveClassForm from "@/components/admin/UpdateLiveClassForm";
import { deleteResource, bulkDeleteItems } from "@/lib/actions/resources";
import { deleteVideo } from "@/lib/actions/videos";
import { deleteQuestion } from "@/lib/actions/quiz";
import { deleteSubject } from "@/lib/actions/subjects";
import toast from "react-hot-toast";
import {
  FileText,
  Video as VideoIcon,
  BookOpen,
  Layers,
  Download,
  X,
  Trash2,
  ShieldCheck,
  Megaphone,
  HelpCircle,
  BarChart3,
  Users,
  PlayCircle,
  Award,
  Loader2,
  UserPlus,
  PenTool,
  FolderPlus,
} from "lucide-react";

interface AnalyticsData {
  totalStudents: number;
  totalResources: number;
  totalVideos: number;
  totalQuizAttempts: number;
  totalSubjects: number;
}

interface Props {
  levels: Level[];
  subjects: Subject[];
  resources: Resource[];
  videos?: Video[];
  analytics: AnalyticsData;
  isSuperAdmin: boolean;
  modules: any[];
  questions?: any[];
}

type TabType =
  | "analytics"
  | "pdf"
  | "video"
  | "article"
  | "module"
  | "subject"
  | "question"
  | "announcement"
  | "faculty"
  | "lecturer_profile"
  | "list";

export default function AdminDashboardTabs({
  levels,
  subjects,
  modules,
  resources: initialResources = [],
  videos: initialVideos = [],
  questions: initialQuestions = [],
  analytics,
  isSuperAdmin = false,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>(
    isSuperAdmin ? "analytics" : "pdf",
  );
  const [resourcesList, setResourcesList] =
    useState<Resource[]>(initialResources);
  const [videosList, setVideosList] = useState<Video[]>(initialVideos);
  const [questionsList, setQuestionsList] = useState<any[]>(initialQuestions);
  const [isPending, startTransition] = useTransition();

  // NUDGE STATE
  const [hideNudge, setHideNudge] = useState(false);

  // BULK DELETE STATE
  const [selectedItems, setSelectedItems] = useState<
    { id: string; type: string }[]
  >([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  async function handleBulkDelete() {
    if (
      !confirm(
        `Are you sure you want to delete ${selectedItems.length} selected item(s)?`,
      )
    )
      return;

    setIsDeletingBulk(true);
    try {
      const res = await bulkDeleteItems(selectedItems);

      if (res?.success) {
        toast.success(`${selectedItems.length} items deleted successfully!`);
        const resourceIdsToRemove = new Set(
          selectedItems.filter((i) => i.type === "resource").map((i) => i.id),
        );
        const videoIdsToRemove = new Set(
          selectedItems.filter((i) => i.type === "video").map((i) => i.id),
        );
        const questionIdsToRemove = new Set(
          selectedItems.filter((i) => i.type === "question").map((i) => i.id),
        );

        if (resourceIdsToRemove.size > 0) {
          setResourcesList((prev) =>
            prev.filter((r) => !resourceIdsToRemove.has(r.id)),
          );
        }
        if (videoIdsToRemove.size > 0) {
          setVideosList((prev) =>
            prev.filter((v) => !videoIdsToRemove.has(v.id)),
          );
        }
        if (questionIdsToRemove.size > 0) {
          setQuestionsList((prev) =>
            prev.filter((q) => !questionIdsToRemove.has(q.id)),
          );
        }

        setSelectedItems([]);
      } else {
        const errorMessage =
          res && "error" in res
            ? (res as any).error
            : "Failed to delete items.";
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error("An error occurred during bulk deletion.");
    } finally {
      setIsDeletingBulk(false);
    }
  }

  // TOGGLE SINGLE CHECKBOX
  function toggleSelection(id: string, type: string) {
    setSelectedItems((prev) => {
      const exists = prev.find((item) => item.id === id);
      if (exists) return prev.filter((item) => item.id !== id);
      return [...prev, { id, type }];
    });
  }

  // TOGGLE SELECT ALL
  const allCurrentItems = [
    ...resourcesList.map((r) => ({ id: r.id, type: "resource" })),
    ...videosList.map((v) => ({ id: v.id, type: "video" })),
    ...questionsList.map((q) => ({ id: q.id, type: "question" })),
  ];

  const isAllSelected =
    allCurrentItems.length > 0 &&
    selectedItems.length === allCurrentItems.length;

  function toggleSelectAll() {
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(allCurrentItems);
    }
  }

  const handleDeleteResource = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;

    startTransition(async () => {
      const res = await deleteResource(id);
      if (!res?.error) {
        setResourcesList((prev) => prev.filter((item) => item.id !== id));
        setSelectedItems((prev) => prev.filter((item) => item.id !== id));
        toast.success("Resource deleted!");
      } else {
        alert(res.error);
      }
    });
  };

  const handleDeleteVideo = (id: string, title: string) => {
    if (!confirm(`Delete video "${title}"?`)) return;

    startTransition(async () => {
      const res = await deleteVideo(id);
      if (!res?.error) {
        setVideosList((prev) => prev.filter((item) => item.id !== id));
        setSelectedItems((prev) => prev.filter((item) => item.id !== id));
        toast.success("Video deleted!");
      } else {
        alert(res.error);
      }
    });
  };

  const handleDeleteQuestion = (id: string) => {
    if (!confirm("Delete this practice question?")) return;

    startTransition(async () => {
      const res = await deleteQuestion(id);
      if (res?.success) {
        setQuestionsList((prev) => prev.filter((q) => q.id !== id));
        setSelectedItems((prev) => prev.filter((item) => item.id !== id));
        toast.success("Question deleted!");
      } else {
        alert(res?.error || "Failed to delete question");
      }
    });
  };

  const totalPublishedCount =
    resourcesList.length + videosList.length + questionsList.length;

  const tabClass = (tab: TabType) => `
    flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer flex-1 justify-center
    ${
      activeTab === tab
        ? "bg-[#1e3a8a] text-white shadow-md"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
    }
  `;

  return (
    <div className="space-y-6">
      {/* TAB NAVIGATION BAR */}
      <div className="flex bg-slate-100 border border-slate-200 p-1.5 rounded-2xl w-full overflow-x-auto">
        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab("analytics")}
            className={tabClass("analytics")}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </button>
        )}

        <button onClick={() => setActiveTab("pdf")} className={tabClass("pdf")}>
          <FileText className="w-4 h-4" />
          <span>Upload PDF</span>
        </button>

        <button
          onClick={() => setActiveTab("video")}
          className={tabClass("video")}
        >
          <VideoIcon className="w-4 h-4" />
          <span>Add Video</span>
        </button>

        <button
          onClick={() => setActiveTab("article")}
          className={tabClass("article")}
        >
          <PenTool className="w-4 h-4" />
          <span>Write Article</span>
        </button>

        <button
          onClick={() => setActiveTab("module")}
          className={tabClass("module")}
        >
          <FolderPlus className="w-4 h-4" />
          <span>Curriculum</span>
        </button>

        <button
          onClick={() => setActiveTab("subject")}
          className={tabClass("subject")}
        >
          <BookOpen className="w-4 h-4" />
          <span>Manage Subjects</span>
        </button>

        <button
          onClick={() => setActiveTab("question")}
          className={tabClass("question")}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Question Bank</span>
        </button>

        <button
          onClick={() => setActiveTab("announcement")}
          className={tabClass("announcement")}
        >
          <Megaphone className="w-4 h-4" />
          <span>Broadcast</span>
        </button>

        {isSuperAdmin && (
          <>
            <button
              onClick={() => setActiveTab("faculty")}
              className={tabClass("faculty")}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Faculty Access</span>
            </button>

            <button
              onClick={() => setActiveTab("lecturer_profile")}
              className={tabClass("lecturer_profile")}
            >
              <UserPlus className="w-4 h-4" />
              <span>Lecturer Profiles</span>
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab("list")}
          className={tabClass("list")}
        >
          <Layers className="w-4 h-4" />
          <span>All Published ({totalPublishedCount})</span>
        </button>
      </div>

      {/* ANALYTICS TAB */}
      {isSuperAdmin && activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-[#1e3a8a] text-lg border-b border-slate-100 pb-3 mb-4">
              Platform Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                <div className="flex justify-between items-center text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase">
                    Total Students
                  </span>
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-3xl font-extrabold text-[#1e3a8a]">
                  {analytics.totalStudents}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                <div className="flex justify-between items-center text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase">
                    PDF Materials
                  </span>
                  <FileText className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-3xl font-extrabold text-[#1e3a8a]">
                  {analytics.totalResources}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                <div className="flex justify-between items-center text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase">
                    Video Lectures
                  </span>
                  <PlayCircle className="w-4 h-4 text-rose-500" />
                </div>
                <p className="text-3xl font-extrabold text-[#1e3a8a]">
                  {analytics.totalVideos}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                <div className="flex justify-between items-center text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase">
                    Quizzes Taken
                  </span>
                  <Award className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-3xl font-extrabold text-[#1e3a8a]">
                  {analytics.totalQuizAttempts}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF UPLOADER */}
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
          <ResourceUploadForm
            levels={levels}
            subjects={subjects}
            modules={modules}
          />
        </div>
      )}

      {/* VIDEO UPLOADER */}
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
          <VideoUploadForm
            levels={levels}
            subjects={subjects}
            modules={modules}
          />
        </div>
      )}

      {/* ARTICLE EDITOR */}
      {activeTab === "article" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 text-xs sm:text-sm text-slate-600 flex items-center justify-between shadow-sm">
            <div>
              <h2 className="font-bold text-[#1e3a8a] text-base">
                Publish Article or Typed Lesson
              </h2>
              <p className="mt-1">
                Compose rich text study materials and lecture notes directly for
                students.
              </p>
            </div>
          </div>
          <AddArticleForm
            levels={levels}
            subjects={subjects}
            modules={modules}
          />
        </div>
      )}

      {/* CURRICULUM TAB */}
      {activeTab === "module" && (
        <div className="space-y-4">
          <AddModuleForm subjects={subjects} />
        </div>
      )}

      {/* COURSE/SUBJECT MANAGEMENT */}
      {activeTab === "subject" && (
        <div className="space-y-6">
          <AddSubjectForm levels={levels} />
          <UpdateLiveClassForm subjects={subjects} />
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-[#1e3a8a] text-base border-b border-slate-100 pb-3">
              Existing Courses ({subjects.length})
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
                        <span className="text-slate-500">({sub.code})</span>
                      )}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {sub.level?.programme?.name || "Programme"} •{" "}
                      {sub.level?.name} Stage •{" "}
                      {sub.instructor_name || "KRL Academy"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-blue-50 text-[#1e3a8a] rounded-full font-bold uppercase text-[10px] hidden sm:block">
                      {sub.level?.name}
                    </span>

                    <button
                      onClick={async () => {
                        if (
                          confirm(
                            `Are you sure you want to delete the entire "${sub.name}" course? This will also delete all its PDFs, videos, and quizzes!`,
                          )
                        ) {
                          const res = await deleteSubject(sub.id);
                          if (res?.success) {
                            toast.success(
                              "Course and all its contents deleted!",
                            );
                          } else {
                            toast.error(
                              res?.error || "Failed to delete course.",
                            );
                          }
                        }
                      }}
                      className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-md transition cursor-pointer"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* QUESTION BANK */}
      {activeTab === "question" && <AddQuestionForm subjects={subjects} />}

      {/* ANNOUNCEMENT */}
      {activeTab === "announcement" && <AddAnnouncementForm />}

      {/* FACULTY ACCESS */}
      {isSuperAdmin && activeTab === "faculty" && <ManageFacultyForm />}

      {/* LECTURER PROFILES */}
      {isSuperAdmin && activeTab === "lecturer_profile" && <AddLecturerForm />}

      {/* ALL PUBLISHED MATERIALS LIBRARY */}
      {activeTab === "list" && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-[#1e3a8a] text-base">
                Published Resources Library ({totalPublishedCount})
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                View and manage all uploaded documents, videos, and questions.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isPending && (
                <Loader2 className="w-5 h-5 text-amber-500 animate-spin flex-shrink-0" />
              )}
              {selectedItems.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  disabled={isDeletingBulk}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isDeletingBulk ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Delete Selected</span> (
                  {selectedItems.length})
                </button>
              )}
            </div>
          </div>

          {/* ====== MOBILE VIEW (STACKED CARDS) ====== */}
          <div className="md:hidden flex flex-col p-4 gap-3 bg-slate-50">
            {resourcesList.length === 0 &&
            videosList.length === 0 &&
            questionsList.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-8">
                No materials published yet.
              </p>
            ) : (
              <>
                {resourcesList.map((res: Resource) => (
                  <div
                    key={res.id}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!selectedItems.find((i) => i.id === res.id)}
                          onChange={() => toggleSelection(res.id, "resource")}
                          className="w-4 h-4 text-[#1e3a8a] rounded border-slate-300 cursor-pointer"
                        />
                        <h4 className="font-bold text-slate-900 text-sm leading-snug">
                          {res.article_content ? "📝" : "📄"} {res.title}
                        </h4>
                      </div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs text-slate-600">
                          {res.subject?.name || "No Subject"}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-bold rounded-full uppercase">
                          {res.resource_type?.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {res.file_url && (
                          <a
                            href={res.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-blue-50 text-[#1e3a8a] rounded-lg text-xs font-semibold"
                            title="View PDF"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() =>
                            handleDeleteResource(res.id, res.title)
                          }
                          disabled={isPending}
                          className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                          title="Delete Resource"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {videosList.map((vid: Video) => (
                  <div
                    key={vid.id}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!selectedItems.find((i) => i.id === vid.id)}
                          onChange={() => toggleSelection(vid.id, "video")}
                          className="w-4 h-4 text-[#1e3a8a] rounded border-slate-300 cursor-pointer"
                        />
                        <h4 className="font-bold text-slate-900 text-sm leading-snug">
                          🎥 {vid.title}
                        </h4>
                      </div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs text-slate-600">
                          {vid.subject?.name || "No Subject"}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-[9px] font-bold rounded-full uppercase">
                          VIDEO LECTURE
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteVideo(vid.id, vid.title)}
                        disabled={isPending}
                        className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                        title="Delete Video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {questionsList.map((q: any) => (
                  <div
                    key={q.id}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={!!selectedItems.find((i) => i.id === q.id)}
                          onChange={() => toggleSelection(q.id, "question")}
                          className="w-4 h-4 mt-0.5 text-[#1e3a8a] rounded border-slate-300 cursor-pointer"
                        />
                        <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                          ❓ {q.question_text}
                        </h4>
                      </div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs text-slate-600">
                          {q.subject?.level?.name || "No Subject"}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-800 text-[9px] font-bold rounded-full uppercase">
                          PRACTICE QUESTION
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        disabled={isPending}
                        className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                        title="Delete Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* ====== DESKTOP VIEW (TRADITIONAL TABLE) ====== */}
          <div className="hidden md:block overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[600px]">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] sm:text-[11px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3 sm:p-4 w-10">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer"
                    />
                  </th>
                  <th className="p-3 sm:p-4">Title / Question</th>
                  <th className="p-3 sm:p-4">Subject</th>
                  <th className="p-3 sm:p-4">Stage</th>
                  <th className="p-3 sm:p-4">Type</th>
                  <th className="p-3 sm:p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {resourcesList.length === 0 &&
                videosList.length === 0 &&
                questionsList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No materials or questions published yet. Use the tabs
                      above to create your first content!
                    </td>
                  </tr>
                ) : (
                  <>
                    {/* PDF / ARTICLES LIST */}
                    {resourcesList.map((res: Resource) => (
                      <tr key={res.id} className="hover:bg-slate-50 transition">
                        <td className="p-3 sm:p-4">
                          <input
                            type="checkbox"
                            checked={
                              !!selectedItems.find((i) => i.id === res.id)
                            }
                            onChange={() => toggleSelection(res.id, "resource")}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer"
                          />
                        </td>
                        <td className="p-3 sm:p-4 font-semibold text-slate-900">
                          {res.article_content ? "📝" : "📄"} {res.title}
                        </td>
                        <td className="p-3 sm:p-4 text-slate-500">
                          {res.subject?.name || "—"}
                        </td>
                        <td className="p-3 sm:p-4 text-slate-500">
                          {res.level?.name || "—"}
                        </td>
                        <td className="p-3 sm:p-4">
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/60 text-[10px] font-bold rounded-full uppercase whitespace-nowrap">
                            {res.resource_type?.replace("_", " ")}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4 text-right flex items-center justify-end gap-3">
                          {res.file_url && (
                            <a
                              href={res.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#1e3a8a] font-semibold hover:underline flex items-center gap-1"
                            >
                              <Download className="w-3.5 h-3.5" /> PDF
                            </a>
                          )}
                          <button
                            onClick={() =>
                              handleDeleteResource(res.id, res.title)
                            }
                            disabled={isPending}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg transition cursor-pointer disabled:opacity-50"
                            title="Delete Material"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {/* VIDEOS LIST */}
                    {videosList.map((vid: Video) => (
                      <tr key={vid.id} className="hover:bg-slate-50 transition">
                        <td className="p-3 sm:p-4">
                          <input
                            type="checkbox"
                            checked={
                              !!selectedItems.find((i) => i.id === vid.id)
                            }
                            onChange={() => toggleSelection(vid.id, "video")}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer"
                          />
                        </td>
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

                    {/* PRACTICE QUESTIONS LIST */}
                    {questionsList.map((q: any) => (
                      <tr key={q.id} className="hover:bg-slate-50 transition">
                        <td className="p-3 sm:p-4">
                          <input
                            type="checkbox"
                            checked={!!selectedItems.find((i) => i.id === q.id)}
                            onChange={() => toggleSelection(q.id, "question")}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer"
                          />
                        </td>
                        <td className="p-3 sm:p-4 font-semibold text-slate-900 truncate max-w-xs">
                          ❓ {q.question_text}
                        </td>
                        <td className="p-3 sm:p-4 text-slate-500">
                          {q.subject?.level?.name || "—"}
                        </td>
                        <td className="p-3 sm:p-4 text-slate-500">—</td>
                        <td className="p-3 sm:p-4">
                          <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200/60 text-[10px] font-bold rounded-full uppercase whitespace-nowrap">
                            PRACTICE QUESTION
                          </span>
                        </td>
                        <td className="p-3 sm:p-4 text-right">
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            disabled={isPending}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg transition cursor-pointer disabled:opacity-50"
                            title="Delete Question"
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

      {/* DISMISSIBLE LECTURER DIRECTORY NUDGE */}
      {isSuperAdmin && !hideNudge && activeTab !== "lecturer_profile" && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm relative gap-4">
          <button
            onClick={() => setHideNudge(true)}
            className="absolute top-2 right-2 p-1 text-blue-400 hover:text-blue-700 transition cursor-pointer"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 pr-6">
            <div className="bg-[#1e3a8a] text-white p-2 rounded-lg flex-shrink-0">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#1e3a8a] text-sm">
                Update Faculty Directory
              </h3>
              <p className="text-xs text-slate-600">
                Don't forget to create public profiles for your lecturers so
                students can see their qualifications!
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("lecturer_profile")}
            className="w-full sm:w-auto px-4 py-2 bg-white border border-blue-200 text-[#1e3a8a] text-xs font-bold rounded-lg hover:bg-blue-100 transition whitespace-nowrap cursor-pointer"
          >
            Create Profile
          </button>
        </div>
      )}
    </div>
  );
}
