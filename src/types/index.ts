export type UserRole = "student" | "admin";

export type ResourceType =
  | "study_text"
  | "pathfinder"
  | "past_question"
  | "mock_question"
  | "solution"
  | "notes"
  | "other";

export interface Level {
  id: string;
  name: string; // 'Foundation' | 'Skills' | 'Professional'
  slug: string;
  description: string | null;
  display_order: number;
  created_at: string;
}

export interface Subject {
  id: string;
  level_id: string;
  name: string;
  code: string | null;
  description: string | null;
  display_order: number;
  created_at: string;
  instructor_name?: string | null;
  estimated_hours?: number;
  avg_rating?: number | null;
  level?: Level;
}

export interface Resource {
  id: string;
  level_id: string;
  subject_id: string;
  title: string;
  description: string | null;
  resource_type: ResourceType;
  exam_year: number | null;
  exam_diet: string | null;
  file_url: string;
  file_size_bytes: number | null;
  thumbnail_url: string | null;
  is_published: boolean;
  download_count: number;
  created_at: string;
  updated_at: string;
  subject?: Subject;
  level?: Level;
}

export interface Video {
  id: string;
  level_id: string;
  subject_id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration_minutes: number | null;
  instructor_name: string | null;
  is_published: boolean;
  created_at: string;
  subject?: Subject;
}
