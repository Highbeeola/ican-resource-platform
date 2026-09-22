"use client";

import { useState } from "react";
import { Megaphone, X } from "lucide-react";

export default function DashboardBanner({
  announcement,
}: {
  announcement: any;
}) {
  const [dismissed, setDismissed] = useState(false);

  if (!announcement || dismissed) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex justify-between items-start gap-3 shadow-sm transition-all">
      <div className="flex gap-3">
        <Megaphone className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-amber-900">
            {announcement.title}
          </h4>
          <p className="text-xs text-amber-700 mt-0.5">
            {announcement.content}
          </p>
        </div>
      </div>

      {/* THE CLOSE BUTTON */}
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-500 hover:text-amber-800 transition p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
