"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { GraduationCap, ShieldCheck } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // ONLY RENDER FOOTER ON THE HOMEPAGE
  if (pathname !== "/") {
    return null;
  }

  return (
    <footer className="bg-slate-950/80 backdrop-blur-md border-t border-slate-800/80 py-10 px-4 sm:px-6 text-xs text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* BRAND & TAGLINE */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <p className="text-white font-bold text-sm tracking-tight">
              KRL Academy
            </p>
            <p className="text-slate-500 text-[11px]">
              Empowering Future Chartered Accountants
            </p>
          </div>
        </div>

        {/* NAVIGATION LINKS & ACCESS */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-3 sm:gap-6 text-slate-400 text-center w-full max-w-sm sm:max-w-none">
          <Link
            href="/resources"
            className="hover:text-amber-400 transition-colors"
          >
            Study Materials
          </Link>
          <Link
            href="/resources?level=foundation"
            className="hover:text-amber-400 transition-colors"
          >
            Foundation Stage
          </Link>
          <Link
            href="/resources?level=skills"
            className="hover:text-amber-400 transition-colors"
          >
            Skills Stage
          </Link>
          <Link
            href="/resources?level=professional"
            className="hover:text-amber-400 transition-colors"
          >
            Professional Stage
          </Link>
        </div>

        {/* FACULTY PORTAL */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-400 hover:text-amber-400 transition-all font-medium text-[11px] shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Faculty Access</span>
          </Link>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-900/80 text-center sm:text-left text-slate-600 text-[11px]">
        © {new Date().getFullYear()} KRL Academy. All rights reserved.
      </div>
    </footer>
  );
}
