"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Programme } from "@/lib/services/programmes";
import { GraduationCap, Award } from "lucide-react";

interface Props {
  programmes: Programme[];
}

export default function ProgrammeSwitcher({ programmes }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentProg = searchParams.get("prog") || "ican";

  function handleSwitch(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("prog", slug);
    params.delete("level"); // Reset level when changing programme
    router.push(`/resources?${params.toString()}`);
  }

  return (
    <div className="flex bg-slate-100 border border-slate-200 p-1.5 rounded-2xl w-full sm:w-fit shadow-inner">
      {programmes.map((prog) => {
        const isActive = currentProg === prog.slug;
        return (
          <button
            key={prog.id}
            onClick={() => handleSwitch(prog.slug)}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap flex-1 sm:flex-initial cursor-pointer ${
              isActive
                ? "bg-amber-500 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            {prog.slug === "ican" ? (
              <GraduationCap className="w-4 h-4" />
            ) : (
              <Award className="w-4 h-4" />
            )}
            <span>{prog.name}</span>
          </button>
        );
      })}
    </div>
  );
}
