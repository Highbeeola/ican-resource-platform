import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAdminAnalytics } from "@/lib/services/analytics";
import FAQSection from "@/components/FAQSection";
import {
  Video,
  FileCheck,
  FileText,
  BookOpen,
  TrendingUp,
  Award,
  MessageSquare,
  ArrowRight,
  GraduationCap,
} from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const stats = await getAdminAnalytics();

  // Hide low-count metrics until platform content reaches threshold
  const MIN_STAT = 10;
  const statItems = [
    { value: stats.totalSubjects, label: "Courses" },
    { value: stats.totalResources, label: "Study Materials" },
    { value: stats.totalVideos, label: "Video Lectures" },
    { value: stats.totalStudents, label: "Students Enrolled" },
  ].filter((s) => s.value >= MIN_STAT);

  // What students get: shown in the hero panel (facts, not numbers)
  const inside = [
    {
      icon: BookOpen,
      title: "Study texts",
      text: "Downloadable notes, summary sheets and revision guides.",
    },
    {
      icon: FileCheck,
      title: "Pathfinders",
      text: "Exam-focused guides for every stage.",
    },
    {
      icon: FileText,
      title: "Past questions",
      text: "Past papers organised by subject and stage.",
    },
    {
      icon: Video,
      title: "Video lectures",
      text: "Recorded class sessions to revise at your own pace.",
    },
  ];

  return (
    <div className="bg-paper text-ink min-h-screen">
      {/* HERO */}
      <section className="border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24 grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-dark">
              Professional exam preparation
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.08] text-ink">
              Master your professional journey with{" "}
              <span className="italic">KRL Academy</span>
            </h1>

            <p className="text-muted text-base sm:text-lg max-w-xl leading-relaxed">
              Study texts, pathfinders, past questions and video lectures for
              ICAN and ATSWA candidates, all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/resources"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-ink hover:bg-ink/90 text-white font-semibold rounded-md transition"
              >
                Explore Courses
                <ArrowRight className="w-4 h-4" />
              </Link>

              {user ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-7 py-3.5 border border-ink/25 hover:border-ink text-ink font-semibold rounded-md transition"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-7 py-3.5 border border-ink/25 hover:border-ink text-ink font-semibold rounded-md transition"
                >
                  Register Free
                </Link>
              )}
            </div>
          </div>

          {/* WHAT'S INSIDE PANEL */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-line rounded-lg">
              <p className="px-6 pt-5 pb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                What&apos;s inside
              </p>
              <ul className="divide-y divide-line">
                {inside.map((item) => (
                  <li key={item.title} className="flex gap-4 px-6 py-4">
                    <item.icon className="w-5 h-5 mt-0.5 text-accent-dark flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-ink">{item.title}</p>
                      <p className="text-sm text-muted leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMME SELECTION */}
      <section className="py-16 lg:py-20 px-4 sm:px-6 bg-paper-2 border-b border-line">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl sm:text-4xl font-semibold text-ink">
              Choose your professional body
            </h2>
            <p className="text-muted leading-relaxed">
              Pick your programme to jump straight into study materials for your
              stage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ICAN */}
            <Link
              href="/resources?prog=ican"
              className="group flex flex-col justify-between bg-white border border-line rounded-lg p-7 hover:border-ink transition"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <GraduationCap className="w-6 h-6 text-ink" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Professional track
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-semibold text-ink pt-2">
                  ICAN Programme
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  Access comprehensive study texts, video lectures, pathfinders,
                  and past questions for Foundation, Skills, and Professional
                  stages.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 mt-8 text-sm font-semibold text-ink group-hover:text-accent-dark transition-colors">
                Explore ICAN courses
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            {/* ATSWA */}
            <Link
              href="/resources?prog=atswa"
              className="group flex flex-col justify-between bg-white border border-line rounded-lg p-7 hover:border-ink transition"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <Award className="w-6 h-6 text-ink" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Technician track
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-semibold text-ink pt-2">
                  ATSWA Programme
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  Browse structured study materials and exam pathfinders for
                  Accounting Technicians Scheme West Africa across Parts I, II
                  &amp; III.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 mt-8 text-sm font-semibold text-ink group-hover:text-accent-dark transition-colors">
                Explore ATSWA courses
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            {/* COMING SOON: signals the planned expansion */}
            <div className="flex flex-col justify-center border border-dashed border-ink/25 rounded-lg p-7 space-y-3 text-center">
              <p className="font-serif text-xl font-semibold text-ink">
                More professional bodies
              </p>
              <p className="text-sm text-muted leading-relaxed">
                We&apos;re adding more programmes soon. Register to be among the
                first to know.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP (only appears once the platform has enough content) */}
      {statItems.length >= 2 && (
        <section className="border-b border-line py-12 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-x-16 gap-y-8 text-center">
            {statItems.map((s) => (
              <div key={s.label} className="w-[45%] md:w-auto space-y-1">
                <p className="font-serif text-4xl sm:text-5xl font-semibold text-ink">
                  {s.value}+
                </p>
                <p className="text-xs font-semibold text-muted uppercase tracking-[0.15em]">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section className="py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl sm:text-4xl font-semibold text-ink">
              How KRL Academy works
            </h2>
            <p className="text-muted leading-relaxed">
              Your journey to becoming a Chartered Accountant, simplified into
              three steps.
            </p>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <li className="border-t-2 border-ink pt-5 space-y-3">
              <span className="font-serif text-4xl text-accent">01</span>
              <h3 className="text-lg font-semibold text-ink">
                Register for free
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Create your student account in seconds to unlock your
                personalized learning dashboard.
              </p>
            </li>
            <li className="border-t-2 border-ink pt-5 space-y-3">
              <span className="font-serif text-4xl text-accent">02</span>
              <h3 className="text-lg font-semibold text-ink">
                Choose your stage
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Select your current ICAN or ATSWA level to automatically
                generate your exact exam syllabus.
              </p>
            </li>
            <li className="border-t-2 border-ink pt-5 space-y-3">
              <span className="font-serif text-4xl text-accent">03</span>
              <h3 className="text-lg font-semibold text-ink">
                Study &amp; practice
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Watch videos, read lecture notes, and take auto-graded mock
                exams to track your performance.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* WHY CHOOSE KRL ACADEMY */}
      <section className="py-16 lg:py-20 px-4 sm:px-6 bg-paper-2 border-y border-line">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl sm:text-4xl font-semibold text-ink">
              Why choose KRL Academy
            </h2>
            <p className="text-muted leading-relaxed">
              Everything you need to excel in your professional examinations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">
            {[
              {
                icon: Video,
                title: "Recorded class sessions",
                text: "Watch video lectures by experienced faculty anytime, anywhere. Learn and revise at your own pace.",
              },
              {
                icon: FileCheck,
                title: "Exam pattern mock tests",
                text: "Practice questions, pathfinders, and mock exams designed on the latest exam patterns with detailed solutions.",
              },
              {
                icon: BookOpen,
                title: "Comprehensive notes",
                text: "Download PDF notes, study texts, summary sheets, revision guides, and past year papers for every subject.",
              },
              {
                icon: TrendingUp,
                title: "Track your growth",
                text: "Organize your study path across various stages as you prepare for your upcoming exam diets.",
              },
              {
                icon: Award,
                title: "Learn from the best",
                text: "Our materials and resources are compiled by qualified professionals with years of teaching experience.",
              },
              {
                icon: MessageSquare,
                title: "Centralized resource hub",
                text: "Find solutions to past questions quickly without hopping across fragmented web pages or PDF folders.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="border-t border-ink/20 pt-5 space-y-3"
              >
                <f.icon className="w-5 h-5 text-accent-dark" />
                <h3 className="font-serif text-xl font-semibold text-ink">
                  {f.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BECOME A TUTOR CTA (Logged out only) */}
      {!user && (
        <section className="py-16 lg:py-20 px-4 sm:px-6 bg-ink text-center border-b-4 border-accent">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white">
              Are you an ICAN expert?
            </h2>
            <p className="text-white/75 text-lg leading-relaxed">
              Join our roster of elite Chartered Accountants. Teach thousands of
              students online, set your own schedule, and monetize your
              expertise.
            </p>
            <Link
              href="/careers"
              className="inline-flex items-center gap-2 mt-2 px-8 py-3.5 bg-accent hover:bg-accent-hover text-ink font-semibold rounded-md transition"
            >
              Apply to become a tutor
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* CLOSING CTA BAND */}
      {!user && (
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <h2 className="text-2xl sm:text-3xl font-semibold text-ink">
              Ready to start your exam prep?
            </h2>
            <p className="text-muted">
              Create a free account to unlock full course access, video
              lectures, and practice tests.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-ink hover:bg-ink/90 text-white font-semibold rounded-md transition"
            >
              Register Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* FAQ SECTION */}
      <FAQSection />
    </div>
  );
}
