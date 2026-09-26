"use client";

import { useState } from "react";
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
    <section className="py-16 px-4 sm:px-6 bg-white border-t border-slate-200">
      <div className="max-w-3xl mx-auto space-y-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#1e3a8a] text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-slate-200 rounded-xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100 transition text-left font-bold text-[#1e3a8a]"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#f59e0b] transition-transform ${openIdx === idx ? "rotate-180" : ""}`}
                />
              </button>
              {openIdx === idx && (
                <div className="p-5 bg-white text-slate-600 text-sm leading-relaxed border-t border-slate-100">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
