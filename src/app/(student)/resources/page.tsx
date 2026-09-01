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
} from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    prog?: string;
    level?: string;
    type?: ResourceType;
    q?: string;
  }>;
}

export default async function ResourcesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const progSlug = params.prog || "ican"; // Default to 'ican' if not provided

  // 1. Fetch Levels filtered by Programme
  const levels = await getLevels(progSlug);
  const programmes = await getProgrammes();

  // 2. Fetch Subjects matching Level, Search Query AND Programme
  const subjects = await getSubjects(params.level, params.q, progSlug);

  // 3. Fetch PDF Resources matching Level, Type AND Search Query
  const { resources } = await getResources({
    levelSlug: params.level,
    resourceType: params.type,
    searchQuery: params.q,
  });

  const isSpecificTypeFilter = !!params.type;

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
            href={`/resources?prog=${progSlug}${params.type ? `&type=${params.type}` : ""}`}
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
              href={`/resources?prog=${progSlug}&level=${lvl.slug}${params.type ? `&type=${params.type}` : ""}${params.q ? `&q=${params.q}` : ""}`}
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
        ) : (
          /* DEFAULT COURSES CATALOG GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((sub: Subject) => (
              <div
                key={sub.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-amber-500 hover:shadow-md transition flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 text-xs font-semibold rounded-full uppercase">
                    {sub.level?.name || "ICAN"} Stage
                  </span>

                  <h3 className="text-xl font-bold text-[#1e3a8a] leading-snug">
                    {sub.name}
                  </h3>

                  {/* DYNAMIC RESOURCE & VIDEO BADGES */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-[#1e3a8a] border border-blue-100 rounded-md text-xs font-bold">
                      <FileText className="w-3.5 h-3.5" />
                      {sub.resources?.length || 0} PDFs
                    </span>

                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-md text-xs font-bold">
                      <Video className="w-3.5 h-3.5" />
                      {sub.videos?.length || 0} Videos
                    </span>

                    {(sub.resources?.length || 0) +
                      (sub.videos?.length || 0) ===
                      0 && (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-500 border border-slate-200 rounded-md text-xs font-medium">
                        Coming Soon
                      </span>
                    )}
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-3 text-xs border-t border-slate-100 text-slate-500">
                    {sub.instructor_name ? (
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <User className="w-3.5 h-3.5 text-amber-500" />
                        {sub.instructor_name}
                      </span>
                    ) : (
                      <span className="text-slate-500">KRL Academy</span>
                    )}

                    {sub.estimated_hours ? (
                      <span>{sub.estimated_hours} Hours</span>
                    ) : null}

                    {sub.avg_rating ? (
                      <span className="flex items-center gap-1 text-amber-500 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        {sub.avg_rating} / 5.0
                      </span>
                    ) : null}
                  </div>
                </div>

                <Link
                  href={`/resources/subject/${sub.id}`}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-center transition text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm"
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
