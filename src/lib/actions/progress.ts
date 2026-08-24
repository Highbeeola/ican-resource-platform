"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// 1. Submit Course Rating
export async function submitCourseRating(
  subjectId: string,
  rating: number,
  reviewText?: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to rate this course." };
  }

  if (rating < 1 || rating > 5) {
    return { error: "Rating must be between 1 and 5 stars." };
  }

  const { error } = await supabase.from("course_ratings").upsert({
    user_id: user.id,
    subject_id: subjectId,
    rating,
    review_text: reviewText || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/resources/subject/${subjectId}`);
  revalidatePath("/resources");
  return { success: true };
}

// 2. Toggle Resource / Video Completion
export async function toggleItemCompletion(
  subjectId: string,
  resourceId?: string,
  videoId?: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to track progress." };
  }

  if (resourceId) {
    // Check if already completed
    const { data: existing } = await supabase
      .from("user_progress")
      .select("id")
      .eq("user_id", user.id)
      .eq("resource_id", resourceId)
      .single();

    if (existing) {
      await supabase.from("user_progress").delete().eq("id", existing.id);
    } else {
      await supabase.from("user_progress").insert({
        user_id: user.id,
        resource_id: resourceId,
      });
    }
  } else if (videoId) {
    const { data: existing } = await supabase
      .from("user_progress")
      .select("id")
      .eq("user_id", user.id)
      .eq("video_id", videoId)
      .single();

    if (existing) {
      await supabase.from("user_progress").delete().eq("id", existing.id);
    } else {
      await supabase.from("user_progress").insert({
        user_id: user.id,
        video_id: videoId,
      });
    }
  }

  revalidatePath(`/resources/subject/${subjectId}`);
  revalidatePath("/resources");
  return { success: true };
}
