import { createClient } from "@/lib/supabase/server";
import { Level, Subject, Resource, ResourceType } from "@/types";

export interface ResourceFilters {
  levelSlug?: string;
  subjectId?: string;
  resourceType?: ResourceType;
  examYear?: number;
  searchQuery?: string;
  page?: number;
  limit?: number;
}

// 1. Fetch Levels (Filtered by Programme or 'all')
export async function getLevels(progSlug: string = "ican"): Promise<Level[]> {
  const supabase = await createClient();

  let query = supabase
    .from("levels")
    .select("*, programme:programmes(name, slug)");

  if (progSlug && progSlug !== "all") {
    query = supabase
      .from("levels")
      .select("*, programme:programmes!inner(name, slug)")
      .eq("programme.slug", progSlug);
  }

  const { data, error } = await query.order("display_order", {
    ascending: true,
  });

  if (error) return [];
  return data || [];
}

// 2. Fetch Subjects (Filtered by Level & Programme, includes resource/video relations)
export async function getSubjects(
  levelSlug?: string,
  searchQuery?: string,
  progSlug: string = "ican",
): Promise<Subject[]> {
  const supabase = await createClient();

  let query = supabase
    .from("subjects")
    .select(
      "*, level:levels(*, programme:programmes(name, slug)), resources(id), videos(id)",
    );

  if (progSlug && progSlug !== "all") {
    query = supabase
      .from("subjects")
      .select(
        "*, level:levels!inner(*, programme:programmes!inner(name, slug)), resources(id), videos(id)",
      )
      .eq("level.programme.slug", progSlug);
  }

  if (levelSlug) {
    query = query.eq("level.slug", levelSlug);
  }

  if (searchQuery && searchQuery.trim() !== "") {
    const clean = searchQuery.trim().replace(/[^a-zA-Z0-9 ]/g, "");
    if (clean) {
      query = query.or(`name.ilike.%${clean}%,code.ilike.%${clean}%`);
    }
  }

  const { data, error } = await query.order("display_order", {
    ascending: true,
  });

  if (error) return [];
  return data || [];
}

// 3. Fetch Filtered Resources for Student Engine
export async function getResources(filters: ResourceFilters) {
  const supabase = await createClient();
  const limit = filters.limit || 12;
  const page = filters.page || 1;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("resources")
    .select(
      `
      *,
      subject:subjects(id, name, code),
      level:levels(id, name, slug)
    `,
      { count: "exact" },
    )
    .eq("is_published", true);

  // Apply Filters dynamically
  if (filters.subjectId) {
    query = query.eq("subject_id", filters.subjectId);
  }

  if (filters.resourceType) {
    query = query.eq("resource_type", filters.resourceType);
  }

  if (filters.examYear) {
    query = query.eq("exam_year", filters.examYear);
  }

  if (filters.levelSlug) {
    const { data: level } = await supabase
      .from("levels")
      .select("id")
      .eq("slug", filters.levelSlug)
      .single();

    if (level) {
      query = query.eq("level_id", level.id);
    }
  }

  // Full-Text Search across Title and Description
  if (filters.searchQuery) {
    query = query.or(
      `title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`,
    );
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching resources:", error);
    return { resources: [], total: 0 };
  }

  return {
    resources: (data as Resource[]) || [],
    total: count || 0,
  };
}
