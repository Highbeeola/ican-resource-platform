"use client";

import { useState, useEffect, useTransition } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { submitQuizAttempt } from "@/lib/actions/quiz";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Award,
  RefreshCw,
  Loader2,
  Lightbulb,
} from "lucide-react";

export default function PracticeQuizPage() {
  const { subjectId } = useParams();
  const [questions, setQuestions] = useState<any[]>([]);
  const [subject, setSubject] = useState<any>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();

    // Fetch Subject
    supabase
      .from("subjects")
      .select("*")
      .eq("id", subjectId)
      .single()
      .then(({ data }) => setSubject(data));

    // Fetch Practice Questions with Options
    supabase
      .from("questions")
      .select("*, question_options(*)")
      .eq("subject_id", subjectId)
      .limit(10)
      .then(({ data }) => setQuestions(data || []));
  }, [subjectId]);

  function handleOptionSelect(questionId: string, optionId: string) {
    if (result) return; // Disable changing answers after submission
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  function handleSubmitQuiz() {
    startTransition(async () => {
      const res = await submitQuizAttempt(
        subjectId as string,
        questions.length,
        userAnswers,
      );
      if (res.success) {
        setResult(res);
      }
    });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href={`/resources/subject/${subjectId}`}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {subject?.name || "Subject"}</span>
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {subject?.name} Practice Test
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Answer practice questions and receive automatic scoring with
            solution explanations.
          </p>
        </div>

        {/* RESULTS BANNER */}
        {result && (
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 text-center space-y-3 shadow-xl">
            <Award className="w-12 h-12 text-amber-400 mx-auto" />
            <h2 className="text-2xl font-extrabold text-white">
              Quiz Completed!
            </h2>
            <p className="text-amber-400 font-bold text-3xl">
              {result.scorePercentage}% Score
            </p>
            <p className="text-slate-400 text-xs sm:text-sm">
              You answered {result.correctCount} out of {result.totalQuestions}{" "}
              questions correctly.
            </p>
          </div>
        )}

        {/* QUESTIONS LIST */}
        <div className="space-y-6">
          {questions.map((q, qIdx) => (
            <div
              key={q.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
            >
              <div className="flex justify-between items-start gap-4">
                <span className="text-xs font-bold uppercase text-amber-400 px-2.5 py-1 bg-amber-500/10 rounded-full">
                  Question {qIdx + 1}
                </span>
                {q.topic_name && (
                  <span className="text-xs text-slate-500">{q.topic_name}</span>
                )}
              </div>

              <h3 className="font-semibold text-white text-sm sm:text-base leading-snug">
                {q.question_text}
              </h3>

              {/* OPTIONS */}
              <div className="space-y-2 pt-2">
                {q.question_options?.map((opt: any) => {
                  const isSelected = userAnswers[q.id] === opt.id;
                  const isCorrect = opt.is_correct;

                  let optionStyle =
                    "bg-slate-800/80 border-slate-700 text-slate-300 hover:border-amber-500/40";
                  if (isSelected)
                    optionStyle =
                      "bg-amber-500/20 border-amber-500 text-amber-400 font-bold";
                  if (result && isCorrect)
                    optionStyle =
                      "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold";

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleOptionSelect(q.id, opt.id)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition flex items-center justify-between cursor-pointer ${optionStyle}`}
                    >
                      <span>{opt.option_text}</span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* EXPLANATION WHEN SUBMITTED */}
              {result && q.explanation && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-1">
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5" /> Solution Explanation:
                  </span>
                  <p>{q.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* SUBMIT BUTTON */}
        {!result && questions.length > 0 && (
          <button
            onClick={handleSubmitQuiz}
            disabled={isPending || Object.keys(userAnswers).length === 0}
            className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>Submit Practice Test</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
