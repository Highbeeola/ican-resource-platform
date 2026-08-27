import { createClient } from "@/lib/supabase/server";

export async function getStudentPerformance(userId: string) {
  const supabase = await createClient();

  // Fetch all quiz attempts for this user, including the subject name
  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("*, subject:subjects(id, name)")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });

  if (!attempts || attempts.length === 0) {
    return {
      attempts: [],
      subjectAverages: [],
      overallAvg: 0,
      totalQuestions: 0,
    };
  }

  let totalScore = 0;
  let totalQuestionsAnswered = 0;
  const subjectMap: Record<
    string,
    { id: string; name: string; totalScore: number; attempts: number }
  > = {};

  attempts.forEach((attempt) => {
    totalScore += attempt.score_percentage;
    totalQuestionsAnswered += attempt.total_questions;

    const subId = attempt.quiz_id; // We used quiz_id to store subject_id
    if (!subjectMap[subId]) {
      subjectMap[subId] = {
        id: subId,
        name: attempt.subject?.name || "Unknown Subject",
        totalScore: 0,
        attempts: 0,
      };
    }
    subjectMap[subId].totalScore += attempt.score_percentage;
    subjectMap[subId].attempts += 1;
  });

  // Calculate Averages
  const overallAvg = Math.round(totalScore / attempts.length);

  const subjectAverages = Object.values(subjectMap)
    .map((sub) => ({
      id: sub.id,
      name: sub.name,
      avgScore: Math.round(sub.totalScore / sub.attempts),
      totalAttempts: sub.attempts,
    }))
    .sort((a, b) => b.avgScore - a.avgScore); // Sort highest score first

  return {
    attempts,
    subjectAverages,
    overallAvg,
    totalQuestions: totalQuestionsAnswered,
  };
}
