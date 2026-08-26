"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleFavorite(resourceId?: string, videoId?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to save bookmarks." };
  }

  if (resourceId) {
    const { data: existing } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("resource_id", resourceId)
      .maybeSingle();

    if (existing) {
      await supabase.from("favorites").delete().eq("id", existing.id);
      revalidatePath("/", "layout");
      return { isBookmarked: false };
    } else {
      await supabase.from("favorites").insert({
        user_id: user.id,
        resource_id: resourceId,
      });
      revalidatePath("/", "layout");
      return { isBookmarked: true };
    }
  }

  if (videoId) {
    const { data: existing } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("video_id", videoId)
      .maybeSingle();

    if (existing) {
      await supabase.from("favorites").delete().eq("id", existing.id);
      revalidatePath("/", "layout");
      return { isBookmarked: false };
    } else {
      await supabase.from("favorites").insert({
        user_id: user.id,
        video_id: videoId,
      });
      revalidatePath("/", "layout");
      return { isBookmarked: true };
    }
  }

  return { error: "Invalid bookmark target." };
}
