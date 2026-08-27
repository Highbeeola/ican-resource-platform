"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  FileText,
  LogOut,
  Shield,
  Menu,
  X,
  Home,
  LayoutDashboard,
  BookOpen,
  LineChart,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const supabase = createClient();

    async function checkUser(sessionUser: any) {
      setUser(sessionUser);
      if (sessionUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", sessionUser.id)
          .single();
        setIsAdmin(profile?.role === "admin");
      } else {
        setIsAdmin(false);
      }
    }

    supabase.auth.getUser().then(({ data }) => checkUser(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      checkUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close mobile menu automatically on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/admin/login"
  ) {
    return null;
  }

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/";
  };

  // Helper to check dynamic route activity
  const isActive = (path: string) => pathname === path;

  const linkClass = (path: string) =>
    `transition ${
      isActive(path)
        ? "text-amber-600 font-bold"
        : "text-slate-600 hover:text-amber-600 font-medium"
    }`;

  return (
    <header className="bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* BRAND LOGO */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-sm sm:text-lg text-slate-900 tracking-tight flex-shrink-0 touch-manipulation active:opacity-80"
        >
          <div className="bg-amber-500 p-1.5 rounded-lg text-white flex-shrink-0">
            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="whitespace-nowrap">KRL Academy</span>
        </Link>

        {/* DESKTOP NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/" className={linkClass("/")}>
            Home
          </Link>
          {user && (
            <>
              <Link href="/dashboard" className={linkClass("/dashboard")}>
                Dashboard
              </Link>
              <Link href="/performance" className={linkClass("/performance")}>
                Performance Analytics
              </Link>
            </>
          )}
          <Link href="/resources" className={linkClass("/resources")}>
            Courses
          </Link>
          <Link href="/lecturers" className={linkClass("/lecturers")}>
            Faculty
          </Link>
          <Link
            href="/resources?type=pathfinder"
            className="text-slate-600 hover:text-amber-600 font-medium transition"
          >
            Pathfinders
          </Link>
          <Link
            href="/resources?type=past_question"
            className="text-slate-600 hover:text-amber-600 font-medium transition"
          >
            Past Questions
          </Link>
        </nav>

        {/* DESKTOP AUTH BUTTONS */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link
                  href="/admin/resources"
                  className={`text-xs font-semibold px-3 py-2 rounded-lg border flex items-center gap-1.5 transition ${
                    pathname.startsWith("/admin")
                      ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                      : "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg border border-slate-200 flex items-center gap-1.5 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg transition shadow-xs"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="hidden sm:inline-block text-sm font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 px-5 py-2 rounded-lg transition"
              >
                Register Free
              </Link>
            </>
          )}
        </div>

        {/* MOBILE HAMBURGER MENU BUTTON */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 active:bg-slate-100 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none cursor-pointer touch-manipulation"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3">
          <nav className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700">
            <Link
              href="/"
              className={`p-2.5 rounded-xl flex items-center gap-2.5 transition touch-manipulation ${
                isActive("/")
                  ? "bg-amber-50 text-amber-700 font-bold border border-amber-200"
                  : "hover:bg-slate-50 active:bg-slate-100"
              }`}
            >
              <Home className="w-4 h-4 text-amber-500" />
              <span>Home</span>
            </Link>

            {user && (
              <>
                <Link
                  href="/dashboard"
                  className={`p-2.5 rounded-xl flex items-center gap-2.5 transition touch-manipulation ${
                    isActive("/dashboard")
                      ? "bg-amber-50 text-amber-700 font-bold border border-amber-200"
                      : "hover:bg-slate-50 active:bg-slate-100"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-amber-600" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/performance"
                  className={`p-2.5 rounded-xl flex items-center gap-2.5 transition touch-manipulation ${
                    isActive("/performance")
                      ? "bg-amber-50 text-amber-700 font-bold border border-amber-200"
                      : "hover:bg-slate-50 active:bg-slate-100"
                  }`}
                >
                  <LineChart className="w-4 h-4 text-amber-500" />
                  <span>Performance Analytics</span>
                </Link>
              </>
            )}

            <Link
              href="/resources"
              className={`p-2.5 rounded-xl flex items-center gap-2.5 transition touch-manipulation ${
                isActive("/resources")
                  ? "bg-amber-50 text-amber-700 font-bold border border-amber-200"
                  : "hover:bg-slate-50 active:bg-slate-100"
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>Courses</span>
            </Link>

            <Link
              href="/lecturers"
              className={`p-2.5 rounded-xl flex items-center gap-2.5 transition touch-manipulation ${
                isActive("/lecturers")
                  ? "bg-amber-50 text-amber-700 font-bold border border-amber-200"
                  : "hover:bg-slate-50 active:bg-slate-100"
              }`}
            >
              <Users className="w-4 h-4 text-amber-500" />
              <span>Faculty</span>
            </Link>

            <Link
              href="/resources?type=pathfinder"
              className="p-2.5 rounded-xl hover:bg-slate-50 active:bg-slate-100 flex items-center gap-2.5 transition touch-manipulation"
            >
              <FileText className="w-4 h-4 text-amber-500" />
              <span>Pathfinders</span>
            </Link>

            <Link
              href="/resources?type=past_question"
              className="p-2.5 rounded-xl hover:bg-slate-50 active:bg-slate-100 flex items-center gap-2.5 transition touch-manipulation"
            >
              <FileText className="w-4 h-4 text-amber-500" />
              <span>Past Questions</span>
            </Link>

            {user && isAdmin && (
              <Link
                href="/admin/resources"
                className={`p-2.5 rounded-xl flex items-center gap-2.5 border touch-manipulation ${
                  pathname.startsWith("/admin")
                    ? "bg-amber-50 text-amber-700 font-bold border-amber-200"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Admin Command Center</span>
              </Link>
            )}
          </nav>

          {/* MOBILE AUTH BUTTONS */}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full p-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer touch-manipulation"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="flex-1 py-2.5 text-center bg-amber-500 active:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs touch-manipulation"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="flex-1 py-2.5 text-center bg-transparent border border-slate-300 text-slate-700 active:bg-slate-100 rounded-xl text-xs font-bold touch-manipulation"
                >
                  Register Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
