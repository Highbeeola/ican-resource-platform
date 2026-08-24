import { getLevels, getSubjects } from "@/lib/services/resources";
import VideoUploadForm from "@/components/admin/VideoUploadForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AdminNewVideoPage() {
  const levels = await getLevels();
  const subjects = await getSubjects();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/admin/resources"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Resource Management</span>
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Publish Video Lecture
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Embed educational YouTube or Vimeo video lectures assigned to ICAN
            subjects.
          </p>
        </div>

        <VideoUploadForm levels={levels} subjects={subjects} />
      </div>
    </div>
  );
}
