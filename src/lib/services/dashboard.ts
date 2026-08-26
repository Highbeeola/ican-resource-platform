import { createClient } from "@/lib/supabase/server";

export async function getStudentDashboardData(userId: string) {
  const supabase = await createClient();

  // 1. Fetch User Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, level:levels(*)")
    .eq("id", userId)
    .single();

  // 2. Fetch User Completed Items
  const { data: progressItems, count: completedCount } = await supabase
    .from("user_progress")
    .select("*, resource:resources(*), video:videos(*)", { count: "exact" })
    .eq("user_id", userId);

  // 3. Fetch User Favorited Materials
  const { data: favorites, count: favoritesCount } = await supabase
    .from("favorites")
    .select(
      "*, resource:resources(*, subject:subjects(*)), video:videos(*, subject:subjects(*))",
      { count: "exact" },
    )
    .eq("user_id", userId);

  // 4. Fetch User Quiz Attempts
  const { data: quizAttempts, count: quizCount } = await supabase
    .from("quiz_attempts")
    .select("*", { count: "exact" })
    .eq("user_id", userId);

  // 5. Calculate Average Quiz Score
  let avgQuizScore = 0;
  if (quizAttempts && quizAttempts.length > 0) {
    const totalScore = quizAttempts.reduce(
      (acc, curr) => acc + curr.score_percentage,
      0,
    );
    avgQuizScore = Math.round(totalScore / quizAttempts.length);
  }

  return {
    profile,
    completedCount: completedCount || 0,
    favoritesCount: favoritesCount || 0,
    quizCount: quizCount || 0,
    avgQuizScore,
    favorites: favorites || [],
    recentProgress: progressItems || [],
  };
}
