import { getLevels, getSubjects } from "@/lib/services/resources";
import ResourceUploadForm from "@/components/admin/ResourceUploadForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AdminNewResourcePage() {
  const levels = await getLevels();
  const subjects = await getSubjects();

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/admin/resources"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Resources</span>
        </Link>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Upload ICAN Resource
          </h1>
          <p className="text-slate-600 mt-1">
            Add a new study text, pathfinder, or past question document to the
            student library.
          </p>
        </div>

        <ResourceUploadForm levels={levels} subjects={subjects} />
      </div>
    </div>
  );
}
