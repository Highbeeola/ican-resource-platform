"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createArticleLesson(
  formData: FormData,
  htmlContent: string,
) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const levelId = formData.get("level_id") as string;
  const subjectId = formData.get("subject_id") as string;
  const resourceType = formData.get("resource_type") as string;
  const description = formData.get("description") as string;
  // 🚨 NEW: Capture the module_id
  const moduleId = formData.get("module_id") as string;

  if (
    !title ||
    !levelId ||
    !subjectId ||
    !htmlContent ||
    htmlContent === "<p><br></p>"
  ) {
    return {
      error:
        "Please fill in all required fields and write some lesson content.",
    };
  }

  const { error } = await supabase.from("resources").insert({
    title,
    description: description || null,
    level_id: levelId,
    subject_id: subjectId,
    resource_type: resourceType || "notes", // Defaults to notes
    article_content: htmlContent,
    is_published: true,
    module_id: moduleId || null, // 🚨 NEW: Save it to the database!
  });

  if (error) return { error: error.message };

  revalidatePath("/resources");
  revalidatePath("/admin/resources");
  return { success: true };
}
