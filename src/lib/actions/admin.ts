"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function promoteUserToAdmin(email: string) {
  const supabase = await createClient();

  // 1. Verify that the current user performing this action is an admin
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized action." };

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (currentProfile?.role !== "admin") {
    return { error: "Only existing admins can promote faculty members." };
  }

  // 2. Find the target user profile by email
  const cleanEmail = email.trim().toLowerCase();
  const { data: targetProfile, error: findError } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("email", cleanEmail)
    .single();

  if (findError || !targetProfile) {
    return {
      error: `No registered user found with email "${cleanEmail}". Please ask the lecturer to create a free account at /register first!`,
    };
  }

  // 3. Promote target user to admin role
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", targetProfile.id);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/admin/resources");
  return {
    success: true,
    message: `Granted Faculty / Admin access to ${targetProfile.full_name} (${cleanEmail})!`,
  };
}
