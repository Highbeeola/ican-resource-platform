"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ text = "Back" }: { text?: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 hover:text-[#1e3a8a] transition cursor-pointer bg-white px-3.5 py-2 rounded-lg border border-slate-200 shadow-sm w-fit"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>{text}</span>
    </button>
  );
}
