"use client";

import { useState, useTransition } from "react";
import { toggleItemCompletion } from "@/lib/actions/progress";
import { CheckCircle, Loader2 } from "lucide-react";

interface Props {
  subjectId: string;
  resourceId?: string;
  videoId?: string;
  initialIsCompleted?: boolean;
}

export default function MarkCompletedButton({
  subjectId,
  resourceId,
  videoId,
  initialIsCompleted = false,
}: Props) {
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      const res = await toggleItemCompletion(subjectId, resourceId, videoId);
      if (res.success) {
        setIsCompleted(!isCompleted);
      }
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`w-full py-3.5 font-bold rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 ${
        isCompleted
          ? "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"
          : "bg-[#f59e0b] hover:bg-[#d97706] text-white"
      }`}
    >
      {isPending ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <CheckCircle className="w-5 h-5" />
      )}
      <span>{isCompleted ? "Completed" : "Mark as Completed"}</span>
    </button>
  );
}
