"use server";

import { createClient } from "@/lib/supabase/server";
import { ResourceType } from "@/types";
import { revalidatePath } from "next/cache";

export async function createResource(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || "";
  const levelId = formData.get("level_id") as string;
  const subjectId = formData.get("subject_id") as string;
  const moduleId = (formData.get("module_id") as string) || null;
  const resourceType = formData.get("resource_type") as ResourceType;
  const dietYear = (formData.get("diet_year") as string) || "";

  // 1. Read metadata injected from the client upload instead of raw File
  const fileUrl = formData.get("file_url") as string;
  const fileSizeBytesStr = formData.get("file_size_bytes") as string;
  const fileSizeBytes = fileSizeBytesStr ? parseInt(fileSizeBytesStr, 10) : 0;

  // Validation check on fileUrl rather than binary file payload
  if (!fileUrl || !title || !levelId || !subjectId || !resourceType) {
    return { error: "Please fill in all required fields and select a file." };
  }

  // 2. Insert metadata record into DB
  const { error: dbError } = await supabase.from("resources").insert({
    title,
    description,
    level_id: levelId,
    subject_id: subjectId,
    module_id: moduleId,
    resource_type: resourceType,
    exam_diet: dietYear,
    file_url: fileUrl,
    file_size_bytes: fileSizeBytes,
    is_published: true,
  });

  if (dbError) {
    return { error: `Failed to save resource record: ${dbError.message}` };
  }

  // Refresh routes instantly
  revalidatePath("/admin/resources");
  return { success: true };
}

export async function uploadResource(formData: FormData) {
  const supabase = await createClient();

  // 1. Grab all text fields
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const levelId = formData.get("level_id") as string;
  const subjectId = formData.get("subject_id") as string;
  const moduleId = formData.get("module_id") as string;
  const resourceType = formData.get("resource_type") as string;
  const examYear = formData.get("exam_year")
    ? parseInt(formData.get("exam_year") as string)
    : null;
  const examDiet = formData.get("exam_diet") as string;

  // 2. Grab the URL from the browser upload
  const fileUrl = formData.get("file_url") as string;
  const fileSizeBytes = formData.get("file_size_bytes")
    ? parseInt(formData.get("file_size_bytes") as string)
    : 0;

  // 🚨 THE FIX: Check for fileUrl instead of file!
  if (!title || !levelId || !subjectId || !fileUrl) {
    return { error: "Missing required fields or file upload failed." };
  }

  // 3. Save to database
  const { error: dbError } = await supabase.from("resources").insert({
    title,
    description: description || null,
    level_id: levelId,
    subject_id: subjectId,
    module_id: moduleId || null,
    resource_type: resourceType,
    exam_year: examYear,
    exam_diet: examDiet || null,
    file_url: fileUrl, // Saves the Supabase URL
    file_size_bytes: fileSizeBytes,
    is_published: true,
  });

  if (dbError) return { error: dbError.message };

  revalidatePath("/resources");
  revalidatePath("/admin/resources");
  return { success: true };
}
export async function deleteResource(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("resources").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/resources");
  revalidatePath("/admin/resources");
  return { success: true };
}

export async function saveResourceMetadata(data: {
  title: string;
  description: string;
  levelId: string;
  subjectId: string;
  moduleId?: string | null;
  resourceType: ResourceType;
  examYear: number | null;
  examDiet: string;
  fileUrl: string;
  fileSizeBytes: number;
}) {
  const supabase = await createClient();

  // Verify Admin Status
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized." };

  // Insert metadata record into Database
  const { error: dbError } = await supabase.from("resources").insert({
    title: data.title,
    description: data.description,
    level_id: data.levelId,
    subject_id: data.subjectId,
    module_id: data.moduleId || null,
    resource_type: data.resourceType,
    exam_year: data.examYear,
    exam_diet: data.examDiet,
    file_url: data.fileUrl,
    file_size_bytes: data.fileSizeBytes,
    is_published: true,
  });

  if (dbError) {
    console.error("Database Insert Error:", dbError);
    return { error: `Failed to save resource record: ${dbError.message}` };
  }

  revalidatePath("/resources");
  revalidatePath("/admin/resources");

  return { success: true };
}

export async function bulkDeleteItems(items: { id: string; type: string }[]) {
  const supabase = await createClient();

  const resourceIds = items
    .filter((i) => i.type === "resource")
    .map((i) => i.id);
  const videoIds = items.filter((i) => i.type === "video").map((i) => i.id);
  const questionIds = items
    .filter((i) => i.type === "question")
    .map((i) => i.id);

  const deleteTasks = [];

  if (resourceIds.length > 0) {
    deleteTasks.push(supabase.from("resources").delete().in("id", resourceIds));
  }
  if (videoIds.length > 0) {
    deleteTasks.push(supabase.from("videos").delete().in("id", videoIds));
  }
  if (questionIds.length > 0) {
    deleteTasks.push(supabase.from("questions").delete().in("id", questionIds));
  }

  // Delete from all 3 tables simultaneously
  await Promise.all(deleteTasks);

  revalidatePath("/admin/resources");
  return { success: true };
}
