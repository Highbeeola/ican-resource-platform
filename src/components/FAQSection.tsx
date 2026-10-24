"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Is registration really free?",
    a: "Yes! Creating an account and browsing the course catalog is 100% free.",
  },
  {
    q: "Do you cover the ATSWA syllabus?",
    a: "Absolutely. We have dedicated pathways for both ICAN Professional and ATSWA (Parts I, II, and III).",
  },
  {
    q: "Can I take practice exams on my phone?",
    a: "Yes! Our platform and timed practice engine are fully optimized for mobile devices.",
  },
  {
    q: "Are the video lectures pre-recorded or live?",
    a: "We offer both! You can watch HD pre-recorded lectures anytime, and our faculty also schedule live Google Meet classes for interactive learning.",
  },
];

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="py-16 lg:py-20 px-4 sm:px-6 border-t border-line">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        {/* Left: heading */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-semibold text-ink">
            Frequently asked questions
          </h2>
          <p className="text-muted leading-relaxed">
            Can&apos;t find what you&apos;re looking for?{" "}
            <Link
              href="/contact"
              className="font-semibold text-ink underline underline-offset-4 decoration-accent hover:text-accent-dark transition-colors"
            >
              Get in touch
            </Link>
            .
          </p>
        </div>

        {/* Right: flat accordion */}
        <div className="lg:col-span-8 border-t border-ink/20">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="border-b border-line">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${idx}`}
                  className="w-full flex items-center justify-between gap-6 py-5 text-left cursor-pointer"
                >
                  <span className="font-serif text-lg sm:text-xl font-semibold text-ink">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 text-accent-dark transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div
                    id={`faq-panel-${idx}`}
                    className="pb-6 pr-10 text-muted leading-relaxed"
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
