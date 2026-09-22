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

  function handleToggle(e: React.MouseEvent | React.KeyboardEvent) {
    // Stop the click/key event from triggering parent <Link> navigation
    e.preventDefault();
    e.stopPropagation();

    if (isPending) return;

    startTransition(async () => {
      const res = await toggleItemCompletion(subjectId, resourceId, videoId);
      if (res?.success) {
        setIsCompleted((prev) => !prev);
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      handleToggle(e);
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      aria-disabled={isPending}
      className={`px-3 py-2 font-bold rounded-lg transition text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer shrink-0 touch-manipulation select-none ${
        isPending ? "opacity-50 pointer-events-none" : ""
      } ${
        isCompleted
          ? "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 active:bg-emerald-200"
          : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 active:bg-slate-300"
      }`}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        <CheckCircle className="w-4 h-4 shrink-0" />
      )}
      <span className="hidden sm:inline">
        {isCompleted ? "Completed" : "Mark Completed"}
      </span>
    </div>
  );
}
