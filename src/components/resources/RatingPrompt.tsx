"use client";

import { useState, useTransition } from "react";
import { submitCourseRating } from "@/lib/actions/progress";
import { Star, CheckCircle, Loader2 } from "lucide-react";

interface Props {
  subjectId: string;
}

export default function RatingPrompt({ subjectId }: Props) {
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState<boolean>(false);

  function handleRate(stars: number) {
    setRating(stars);
    startTransition(async () => {
      const res = await submitCourseRating(subjectId, stars);
      if (res.success) {
        setSubmitted(true);
      }
    });
  }

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-800 text-xs sm:text-sm font-semibold">
        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <span>
          Thank you for rating this course! Your feedback helps other ICAN
          students.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
      <div>
        <h4 className="font-bold text-slate-900 text-sm">
          How would you rate this course?
        </h4>
        <p className="text-xs text-slate-500 mt-0.5">
          Click a star to submit your rating.
        </p>
      </div>

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            disabled={isPending}
            className="p-1 focus:outline-none transition cursor-pointer disabled:opacity-50"
          >
            <Star
              className={`w-6 h-6 ${
                star <= (hover || rating)
                  ? "text-amber-400 fill-amber-400"
                  : "text-slate-300"
              }`}
            />
          </button>
        ))}

        {isPending && (
          <Loader2 className="w-4 h-4 animate-spin text-slate-400 ml-2" />
        )}
      </div>
    </div>
  );
}
