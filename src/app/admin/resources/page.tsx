import { createClient } from "@/lib/supabase/server";
import { getLevels, getSubjects, getResources } from "@/lib/services/resources";
import { getAdminAnalytics } from "@/lib/services/analytics";
import AdminDashboardTabs from "@/components/admin/AdminDashboardTabs";
import { Shield } from "lucide-react";

export default async function AdminResourcesPage() {
  const supabase = await createClient();

  const levels = await getLevels('all');
  const subjects = await getSubjects(undefined, undefined, 'all');
  const { resources } = await getResources({ limit: 100 });
  const analytics = await getAdminAnalytics();

  const { data: videos } = await supabase
    .from("videos")
    .select("*, subject:subjects(name), level:levels(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* DASHBOARD HEADER (LIGHT THEME) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-[#1e3a8a] font-bold text-xl sm:text-2xl">
              <Shield className="w-6 h-6 text-[#f59e0b]" />
              <h1>KRL Academy Admin Portal</h1>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Centralized command center for managing study materials, students,
              and analytics.
            </p>
          </div>
        </div>

        {/* UNIFIED TABS */}
        <AdminDashboardTabs
          levels={levels}
          subjects={subjects}
          resources={resources}
          videos={videos || []}
          analytics={analytics}
        />
      </div>
    </div>
  );
}
