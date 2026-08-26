import { createClient } from "@/lib/supabase/server";
import { getLevels, getSubjects, getResources } from "@/lib/services/resources";
import AdminDashboardTabs from "@/components/admin/AdminDashboardTabs";
import { Shield } from "lucide-react";

export default async function AdminResourcesPage() {
  const supabase = await createClient();

  const levels = await getLevels();
  const subjects = await getSubjects();
  const { resources } = await getResources({ limit: 100 });

  // FETCH ALL PUBLISHED VIDEOS
  const { data: videos } = await supabase
    .from("videos")
    .select("*, subject:subjects(name), level:levels(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* DASHBOARD HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xl sm:text-2xl">
              <Shield className="w-6 h-6" />
              <h1>KRL Academy Admin Portal</h1>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Centralized command center for managing ICAN study materials,
              video lectures, and subjects.
            </p>
          </div>
        </div>

        {/* UNIFIED TABS */}
        <AdminDashboardTabs
          levels={levels}
          subjects={subjects}
          resources={resources}
          videos={videos || []}
        />
      </div>
    </div>
  );
}
