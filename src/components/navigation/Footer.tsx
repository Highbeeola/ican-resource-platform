"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // ONLY RENDER FOOTER ON THE HOMEPAGE
  if (pathname !== "/") {
    return null;
  }

  return (
    <footer className="bg-white border-t border-slate-200 mt-16 py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* COPYRIGHT */}
        <p className="text-slate-400 text-xs text-center sm:text-left font-medium">
          © {new Date().getFullYear()} KRL Academy. All rights reserved.
        </p>

        {/* SOCIALS & FACULTY ACCESS */}
        <div className="flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-3 text-slate-400">
            {/* Facebook */}
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-amber-50 hover:border-amber-400 hover:text-amber-600 transition-all"
              aria-label="Facebook"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>

            {/* X / Twitter */}
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-amber-50 hover:border-amber-400 hover:text-amber-600 transition-all"
              aria-label="X (Twitter)"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-amber-50 hover:border-amber-400 hover:text-amber-600 transition-all"
              aria-label="Instagram"
            >
              <svg
                className="w-3.5 h-3.5 fill-none stroke-current stroke-2 rounded-md"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-amber-50 hover:border-amber-400 hover:text-amber-600 transition-all"
              aria-label="LinkedIn"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>

          <div className="w-px h-5 bg-slate-200 hidden sm:block"></div>

          {/* FACULTY PORTAL */}
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 text-slate-700 hover:text-amber-700 transition-all font-semibold text-xs shadow-xs"
          >
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>Faculty Access</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
