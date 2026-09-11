"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Megaphone, X } from "lucide-react";

interface Props {
  announcement: {
    id: string;
    title: string;
    content: string;
  } | null;
}

export default function AnnouncementBanner({ announcement }: Props) {
  const [dismissed, setDismissed] = useState(true); // Default true to prevent flash

  useEffect(() => {
    if (announcement) {
      // Check if the browser remembers we dismissed this specific announcement
      const isDismissedLocally = localStorage.getItem(
        `dismissed_banner_${announcement.id}`,
      );
      if (!isDismissedLocally) {
        setDismissed(false);
      }
    }
  }, [announcement]);

  if (!announcement || dismissed) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault(); // Stop the Link from routing
    setDismissed(true);
    // Save to local storage so it stays hidden on refresh!
    localStorage.setItem(`dismissed_banner_${announcement.id}`, "true");
  };

  return (
    <div className="bg-blue-50 border-b border-blue-200 text-[#1e3a8a] py-2.5 px-4 text-xs sm:text-sm flex items-center justify-between gap-3 relative z-50">
      <Link
        href="/notifications"
        className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-center flex-1 hover:opacity-80 transition cursor-pointer"
      >
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-blue-700">
          <Megaphone className="w-4 h-4 flex-shrink-0" />
          <span>{announcement.title}:</span>
        </div>
        <span className="font-medium text-slate-700">
          {announcement.content}
        </span>
      </Link>

      <button
        onClick={handleDismiss}
        className="p-1 hover:bg-blue-200 text-blue-400 hover:text-blue-700 rounded-lg transition cursor-pointer"
        title="Dismiss Banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
