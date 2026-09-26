"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// 1. Admin Add Question to Question Bank
export async function createQuestion(formData: FormData) {
  const supabase = await createClient();

  const subjectId = formData.get("subject_id") as string;
  const topicName = formData.get("topic_name") as string;
  const questionText = formData.get("question_text") as string;
  const explanation = formData.get("explanation") as string;
  const optionA = formData.get("option_a") as string;
  const optionB = formData.get("option_b") as string;
  const optionC = formData.get("option_c") as string;
  const optionD = formData.get("option_d") as string;
  const correctOption = formData.get("correct_option") as string; // 'A', 'B', 'C', 'D'

  if (!subjectId || !questionText || !optionA || !optionB || !correctOption) {
    return { error: "Subject, Question, and Options A-D are required." };
  }

  // Insert Question
  const { data: question, error: qError } = await supabase
    .from("questions")
    .insert({
      subject_id: subjectId,
      topic_name: topicName || null,
      question_text: questionText,
      explanation: explanation || null,
    })
    .select("id")
    .single();

  if (qError || !question) {
    return { error: qError?.message || "Failed to create question." };
  }

  // Insert 4 MCQ Options
  const options = [
    {
      question_id: question.id,
      option_text: optionA,
      is_correct: correctOption === "A",
    },
    {
      question_id: question.id,
      option_text: optionB,
      is_correct: correctOption === "B",
    },
    {
      question_id: question.id,
      option_text: optionC,
      is_correct: correctOption === "C",
    },
    {
      question_id: question.id,
      option_text: optionD,
      is_correct: correctOption === "D",
    },
  ];

  const { error: optError } = await supabase
    .from("question_options")
    .insert(options);

  if (optError) {
    return { error: optError.message };
  }

  revalidatePath("/resources");
  revalidatePath("/admin/resources");
  return { success: true };
}

// 2. Submit Student Quiz Attempt
// Define the type for the selected option properties
interface CorrectOption {
  id: string;
  question_id: string;
  is_correct: boolean;
}

export async function submitQuizAttempt(
  subjectId: string,
  totalQuestions: number,
  userAnswers: Record<string, string>,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to submit a quiz." };
  }

  // Fetch correct options for answered questions
  const questionIds = Object.keys(userAnswers);
  
  // Explicitly type correctOptions using the interface
  let correctOptions: CorrectOption[] = [];
  
  if (questionIds.length > 0) {
    const { data, error: fetchError } = await supabase
      .from("question_options")
      .select("id, question_id, is_correct")
      .in("question_id", questionIds)
      .eq("is_correct", true);

    if (fetchError) {
      console.error("Error fetching correct options:", fetchError);
      return { error: "Failed to evaluate quiz answers." };
    }
    
    correctOptions = (data as CorrectOption[]) || [];
  }

  let correctCount = 0;
  correctOptions.forEach((opt) => {
    if (userAnswers[opt.question_id] === opt.id) {
      correctCount++;
    }
  });

  const scorePercentage = Math.round(
    (correctCount / (totalQuestions || 1)) * 100,
  );

  // Record attempt with error handling & subject_id schema fix
  const { error: insertError } = await supabase.from("quiz_attempts").insert({
    user_id: user.id,
    subject_id: subjectId,
    score_percentage: scorePercentage,
    total_questions: totalQuestions,
    correct_answers: correctCount,
  });

  if (insertError) {
    console.error("Quiz Save Error:", insertError);
    return { error: "Failed to save quiz score to the database." };
  }

  // Revalidate relevant cache paths
  revalidatePath("/dashboard");
  revalidatePath("/performance");
  revalidatePath("/admin/resources");

  return { success: true, scorePercentage, correctCount, totalQuestions };
}

export async function uploadBulkQuestions(
  subjectId: string,
  questionsData: any[],
  quizGroupName: string,
) {
  const supabase = await createClient();

  // Ensure a fallback name if quizGroupName isn't explicitly provided or is blank
  const finalGroupName = quizGroupName?.trim() || "General Practice Questions";

  const questionsToInsert: any[] = [];
  const optionsToInsert: any[] = [];
  const questionIds: string[] = []; // Track IDs for manual rollback

  for (const row of questionsData) {
    const normRow: Record<string, string> = {};
    for (const key in row) {
      if (key) {
        const cleanKey = key.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        normRow[cleanKey] = row[key];
      }
    }

    const qText = normRow["question"];
    const optA = normRow["optiona"] || normRow["a"];
    const optB = normRow["optionb"] || normRow["b"];
    const optC = normRow["optionc"] || normRow["c"];
    const optD = normRow["optiond"] || normRow["d"];
    const explanation = normRow["explanation"] || null;

    let correctOpt = String(
      normRow["correctoption"] || normRow["correct"] || normRow["answer"] || "",
    )
      .trim()
      .toUpperCase();
    correctOpt = correctOpt.replace("OPTION ", "").replace("OPTION", "").trim();

    // Skip invalid rows missing mandatory fields
    if (!qText || !optA || !optB || !correctOpt) continue;

    const questionId = crypto.randomUUID();
    questionIds.push(questionId);

    questionsToInsert.push({
      id: questionId,
      subject_id: subjectId,
      topic_name: finalGroupName, // All questions get assigned to this Test Group
      question_text: qText,
      explanation: explanation,
    });

    optionsToInsert.push({
      question_id: questionId,
      option_text: optA,
      is_correct: correctOpt === "A",
    });
    optionsToInsert.push({
      question_id: questionId,
      option_text: optB,
      is_correct: correctOpt === "B",
    });

    if (optC) {
      optionsToInsert.push({
        question_id: questionId,
        option_text: optC,
        is_correct: correctOpt === "C",
      });
    }
    if (optD) {
      optionsToInsert.push({
        question_id: questionId,
        option_text: optD,
        is_correct: correctOpt === "D",
      });
    }
  }

  if (questionsToInsert.length === 0) {
    return {
      error:
        "No valid questions found. Please check your Excel template headers.",
    };
  }

  // 1. Insert Questions
  const { error: qError } = await supabase
    .from("questions")
    .insert(questionsToInsert);

  if (qError) {
    return { error: `Failed to insert questions: ${qError.message}` };
  }

  // 2. Insert Options
  const { error: optError } = await supabase
    .from("question_options")
    .insert(optionsToInsert);

  // 3. Rollback (Delete questions if inserting options fails)
  if (optError) {
    await supabase.from("questions").delete().in("id", questionIds);
    return {
      error: `Upload cancelled to prevent corrupted data. Options error: ${optError.message}`,
    };
  }

  revalidatePath("/resources");
  return { success: true, count: questionsToInsert.length };
}
export async function deleteQuestion(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("questions").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/resources");
  revalidatePath("/admin/resources");
  return { success: true };
}
