"use client";

import { useState, useTransition } from "react";
import { toggleFavorite } from "@/lib/actions/favorites";
import { Bookmark, Loader2 } from "lucide-react";

interface Props {
  resourceId?: string;
  videoId?: string;
  initialIsBookmarked?: boolean;
}

export default function BookmarkButton({
  resourceId,
  videoId,
  initialIsBookmarked = false,
}: Props) {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isPending, startTransition] = useTransition();

  function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      const res = await toggleFavorite(resourceId, videoId);
      if (res.isBookmarked !== undefined) {
        setIsBookmarked(res.isBookmarked);
      }
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-center ${
        isBookmarked
          ? "bg-amber-50 text-amber-600 border-amber-300"
          : "bg-white text-slate-500 border-slate-200 hover:text-slate-900 hover:bg-slate-50 shadow-sm"
      }`}
      title={isBookmarked ? "Remove Bookmark" : "Save to Favorites"}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
      ) : (
        <Bookmark
          className={`w-4 h-4 ${isBookmarked ? "fill-amber-500 text-amber-500" : ""}`}
        />
      )}
    </button>
  );
}