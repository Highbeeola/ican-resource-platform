"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createLecturer(formData: FormData) {
  const supabase = await createClient();

  const fullName = formData.get("full_name") as string;
  const qualifications = formData.get("qualifications") as string;
  const experienceYears =
    parseInt(formData.get("experience_years") as string) || 0;
  const biography = formData.get("biography") as string;

  if (!fullName) {
    return { error: "Lecturer name is required." };
  }

  const { error } = await supabase.from("lecturers").insert({
    full_name: fullName,
    qualifications: qualifications || null,
    experience_years: experienceYears,
    biography: biography || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/lecturers");
  revalidatePath("/admin/resources");
  return { success: true };
}

export async function getLecturers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lecturers")
    .select("*")
    .order("created_at", { ascending: false });
  return data || [];
}

export async function deleteLecturer(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("lecturers").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/lecturers");
  revalidatePath("/admin/resources");
  return { success: true };
}
