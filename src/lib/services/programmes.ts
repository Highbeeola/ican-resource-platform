import { createClient } from "@/lib/supabase/server";

export interface Programme {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
}

export async function getProgrammes(): Promise<Programme[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("programmes")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching programmes:", error);
    return [];
  }
  return data || [];
}
