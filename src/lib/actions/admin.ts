"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function promoteUserToAdmin(email: string) {
  const supabase = await createClient();

  // 1. Verify that the current user performing this action is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized action." };

  // 2. SUPER ADMIN STRICT CHECK: Only YOU can add new lecturers!
  if (user.email !== "ibrahimoladehinde1@gmail.com") {
    return {
      error:
        "Security Alert: Only the Academy Director (Super Admin) can grant faculty access.",
    };
  }

  // 3. Find the target user profile by email
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

  // 4. Promote target user to admin role
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
