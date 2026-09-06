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
            {subjects.map((sub: Subject) => {
              const pdfCount = sub.resources?.length || 0;
              const videoCount = sub.videos?.length || 0;
              const totalContent = pdfCount + videoCount;

              return (
                <Link
                  href={`/resources/subject/${sub.id}`}
                  key={sub.id}
                  className="group flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300"
                >
                  {/* 1. VISUAL ANCHOR: Sleek top accent bar */}
                  <div className="h-2 w-full bg-[#1e3a8a] group-hover:bg-[#f59e0b] transition-colors"></div>

                  <div className="p-6 flex flex-col flex-1">
                    {/* Top Badges */}
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-blue-50 text-[#1e3a8a] text-[10px] font-bold uppercase tracking-wider rounded-md">
                        {sub.level?.name || "ICAN"} Stage
                      </span>
                      {sub.avg_rating ? (
                        <span className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          {sub.avg_rating}
                        </span>
                      ) : null}
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#1e3a8a] transition-colors leading-snug mb-2">
                      {sub.name}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1">
                      {sub.description ||
                        `Comprehensive preparation covering key concepts, past questions, and lecture notes for ${sub.name}.`}
                    </p>

                    {/* 2 & 3. CLEAN BADGE LOGIC: Hide zeros, show "Coming Soon" if empty */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {totalContent === 0 ? (
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-md text-xs font-medium border border-slate-200">
                          Coming Soon
                        </span>
                      ) : (
                        <>
                          {pdfCount > 0 && (
                            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md text-xs font-bold">
                              <FileText className="w-3.5 h-3.5" />
                              {pdfCount} PDFs
                            </span>
                          )}
                          {videoCount > 0 && (
                            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-md text-xs font-bold">
                              <Video className="w-3.5 h-3.5" />
                              {videoCount} Videos
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* 4. METADATA FOOTER & SUBTLE CTA */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span
                            className="truncate max-w-[120px]"
                            title={sub.instructor_name || "KRL Academy"}
                          >
                            {sub.instructor_name || "KRL Academy"}
                          </span>
                        </span>
                        {sub.estimated_hours ? (
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {sub.estimated_hours}h
                          </span>
                        ) : null}
                      </div>

                      {/* Subtle Hover CTA */}
                      <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-[#1e3a8a] text-slate-400 group-hover:text-white flex items-center justify-center transition-colors flex-shrink-0">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
