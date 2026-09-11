"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { markNotificationAsRead } from "@/lib/actions/announcements";
import BackButton from "@/components/navigation/BackButton";
import {
  Bell,
  Megaphone,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      setIsLoading(true);
      const supabase = createClient();
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        window.location.href = "/login";
        return;
      }
      setUser(currentUser);

      // Fetch all announcements
      const { data: notes } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      // Fetch which ones THIS user has read
      const { data: reads } = await supabase
        .from("user_notification_reads")
        .select("announcement_id")
        .eq("user_id", currentUser.id);

      setNotifications(notes || []);
      setReadIds(new Set(reads?.map((r) => r.announcement_id) || []));
      setIsLoading(false);
    };

    fetchAlerts();
  }, []);

  const handleNotificationClick = async (id: string) => {
    // Toggle expand/collapse
    setExpandedId(expandedId === id ? null : id);

    // If it's unread, mark it as read in database
    if (!readIds.has(id)) {
      setReadIds((prev) => new Set(prev).add(id));
      await markNotificationAsRead(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <BackButton text="Back to Dashboard" />

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-[#1e3a8a] rounded-xl">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1e3a8a]">
                Notification Center
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Official updates, exam deadlines, and platform announcements.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 text-[#1e3a8a] animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-center text-slate-500 py-8">
                No notifications yet.
              </p>
            ) : (
              notifications.map((note) => {
                const isRead = readIds.has(note.id);
                const isExpanded = expandedId === note.id;

                return (
                  <div
                    key={note.id}
                    onClick={() => handleNotificationClick(note.id)}
                    className={`border rounded-2xl p-5 cursor-pointer transition-all ${
                      isRead
                        ? "bg-white border-slate-200 hover:border-slate-300"
                        : "bg-blue-50 border-blue-200 shadow-sm"
                    }`}
                  >
                    <div className="flex gap-4 items-start">
                      <div
                        className={`p-2.5 rounded-lg flex-shrink-0 mt-1 ${
                          isRead
                            ? "bg-slate-100 text-slate-500"
                            : "bg-[#f59e0b] text-white"
                        }`}
                      >
                        <Megaphone className="w-5 h-5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start gap-4">
                          <h3
                            className={`text-base ${
                              isRead
                                ? "font-semibold text-slate-700"
                                : "font-bold text-[#1e3a8a]"
                            }`}
                          >
                            {note.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            {!isRead && (
                              <span className="bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                                New
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400">
                              <Clock className="w-3 h-3" />
                              {new Date(note.created_at).toLocaleDateString(
                                "en-GB",
                                { day: "numeric", month: "short" },
                              )}
                            </span>
                          </div>
                        </div>

                        {/* CONDITIONAL CONTENT EXPANSION */}
                        {isExpanded ? (
                          <p className="text-sm text-slate-700 leading-relaxed pt-2 border-t border-slate-200/50 mt-2">
                            {note.content}
                          </p>
                        ) : (
                          <p className="text-sm text-slate-500 line-clamp-1">
                            {note.content}
                          </p>
                        )}
                      </div>

                      <div className="mt-1 text-slate-400">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
