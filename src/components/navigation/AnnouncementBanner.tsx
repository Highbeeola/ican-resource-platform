"use client";

import { useState } from "react";
import { Megaphone, X } from "lucide-react";

interface Props {
  announcement: {
    title: string;
    content: string;
  } | null;
}

export default function AnnouncementBanner({ announcement }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (!announcement || dismissed) return null;

  return (
    <div className="bg-amber-500 text-slate-950 font-semibold py-2.5 px-4 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-md relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center flex-1">
        <Megaphone className="w-4 h-4 flex-shrink-0 animate-bounce" />
        <span>
          <strong className="font-bold uppercase tracking-wider">
            {announcement.title}:
          </strong>{" "}
          {announcement.content}
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 hover:bg-slate-950/10 rounded-lg transition cursor-pointer"
        title="Dismiss Banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
