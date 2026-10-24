"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

// Put the client's REAL social links here. An icon only appears when its
// link is filled in, so you never ship dead "#" buttons.
const SOCIAL = {
  facebook: "",
  x: "",
  instagram: "",
  linkedin: "",
};

const socialClass =
  "w-10 h-10 sm:w-8 sm:h-8 rounded-full border border-line bg-white flex items-center justify-center text-muted hover:border-ink hover:text-ink transition-colors";

export default function Footer() {
  const pathname = usePathname();

  // Homepage-only by design — the fuller footer reads as heavy/odd on
  // inner app pages (dashboard, resources, etc.), so it's intentionally
  // scoped to "/" rather than rendered site-wide.
  if (pathname !== "/") {
    return null;
  }

  const hasSocial = Object.values(SOCIAL).some(Boolean);

  return (
    <footer className="bg-paper-2 border-t border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
        {/* BRAND + SOCIALS */}
        <div className="space-y-4 col-span-2 lg:col-span-2">
          <BrandLogo />
          <p className="text-muted text-sm leading-relaxed max-w-xs">
            Comprehensive preparation for ICAN & ATSWA professional exams —
            study texts, video lectures, pathfinders, and revision guides in one
            place.
          </p>

          {hasSocial && (
            <div className="flex items-center gap-3 pt-2">
              {SOCIAL.facebook && (
                <a
                  href={SOCIAL.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={socialClass}
                  aria-label="Facebook"
                >
                  <svg
                    className="w-4 h-4 sm:w-3.5 sm:h-3.5 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              )}

              {SOCIAL.x && (
                <a
                  href={SOCIAL.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={socialClass}
                  aria-label="X (Twitter)"
                >
                  <svg
                    className="w-4 h-4 sm:w-3.5 sm:h-3.5 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}

              {SOCIAL.instagram && (
                <a
                  href={SOCIAL.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={socialClass}
                  aria-label="Instagram"
                >
                  <svg
                    className="w-4 h-4 sm:w-3.5 sm:h-3.5 fill-none stroke-current stroke-2 rounded-md"
                    viewBox="0 0 24 24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="2"
                      y="2"
                      width="20"
                      height="20"
                      rx="5"
                      ry="5"
                    ></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
              )}

              {SOCIAL.linkedin && (
                <a
                  href={SOCIAL.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={socialClass}
                  aria-label="LinkedIn"
                >
                  <svg
                    className="w-4 h-4 sm:w-3.5 sm:h-3.5 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>

        {/* QUICK LINKS */}
        <div className="space-y-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            Quick Links
          </h3>
          <nav className="flex flex-col gap-2.5 text-sm text-ink/80">
            <Link
              href="/"
              className="hover:text-accent-dark transition-colors w-fit"
            >
              Home
            </Link>
            <Link
              href="/resources"
              className="hover:text-accent-dark transition-colors w-fit"
            >
              Courses
            </Link>
            <Link
              href="/about"
              className="hover:text-accent-dark transition-colors w-fit"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="hover:text-accent-dark transition-colors w-fit"
            >
              Contact
            </Link>
            <Link
              href="/careers"
              className="hover:text-accent-dark transition-colors w-fit"
            >
              Become a Tutor
            </Link>
          </nav>
        </div>

        {/* PROGRAMMES */}
        <div className="space-y-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            Programmes
          </h3>
          <nav className="flex flex-col gap-2.5 text-sm text-ink/80">
            <Link
              href="/resources?prog=ican"
              className="hover:text-accent-dark transition-colors w-fit"
            >
              ICAN Programme
            </Link>
            <Link
              href="/resources?prog=atswa"
              className="hover:text-accent-dark transition-colors w-fit"
            >
              ATSWA Programme
            </Link>
            <Link
              href="/resources?type=pathfinder"
              className="hover:text-accent-dark transition-colors w-fit"
            >
              Pathfinders
            </Link>
            <Link
              href="/resources?type=past_question"
              className="hover:text-accent-dark transition-colors w-fit"
            >
              Past Questions
            </Link>
          </nav>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-muted text-xs text-center sm:text-left">
            © {new Date().getFullYear()} KRL Academy. All rights reserved.
          </p>

          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-ink transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Faculty Access</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
