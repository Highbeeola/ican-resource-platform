import { createClient } from "@/lib/supabase/server";

// Define interface for the mapped subject performance stats
interface SubjectPerformance {
  id: string;
  name: string;
  avgScore: number;
  totalAttempts: number;
}

export async function getStudentPerformance(userId: string) {
  const supabase = await createClient();

  // Fetch all quiz attempts for this user, including the subject name
  const { data: attempts, error } = await supabase
    .from("quiz_attempts")
    .select("*, subject:subjects(id, name)")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });

  if (error) {
    console.error("Error fetching performance data:", error);
    return {
      attempts: [],
      subjectAverages: [],
      overallAvg: 0,
      totalQuestions: 0,
    };
  }

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
    totalScore += attempt.score_percentage || 0;
    totalQuestionsAnswered += attempt.total_questions || 0;

    // Use subject_id column instead of obsolete quiz_id
    const subId = attempt.subject_id;

    if (subId) {
      if (!subjectMap[subId]) {
        subjectMap[subId] = {
          id: subId,
          name: attempt.subject?.name || "Unknown Subject",
          totalScore: 0,
          attempts: 0,
        };
      }
      subjectMap[subId].totalScore += attempt.score_percentage || 0;
      subjectMap[subId].attempts += 1;
    }
  });

  // Calculate Averages
  const overallAvg = Math.round(totalScore / attempts.length);

  const subjectAverages: SubjectPerformance[] = Object.values(subjectMap)
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
