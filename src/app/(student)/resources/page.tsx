import { getLevels, getSubjects, getResources } from "@/lib/services/resources";
import { Level, Subject, Resource, ResourceType } from "@/types";
import SearchBar from "@/components/resources/SearchBar";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  Download,
  User,
  Clock,
  Star,
  ArrowRight,
} from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    level?: string;
    type?: ResourceType;
    q?: string;
  }>;
}

export default async function ResourcesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const levels = await getLevels();

  // 1. Fetch Subjects matching Level AND Search Query
  const subjects = await getSubjects(params.level, params.q);

  // 2. Fetch PDF Resources matching Level, Type AND Search Query
  const { resources } = await getResources({
    levelSlug: params.level,
    resourceType: params.type,
    searchQuery: params.q,
  });

  const isSpecificTypeFilter = !!params.type;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER & SEARCH BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-2xl sm:text-3xl">
              <BookOpen className="w-7 h-7" />
              <h1 className="tracking-tight text-white">
                {params.type
                  ? params.type.replace("_", " ").toUpperCase() + "S"
                  : "All Courses & Subjects"}
              </h1>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              {params.q
                ? `Showing search results for "${params.q}"`
                : "Browse structured courses, video lectures, study texts, and pathfinders across all ICAN stages."}
            </p>
          </div>

          {/* LIVE SEARCH BAR */}
          <SearchBar />
        </div>

        {/* LEVEL TABS */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl w-fit overflow-x-auto max-w-full">
          <Link
            href={params.type ? `/resources?type=${params.type}` : "/resources"}
            className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap ${
              !params.level
                ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Stages
          </Link>
          {levels.map((lvl: Level) => (
            <Link
              key={lvl.id}
              href={`/resources?level=${lvl.slug}${params.type ? `&type=${params.type}` : ""}${params.q ? `&q=${params.q}` : ""}`}
              className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap ${
                params.level === lvl.slug
                  ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
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
            <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-800 text-amber-400 rounded-xl flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Nothing to see here yet!
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
                No {params.type?.replace("_", " ")}s have been published for
                this stage yet. Upload one via the Admin Portal!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((res: Resource) => (
                <div
                  key={res.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-amber-500/50 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full uppercase">
                        {res.resource_type.replace("_", " ")}
                      </span>
                      {res.exam_year && (
                        <span className="text-xs text-slate-400 font-medium">
                          {res.exam_diet} {res.exam_year}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white leading-snug">
                      {res.title}
                    </h3>

                    <p className="text-xs text-slate-400">
                      {res.subject?.name} • {res.level?.name} Stage
                    </p>
                  </div>

                  <a
                    href={res.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-center transition text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </a>
                </div>
              ))}
            </div>
          )
        ) : (
          /* DEFAULT COURSES CATALOG GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((sub: Subject) => (
              <div
                key={sub.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm hover:border-amber-500/50 transition flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full uppercase">
                    {sub.level?.name || "ICAN"} Stage
                  </span>

                  <h3 className="text-xl font-bold text-white leading-snug">
                    {sub.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 line-clamp-3 leading-relaxed">
                    {sub.description ||
                      `Comprehensive ICAN preparation covering key concepts, past questions, pathfinders, and lecture notes for ${sub.name}.`}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3 text-xs border-t border-slate-800 text-slate-400">
                    {sub.instructor_name ? (
                      <span className="flex items-center gap-1 font-medium text-slate-300">
                        <User className="w-3.5 h-3.5 text-amber-400" />
                        {sub.instructor_name}
                      </span>
                    ) : (
                      <span className="text-slate-400">CA Prep Academy</span>
                    )}

                    {sub.estimated_hours ? (
                      <span>{sub.estimated_hours} Hours</span>
                    ) : null}

                    {sub.avg_rating ? (
                      <span className="flex items-center gap-1 text-amber-400 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {sub.avg_rating} / 5.0
                      </span>
                    ) : null}
                  </div>
                </div>

                <Link
                  href={`/resources/subject/${sub.id}`}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-center transition text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>View Course & Materials</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
