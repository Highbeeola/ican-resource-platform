import {
  Target,
  Eye,
  Lightbulb,
  Briefcase,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import BackButton from "@/components/navigation/BackButton";

const pillars = [
  {
    icon: Lightbulb,
    title: "Digital Innovation",
    text: "Leveraging adaptive technology and flexible digital access to make elite accounting education boundaryless.",
  },
  {
    icon: Briefcase,
    title: "Career Readiness",
    text: "Bridging the gap between theoretical professional exams and real-world execution through practical financial tools and insights.",
  },
  {
    icon: ShieldCheck,
    title: "Ethical Leadership",
    text: "Instilling the global standards of integrity required to lead in complex global business environments.",
  },
];

const values = [
  {
    title: "Integrity without compromise",
    text: "We uphold the highest ethical standards in everything we teach and do, as stewards of the future accounting profession. We embed transparency, accountability, and professional ethics into our curriculum, internal operations and student culture.",
  },
  {
    title: "Innovation in Learning",
    text: "We continuously leverage cutting-edge educational technology, data analytics, and digital tools to break down geographical barriers and deliver seamless, adaptive learning experiences fit for the modern digital economy.",
  },
  {
    title: "Excellence in Execution",
    text: "We go beyond theoretical knowledge. We insist on rigorous academic depth paired with real-world application, equipping our students not just to pass professional examinations, but to excel in high-impact finance roles on day one.",
  },
  {
    title: "Student-Centric Empowerment",
    text: "Our learners are the heart of KRL Academy. We foster an inclusive, supportive global community where flexible access, mentorship, and continuous growth empower every aspiring accountant to unlock their full potential.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-paper text-ink px-4 sm:px-6 py-8 md:py-12">
      <div className="max-w-5xl mx-auto space-y-16 md:space-y-20">
        <BackButton text="Back to Home" />

        {/* INTRO */}
        <header className="max-w-3xl space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-dark">
            About us
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold leading-[1.1]">
            About KRL Academy
          </h1>
          <p className="text-muted text-lg leading-relaxed">
            KRL Academy is a premier digital learning institution dedicated to
            empowering the next generation of professional accountants.
          </p>
          <p className="font-serif text-2xl italic text-ink">
            Where tech meets trust in accounting.
          </p>
        </header>

        {/* VISION & MISSION */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
          <div className="border-t-2 border-ink pt-6 space-y-4">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-accent-dark" />
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted font-sans">
                Our vision
              </h2>
            </div>
            <p className="font-serif text-xl sm:text-2xl leading-snug text-ink">
              To be the world&apos;s most trusted digital academy for aspiring
              accounting leaders, setting the global benchmark for modern,
              tech-enabled professional accounting education.
            </p>
          </div>

          <div className="border-t-2 border-ink pt-6 space-y-4">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-accent-dark" />
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted font-sans">
                Our mission
              </h2>
            </div>
            <p className="font-serif text-xl sm:text-2xl leading-snug text-ink">
              To empower future professional accountants worldwide by delivering
              world-class, tech-forward digital learning experiences that
              combine rigorous academic mastery, practical industry skills, and
              uncompromising ethical standards.
            </p>
          </div>
        </section>

        {/* PILLARS */}
        <section className="space-y-8">
          <h2 className="text-3xl sm:text-4xl font-semibold">
            Our strategic core pillars
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="bg-white border border-line rounded-lg p-6 space-y-3"
              >
                <p.icon className="w-6 h-6 text-accent-dark" />
                <h3 className="font-serif text-xl font-semibold text-ink">
                  {p.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* VALUES */}
        <section className="space-y-8">
          <h2 className="text-3xl sm:text-4xl font-semibold">
            Our organisational values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {values.map((v, i) => (
              <div
                key={v.title}
                className="border-t border-ink/20 pt-5 space-y-2"
              >
                <span className="font-serif text-3xl text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-serif text-xl font-semibold text-ink">
                  {v.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CLOSING CTA */}
        <section className="border-t border-line pt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <p className="font-serif text-2xl text-ink max-w-md">
            Ready to start your exam prep?
          </p>
          <Link
            href="/resources"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-ink hover:bg-ink/90 text-white font-semibold rounded-md transition w-fit"
          >
            Explore Courses
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
