"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface CreateModuleParams {
  title: string;
  subjectId: string;
  displayOrder: number;
}

export async function createModule(input: FormData | CreateModuleParams) {
  const supabase = await createClient();

  // Extract fields whether passed as an object or FormData
  let title: string;
  let subjectId: string;
  let displayOrder: number;

  if (input instanceof FormData) {
    title = input.get("title") as string;
    subjectId = input.get("subjectId") as string;
    displayOrder = parseInt((input.get("displayOrder") as string) || "1", 10);
  } else {
    title = input.title;
    subjectId = input.subjectId;
    displayOrder = input.displayOrder;
  }

  const { data, error } = await supabase
    .from("modules")
    .insert([
      {
        title,
        subject_id: subjectId,
        display_order: displayOrder,
      },
    ])
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/admin");

  return { error: null, data };
}

// Helper to fetch modules for the upload dropdowns
export async function getModules() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("modules")
    .select("*")
    .order("display_order", { ascending: true });
  return data || [];
}
