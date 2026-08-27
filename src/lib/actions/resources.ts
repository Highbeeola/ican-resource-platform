"use server";

import { createClient } from "@/lib/supabase/server";
import { ResourceType } from "@/types";
import { revalidatePath } from "next/cache";

export async function uploadResource(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const levelId = formData.get("level_id") as string;
  const subjectId = formData.get("subject_id") as string;
  const resourceType = formData.get("resource_type") as ResourceType;
  const examYear = formData.get("exam_year")
    ? parseInt(formData.get("exam_year") as string)
    : null;
  const examDiet = formData.get("exam_diet") as string;
  const file = formData.get("file") as File;

  if (!file || !title || !levelId || !subjectId || !resourceType) {
    return { error: "Please fill in all required fields and select a file." };
  }

  // 1. Upload File to Supabase Storage
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `resources/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("ican-resources")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Storage Upload Error:", uploadError);
    return { error: `Failed to upload file: ${uploadError.message}` };
  }

  // 2. Get Public URL for the uploaded file
  const { data: publicUrlData } = supabase.storage
    .from("ican-resources")
    .getPublicUrl(filePath);

  const fileUrl = publicUrlData.publicUrl;

  // 3. Insert metadata record into Database
  const { error: dbError } = await supabase.from("resources").insert({
    title,
    description,
    level_id: levelId,
    subject_id: subjectId,
    resource_type: resourceType,
    exam_year: examYear,
    exam_diet: examDiet,
    file_url: fileUrl,
    file_size_bytes: file.size,
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
// Add to src/lib/actions/resources.ts:
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
