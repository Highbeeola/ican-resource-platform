import { createClient } from "@/lib/supabase/server";

export async function getStudentDashboardData(userId: string) {
  const supabase = await createClient();

  // 1. Profile & Basic Metrics
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, level:levels(*, programme:programmes(*))")
    .eq("id", userId)
    .single();
  const { count: completedCount } = await supabase
    .from("user_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);
  const { count: quizCount } = await supabase
    .from("quiz_attempts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);
  const { data: favorites } = await supabase
    .from("favorites")
    .select(
      "*, resource:resources(*, subject:subjects(name)), video:videos(*, subject:subjects(name))",
    )
    .eq("user_id", userId);

  // 2. Recent Activity ("Continue Learning")
  const { data: recentActivity } = await supabase
    .from("user_progress")
    .select(
      "*, resource:resources(*, subject:subjects(name)), video:videos(*, subject:subjects(name))",
    )
    .eq("user_id", userId)
    .order("last_accessed_at", { ascending: false })
    .limit(3);

  // 3. Performance & Recommendations Engine
  const { data: quizAttempts } = await supabase
    .from("quiz_attempts")
    .select("score_percentage, quiz_id, subject:subjects(name)")
    .eq("user_id", userId);

  let avgQuizScore = 0;
  let weakSubjectIds: string[] = [];

  if (quizAttempts && quizAttempts.length > 0) {
    const totalScore = quizAttempts.reduce(
      (acc, curr) => acc + curr.score_percentage,
      0,
    );
    avgQuizScore = Math.round(totalScore / quizAttempts.length);

    // Identify subjects where average is < 50%
    const subScores: Record<string, { total: number; count: number }> = {};
    quizAttempts.forEach((a) => {
      if (!subScores[a.quiz_id]) subScores[a.quiz_id] = { total: 0, count: 0 };
      subScores[a.quiz_id].total += a.score_percentage;
      subScores[a.quiz_id].count += 1;
    });
    weakSubjectIds = Object.keys(subScores).filter(
      (id) => subScores[id].total / subScores[id].count < 50,
    );
  }

  // Fetch Recommended Revision Materials for weak subjects
  let recommendations: any[] = [];
  if (weakSubjectIds.length > 0) {
    const { data: recVideos } = await supabase
      .from("videos")
      .select("*, subject:subjects(name)")
      .in("subject_id", weakSubjectIds)
      .limit(3);
    recommendations = recVideos || [];
  }

  // 4. Latest Announcement
  const { data: announcement } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    profile,
    completedCount: completedCount || 0,
    quizCount: quizCount || 0,
    avgQuizScore,
    favorites: favorites || [],
    recentActivity: recentActivity || [],
    recommendations,
    announcement,
  };
}
