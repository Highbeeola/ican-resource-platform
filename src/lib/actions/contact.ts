"use server";
import { createClient } from "@/lib/supabase/server";

export async function submitContactMessage(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  if (!name || !email || !message)
    return { error: "Please fill in all fields." };

  const { error } = await supabase
    .from("contact_messages")
    .insert({ name, email, message });

  if (error)
    return { error: "Failed to send message. Please try again later." };

  return { success: true };
}

export async function getContactMessages() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  return data || [];
}

export async function markMessageAsRead(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_messages")
    .update({ is_read: true })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/resources");
  return { success: true };
}

export async function deleteMessage(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_messages")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/resources");
  return { success: true };
}
import { revalidatePath } from "next/cache";
