"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitTutorApplication(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.from("tutor_applications").insert({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    cover_letter: formData.get("cover_letter"),
    cv_url: formData.get("cv_url"), // Uploaded from browser
  });

  if (error) return { error: error.message };
  return { success: true };
}

// Add to the bottom of src/lib/actions/careers.ts
export async function getTutorApplications() {
  const supabase = await createClient();

  // Only Super Admins should see the applications!
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_super_admin) return [];

  const { data } = await supabase
    .from("tutor_applications")
    .select("*")
    .order("created_at", { ascending: false });

  return data || [];
}
