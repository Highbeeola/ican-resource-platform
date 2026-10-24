import { getLevels, getSubjects, getResources } from "@/lib/services/resources";
import { Level, Subject, Resource, ResourceType } from "@/types";
import ProgrammeSwitcher from "@/components/navigation/ProgrammeSwitcher";
import { getProgrammes } from "@/lib/services/programmes";
import SearchBar from "@/components/resources/SearchBar";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  User,
  Star,
  ArrowRight,
  Video,
  Clock,
} from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    prog?: string;
    level?: string;
    type?: ResourceType;
    q?: string;
  }>;
}

/* ------------------------------------------------------------------ */
/* Small helpers for the course cards                                  */
/* ------------------------------------------------------------------ */

// Full class names (not built dynamically) so Tailwind keeps them.
const TILE_STYLES = [
  "from-blue-600 to-indigo-700",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-700",
  "from-rose-500 to-pink-700",
  "from-violet-500 to-purple-700",
  "from-sky-500 to-cyan-700",
];

// Same course name always gets the same colour
const tileFor = (key: string) => {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return TILE_STYLES[hash % TILE_STYLES.length];
};

// "Business Environment" -> "BE"
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("") || "K";

// Stage badge colour, like Cyfrin's difficulty badges
const stageStyle = (name?: string) => {
  const n = (name || "").toLowerCase();
  if (n.includes("found")) return "bg-emerald-50 text-emerald-700";
  if (n.includes("skill")) return "bg-blue-50 text-blue-700";
  if (n.includes("prof")) return "bg-violet-50 text-violet-700";
  return "bg-slate-100 text-slate-600";
};

const contentCount = (s: Subject) =>
  (s.resources?.length || 0) + (s.videos?.length || 0);

export default async function ResourcesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const progSlug = params.prog || "ican"; // Default to 'ican' if not provided
  const isSpecificTypeFilter = !!params.type;

  // Fetch everything at the same time instead of one after another.
  // Documents are only fetched when a type filter is active (they were
  // being fetched on every visit even though the catalog doesn't use them).
  const noResources = Promise.resolve({ resources: [] as Resource[] });
  const [levels, programmes, subjects, { resources }] = await Promise.all([
    getLevels(progSlug),
    getProgrammes(),
    getSubjects(params.level, params.q, progSlug),
    isSpecificTypeFilter
      ? getResources({
          levelSlug: params.level,
          resourceType: params.type,
          searchQuery: params.q,
        })
      : noResources,
  ]);

  // Courses with content first, "Coming Soon" ones after
  const orderedSubjects = [...subjects].sort(
    (a, b) => Number(contentCount(b) > 0) - Number(contentCount(a) > 0),
  );
  const availableCount = orderedSubjects.filter(
    (s) => contentCount(s) > 0,
  ).length;
  const comingSoonCount = orderedSubjects.length - availableCount;

  // Builds a link that keeps the current filters and encodes them safely
  // (a search like "tax & law" used to break the old template strings).
  const buildHref = (level?: string) => {
    const qs = new URLSearchParams();
    qs.set("prog", progSlug);
    if (level) qs.set("level", level);
    if (params.type) qs.set("type", params.type);
    if (params.q) qs.set("q", params.q);
    return `/resources?${qs.toString()}`;
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 p-4 sm:p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER & SEARCH BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 font-bold text-2xl sm:text-3xl text-[#1e3a8a]">
              <BookOpen className="w-7 h-7 text-amber-500" />
              <h1 className="tracking-tight">
                {params.type
                  ? params.type.replace("_", " ").toUpperCase() + "S"
                  : "All Courses & Subjects"}
              </h1>
            </div>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              {params.q
                ? `Showing search results for "${params.q}"`
                : "Browse structured courses, video lectures, study texts, and pathfinders across all stages."}
            </p>
          </div>

          {/* LIVE SEARCH BAR */}
          <SearchBar />
        </div>

        {/* PROGRAMME SWITCHER (ICAN vs ATSWA) */}
        <ProgrammeSwitcher programmes={programmes} />

        {/* LEVEL TABS */}
        <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-xl w-fit overflow-x-auto max-w-full">
          <Link
            href={buildHref()}
            className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap ${
              !params.level
                ? "bg-amber-500 text-white font-bold shadow-sm"
                : "text-slate-600 hover:text-[#1e3a8a]"
            }`}
          >
            All Stages
          </Link>
          {levels.map((lvl: Level) => (
            <Link
              key={lvl.id}
              href={buildHref(lvl.slug)}
              className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap ${
                params.level === lvl.slug
                  ? "bg-amber-500 text-white font-bold shadow-sm"
                  : "text-slate-600 hover:text-[#1e3a8a]"
              }`}
            >
              {lvl.name}
            </Link>
          ))}
        </div>

        {/* RESULTS SECTION */}
        {isSpecificTypeFilter ? (
          /* IF FILTERING BY SPECIFIC TYPE (e.g. ?type=pathfinder) */
          resources.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1e3a8a]">
                Nothing to see here yet!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                No {params.type?.replace("_", " ")}s have been published for
                this stage yet. Upload one via the Admin Portal!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((res: Resource) => (
                <div
                  key={res.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 hover:border-amber-500 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full uppercase border border-amber-200">
                        {res.resource_type.replace("_", " ")}
                      </span>
                      {res.exam_year && (
                        <span className="text-xs text-slate-500 font-medium">
                          {res.exam_diet} {res.exam_year}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-[#1e3a8a] leading-snug">
                      {res.title}
                    </h3>

                    <p className="text-xs text-slate-500">
                      {res.subject?.name} • {res.level?.name} Stage
                    </p>
                  </div>

                  {/* DOCUMENT STUDY LINK */}
                  <Link
                    href={`/resources/item/${res.id}?type=doc`}
                    className="w-full py-3 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold rounded-xl text-center transition text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>View & Study Document</span>
                  </Link>
                </div>
              ))}
            </div>
          )
        ) : orderedSubjects.length === 0 ? (
          /* NO COURSES MATCH (this state was missing before: the page was blank) */
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#1e3a8a]">
              No courses found
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
              {params.q
                ? `Nothing matches "${params.q}" here. Try another word or stage.`
                : "No courses have been added to this stage yet."}
            </p>
            <Link
              href={`/resources?prog=${encodeURIComponent(progSlug)}`}
              className="inline-block mt-2 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold rounded-lg transition"
            >
              Clear filters
            </Link>
          </div>
        ) : (
          /* DEFAULT COURSES CATALOG: compact cards, available courses first */
          <div className="space-y-4">
            <p className="text-xs text-slate-500 font-medium">
              {availableCount} available
              {comingSoonCount > 0 ? ` · ${comingSoonCount} coming soon` : ""}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orderedSubjects.map((sub: Subject) => {
                const pdfCount = sub.resources?.length || 0;
                const videoCount = sub.videos?.length || 0;
                const totalContent = pdfCount + videoCount;
                const comingSoon = totalContent === 0;
                const stageLabel = sub.level?.name
                  ? `${sub.level.name} Stage`
                  : `${progSlug.toUpperCase()}`;

                return (
                  <Link
                    href={`/resources/subject/${sub.id}`}
                    key={sub.id}
                    className={`group flex gap-4 p-4 bg-white border border-slate-200 rounded-2xl hover:shadow-lg hover:border-blue-200 transition-all duration-300 ${
                      comingSoon ? "opacity-80" : ""
                    }`}
                  >
                    {/* COURSE TILE (swap for a real cover image later) */}
                    <div
                      className={`w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl bg-gradient-to-br ${tileFor(
                        sub.name,
                      )} flex items-center justify-center text-white text-xl sm:text-2xl font-black tracking-tight ${
                        comingSoon ? "grayscale-[40%]" : ""
                      }`}
                      aria-hidden="true"
                    >
                      {initials(sub.name)}
                    </div>

                    <div className="flex flex-col flex-1 min-w-0">
                      {/* Instructor + stage badge */}
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="flex items-center gap-1 text-xs text-slate-500 min-w-0">
                          <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span
                            className="truncate"
                            title={sub.instructor_name || "KRL Academy"}
                          >
                            {sub.instructor_name || "KRL Academy"}
                          </span>
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md whitespace-nowrap ${stageStyle(
                            sub.level?.name,
                          )}`}
                        >
                          {stageLabel}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-[#1e3a8a] transition-colors leading-snug">
                        {sub.name}
                      </h3>

                      {/* Description: only shown when the course has a real one.
                          (The same fallback sentence on every card made them all look alike.) */}
                      {sub.description ? (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                          {sub.description}
                        </p>
                      ) : null}

                      {/* Meta row */}
                      <div className="mt-auto pt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                        {comingSoon ? (
                          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-md text-xs font-medium border border-slate-200">
                            Coming Soon
                          </span>
                        ) : (
                          <>
                            {pdfCount > 0 && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md text-xs font-bold">
                                <FileText className="w-3 h-3" />
                                {pdfCount} Docs
                              </span>
                            )}
                            {videoCount > 0 && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-md text-xs font-bold">
                                <Video className="w-3 h-3" />
                                {videoCount} Videos
                              </span>
                            )}
                          </>
                        )}

                        {sub.estimated_hours ? (
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {sub.estimated_hours}h
                          </span>
                        ) : null}

                        {sub.avg_rating ? (
                          <span className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            {sub.avg_rating}
                          </span>
                        ) : null}

                        <ArrowRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-[#1e3a8a] transition-colors" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
