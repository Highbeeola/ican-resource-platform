"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createSubject(formData: FormData) {
  const supabase = await createClient();
  const meetUrl = formData.get("meet_url") as string;
  const meetTime = formData.get("meet_time") as string;

  const levelId = formData.get("level_id") as string;
  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const instructorName = formData.get("instructor_name") as string;
  const estimatedHours = formData.get("estimated_hours")
    ? parseInt(formData.get("estimated_hours") as string)
    : 0;
  const description = formData.get("description") as string;

  if (!levelId || !name) {
    return { error: "Level and Subject Name are required." };
  }

  const { error } = await supabase.from("subjects").insert({
    level_id: levelId,
    name,
    code: code || null,
    instructor_name: instructorName || null,
    estimated_hours: estimatedHours,
    description: description || null,
    meet_url: meetUrl || null,
    meet_time: meetTime || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/resources");
  revalidatePath("/admin/subjects");
  return { success: true };
}
