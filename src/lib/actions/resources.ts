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
  const file = formData.get("file") as File;

  if (!file || !title || !levelId || !subjectId || !resourceType) {
    return { error: "Please fill in all required fields and select a file." };
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `resources/${fileName}`;

  // 1. Upload File
  const { error: uploadError } = await supabase.storage
    .from("ican-resources")
    .upload(filePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return { error: `Failed to upload file: ${uploadError.message}` };
  }

  // Synchronously compute public URL without extra server roundtrips
  const { data: publicUrlData } = supabase.storage
    .from("ican-resources")
    .getPublicUrl(filePath);

  // 2. Insert metadata record
  const { error: dbError } = await supabase.from("resources").insert({
    title,
    description,
    level_id: levelId,
    subject_id: subjectId,
    module_id: moduleId,
    resource_type: resourceType,
    exam_diet: dietYear,
    file_url: publicUrlData.publicUrl,
    file_size_bytes: file.size,
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
  return createResource(formData);
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
