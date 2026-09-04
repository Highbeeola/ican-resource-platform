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
  Loader2,
  Lightbulb,
  HelpCircle,
} from "lucide-react";

export default function PracticeQuizPage() {
  const { subjectId } = useParams();
  const [questions, setQuestions] = useState<any[]>([]);
  const [subject, setSubject] = useState<any>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      .limit(20)
      .then(({ data, error }) => {
        if (error) console.error("Error fetching questions:", error);
        setQuestions(data || []);
        setIsLoading(false);
      });
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
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* BACK BUTTON */}
        <Link
          href={`/resources/subject/${subjectId}`}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 hover:text-[#1e3a8a] transition bg-white px-3.5 py-2 rounded-lg border border-slate-200 shadow-sm w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {subject?.name || "Course"}</span>
        </Link>

        {/* HEADER */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e3a8a]">
            {subject?.name || "Subject"} Practice Test
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Answer practice questions and receive automatic scoring with
            solution explanations.
          </p>
        </div>

        {/* RESULTS BANNER */}
        {/* RESULTS BANNER (Dynamic Colors) */}
        {result && (
          <div
            className={`border-2 rounded-2xl p-6 sm:p-8 text-center space-y-3 shadow-sm transition-colors ${
              result.scorePercentage >= 70
                ? "bg-emerald-50 border-emerald-500 text-emerald-900"
                : result.scorePercentage >= 50
                  ? "bg-amber-50 border-amber-500 text-amber-900"
                  : "bg-rose-50 border-rose-500 text-rose-900"
            }`}
          >
            <Award
              className={`w-16 h-16 mx-auto ${
                result.scorePercentage >= 70
                  ? "text-emerald-500"
                  : result.scorePercentage >= 50
                    ? "text-amber-500"
                    : "text-rose-500"
              }`}
            />
            <h2 className="text-2xl font-extrabold">Quiz Completed!</h2>
            <p
              className={`font-black text-5xl ${
                result.scorePercentage >= 70
                  ? "text-emerald-600"
                  : result.scorePercentage >= 50
                    ? "text-amber-600"
                    : "text-rose-600"
              }`}
            >
              {result.scorePercentage}%
            </p>
            <p className="text-sm font-medium opacity-80">
              You answered {result.correctCount} out of {result.totalQuestions}{" "}
              questions correctly.
            </p>
          </div>
        )}
        {/* LOADING STATE */}
        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center space-y-3 shadow-sm">
            <Loader2 className="w-8 h-8 text-[#f59e0b] animate-spin" />
            <p className="text-slate-500 font-medium">
              Loading practice questions...
            </p>
          </div>
        ) : questions.length === 0 ? (
          /* EMPTY STATE */
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 text-[#1e3a8a] rounded-xl flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              No questions available yet!
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              The faculty has not added any practice questions to this subject's
              question bank. Please check back later.
            </p>
          </div>
        ) : (
          /* QUESTIONS LIST */
          <div className="space-y-6">
            {questions.map((q, qIdx) => (
              <div
                key={q.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4"
              >
                <div className="flex justify-between items-start gap-4 border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold uppercase text-[#1e3a8a] px-3 py-1 bg-blue-50 rounded-md">
                    Question {qIdx + 1}
                  </span>
                  {q.topic_name && (
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {q.topic_name}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                  {q.question_text}
                </h3>

                {/* OPTIONS */}
                <div className="space-y-2 pt-2">
                  {q.question_options?.map((opt: any) => {
                    const isSelected = userAnswers[q.id] === opt.id;
                    const isCorrect = opt.is_correct;

                    // STYLING LOGIC FOR LIGHT THEME
                    let optionStyle =
                      "bg-slate-50 border-slate-200 text-slate-700 hover:border-[#1e3a8a] hover:bg-blue-50";

                    if (isSelected) {
                      optionStyle =
                        "bg-blue-50 border-[#1e3a8a] text-[#1e3a8a] font-bold shadow-sm";
                    }

                    // REVEAL ANSWERS AFTER SUBMISSION
                    if (result) {
                      if (isCorrect) {
                        optionStyle =
                          "bg-emerald-50 border-emerald-500 text-emerald-700 font-bold";
                      } else if (isSelected && !isCorrect) {
                        optionStyle =
                          "bg-rose-50 border-rose-500 text-rose-700 font-bold";
                      } else {
                        optionStyle =
                          "bg-slate-50 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed";
                      }
                    }

                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleOptionSelect(q.id, opt.id)}
                        disabled={!!result} // Disable clicks after submission
                        className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition flex items-center justify-between ${!result ? "cursor-pointer" : ""} ${optionStyle}`}
                      >
                        <span>{opt.option_text}</span>
                        {isSelected && !result && (
                          <CheckCircle2 className="w-5 h-5 text-[#1e3a8a] flex-shrink-0" />
                        )}
                        {result && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* EXPLANATION WHEN SUBMITTED */}
                {result && q.explanation && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs sm:text-sm text-slate-700 space-y-1">
                    <span className="font-bold text-amber-600 flex items-center gap-1.5 mb-1">
                      <Lightbulb className="w-4 h-4" /> Solution Explanation:
                    </span>
                    <p className="leading-relaxed font-medium">
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* SUBMIT BUTTON */}
        {!result && questions.length > 0 && (
          <button
            onClick={handleSubmitQuiz}
            disabled={isPending || Object.keys(userAnswers).length === 0}
            className="w-full py-4 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
