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
  const resourceType = formData.get("resource_type") as any;
  const description = formData.get("description") as string;

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
    description,
    level_id: levelId,
    subject_id: subjectId,
    resource_type: resourceType,
    article_content: htmlContent, // Save the rich HTML text!
    is_published: true,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/resources");
  revalidatePath("/admin/resources");
  return { success: true };
}
