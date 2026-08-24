"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createVideo(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const levelId = formData.get("level_id") as string;
  const subjectId = formData.get("subject_id") as string;
  const videoUrl = formData.get("video_url") as string;
  const durationMinutes = formData.get("duration_minutes")
    ? parseInt(formData.get("duration_minutes") as string)
    : null;
  const instructorName = formData.get("instructor_name") as string;

  if (!title || !levelId || !subjectId || !videoUrl) {
    return { error: "Title, Level, Subject, and Video URL are required." };
  }

  const { error } = await supabase.from("videos").insert({
    title,
    description,
    level_id: levelId,
    subject_id: subjectId,
    video_url: videoUrl,
    duration_minutes: durationMinutes,
    instructor_name: instructorName || null,
    is_published: true,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/resources");
  revalidatePath("/admin/resources");
  return { success: true };
}
// Add to src/lib/actions/videos.ts:
export async function deleteVideo(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("videos").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/resources");
  revalidatePath("/admin/resources");
  return { success: true };
}
