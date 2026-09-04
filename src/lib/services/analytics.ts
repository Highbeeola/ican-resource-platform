import { createClient } from "@/lib/supabase/server";

export async function getAdminAnalytics() {
  const supabase = await createClient();

  // 1. Total Students
  const { count: studentCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "student");

  // 2. Total PDF Resources
  const { count: resourceCount } = await supabase
    .from("resources")
    .select("*", { count: "exact", head: true });

  // 3. Total Videos
  const { count: videoCount } = await supabase
    .from("videos")
    .select("*", { count: "exact", head: true });

  // 4. Total Quiz Attempts
  const { count: quizCount } = await supabase
    .from("quiz_attempts")
    .select("id", { count: "exact", head: true });

  // 5. Total Subjects
  const { count: subjectCount } = await supabase
    .from("subjects")
    .select("*", { count: "exact", head: true });

  return {
    totalStudents: studentCount || 0,
    totalResources: resourceCount || 0,
    totalVideos: videoCount || 0,
    totalQuizAttempts: quizCount || 0,
    totalSubjects: subjectCount || 0,
  };
}
