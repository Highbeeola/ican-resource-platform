import { getLevels, getSubjects } from "@/lib/services/resources";
import VideoUploadForm from "@/components/admin/VideoUploadForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AdminNewVideoPage() {
  const levels = await getLevels();
  const subjects = await getSubjects();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* BACK NAVIGATION */}
        <Link
          href="/admin/resources"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition bg-white px-3.5 py-2 rounded-lg border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Resource Management</span>
        </Link>

        {/* HEADER */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e3a8a] tracking-tight">
            Publish Video Lecture
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Embed educational YouTube or Vimeo video lectures assigned to ICAN
            subjects.
          </p>
        </div>

        {/* FORM CONTAINER */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <VideoUploadForm levels={levels} subjects={subjects} />
        </div>
      </div>
    </div>
  );
}
