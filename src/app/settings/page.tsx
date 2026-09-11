"use client";

import { useState, useEffect, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateStudentLevel } from "@/lib/actions/profile";
import { Level } from "@/types";
import { Settings, User, BookOpen, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import BackButton from "@/components/navigation/BackButton";

export default function SettingsPage() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();

    // 1. Fetch user profile
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from("profiles")
          .select("*, level:levels(*)")
          .eq("id", user.id)
          .single()
          .then(({ data }) => {
            setProfile(data);
            if (data?.current_level_id)
              setSelectedLevelId(data.current_level_id);
          });
      }
    });

    // 2. Fetch all levels directly on the client
    supabase
      .from("levels")
      .select("*, programme:programmes(name, slug)")
      .order("display_order", { ascending: true })
      .then(({ data }) => setLevels(data || []));
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      const res = await updateStudentLevel(selectedLevelId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(
          "Profile updated successfully! Your dashboard has been customized.",
        );
        setProfile((prev: any) => ({
          ...prev,
          current_level_id: selectedLevelId,
        }));
      }
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <BackButton text="Back to Dashboard" />

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-2xl font-bold text-[#1e3a8a] flex items-center gap-2">
              <Settings className="w-6 h-6 text-[#f59e0b]" />
              Account Settings
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your profile and customize your learning experience.
            </p>
          </div>

          {/* PROFILE INFO (READ ONLY) */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  disabled
                  value={profile?.full_name || "Loading..."}
                  className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={profile?.email || "Loading..."}
                  className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* EDITABLE LEVEL SELECTION */}
          <form
            onSubmit={handleSave}
            className="space-y-4 pt-4 border-t border-slate-100"
          >
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Academic Programme
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Select your current stage to customize your dashboard syllabus.
            </p>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Current Stage / Level *
                </label>
                <select
                  required
                  value={selectedLevelId}
                  onChange={(e) => setSelectedLevelId(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none"
                >
                  <option value="" disabled>
                    Select your current stage...
                  </option>
                  {levels.map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.programme?.name ? `${lvl.programme.name} - ` : ""}
                      {lvl.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={
                isPending ||
                !selectedLevelId ||
                selectedLevelId === profile?.current_level_id
              }
              className="w-full sm:w-auto px-8 py-3 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold rounded-xl text-sm transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
