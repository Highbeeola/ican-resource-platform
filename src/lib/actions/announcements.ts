"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// 1. Create Broadcast Announcement
export async function createAnnouncement(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const startDate = formData.get("start_date") as string;
  const endDate = formData.get("end_date") as string;

  if (!title || !content) {
    return { error: "Title and content are required." };
  }

  const { error } = await supabase.from("announcements").insert({
    title,
    content,
    is_published: true,
    start_date: startDate ? new Date(startDate).toISOString() : null,
    end_date: endDate ? new Date(endDate).toISOString() : null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

// 2. Fetch Latest Active Announcement for Ticker (Scheduled & Valid Dates Only)
export async function getLatestAnnouncement() {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch the latest active announcements
  const { data } = await supabase
    .from("announcements")
    .select("id, title, content")
    .eq("is_published", true)
    .or(`start_date.is.null,start_date.lte.${now}`)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .order("created_at", { ascending: false })
    .limit(5);

  if (!data || data.length === 0) return null;

  // If user is logged in, filter out the ones they have already marked as read!
  if (user) {
    const { data: reads } = await supabase
      .from("user_notification_reads")
      .select("announcement_id")
      .eq("user_id", user.id);

    const readIds = new Set(reads?.map((r) => r.announcement_id) || []);
    const unreadAnnouncements = data.filter((a) => !readIds.has(a.id));

    return unreadAnnouncements.length > 0 ? unreadAnnouncements[0] : null;
  }

  // If guest, just return the latest one
  return data[0];
}

// 3. Delete Announcement
export async function deleteAnnouncement(announcementId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", announcementId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

// 4. Fetch All Announcements
export async function getAllAnnouncements() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  return data || [];
}

// 5. Mark Announcement as Read
export async function markNotificationAsRead(announcementId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("user_notification_reads")
    .insert({
      user_id: user.id,
      announcement_id: announcementId,
    })
    .select()
    .single();

  revalidatePath("/notifications");
}
