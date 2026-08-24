"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// 1. Create Broadcast Announcement
export async function createAnnouncement(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  if (!title || !content) {
    return { error: "Title and content are required." };
  }

  const { error } = await supabase.from("announcements").insert({
    title,
    content,
    is_published: true,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

// 2. Fetch Latest Announcement for Ticker
export async function getLatestAnnouncement() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data || null;
}
