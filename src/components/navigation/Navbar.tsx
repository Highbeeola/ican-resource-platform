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

  return (
    <header className="bg-[#1e3a8a] border-b border-blue-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* BRAND LOGO */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-sm sm:text-lg text-white tracking-tight flex-shrink-0 touch-manipulation active:opacity-80"
        >
          <div className="bg-[#f59e0b] p-1.5 rounded-lg text-white flex-shrink-0">
            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="whitespace-nowrap">KRL Academy</span>
        </Link>

        {/* DESKTOP NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-blue-100">
          <Link href="/" className="hover:text-white transition">
            Home
          </Link>
          {user && (
            <Link
              href="/dashboard"
              className="hover:text-white transition font-bold text-amber-300"
            >
              Dashboard
            </Link>
          )}
          <Link href="/resources" className="hover:text-white transition">
            Courses
          </Link>
          <Link
            href="/resources?type=pathfinder"
            className="hover:text-white transition"
          >
            Pathfinders
          </Link>
          <Link
            href="/resources?type=past_question"
            className="hover:text-white transition"
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
                  className="text-xs font-semibold bg-blue-900/60 hover:bg-blue-900 text-amber-300 px-3 py-2 rounded-md border border-blue-700 flex items-center gap-1.5 transition"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-xs font-semibold bg-blue-800/60 hover:bg-blue-700 text-blue-100 px-3 py-2 rounded-md border border-blue-600 flex items-center gap-1.5 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-bold bg-[#f59e0b] hover:bg-[#d97706] text-white px-6 py-2 rounded-md transition shadow-sm"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="hidden sm:inline-block text-sm font-semibold text-white border border-white hover:bg-white hover:text-[#1e3a8a] px-5 py-2 rounded-md transition"
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
            className="p-2 text-blue-100 hover:text-white active:bg-blue-800 bg-blue-900/50 rounded-xl border border-blue-700 focus:outline-none cursor-pointer touch-manipulation"
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
        <div className="md:hidden bg-[#1e3a8a] border-b border-blue-800 px-4 py-4 space-y-3">
          <nav className="flex flex-col gap-1.5 text-sm font-semibold text-blue-100">
            <Link
              href="/"
              className="p-2.5 rounded-xl hover:bg-blue-800 active:bg-blue-800/80 flex items-center gap-2.5 transition touch-manipulation"
            >
              <Home className="w-4 h-4 text-amber-400" />
              <span>Home</span>
            </Link>

            {user && (
              <Link
                href="/dashboard"
                className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 active:bg-amber-500/30 flex items-center gap-2.5 font-bold border border-amber-500/30 touch-manipulation"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            )}

            <Link
              href="/resources"
              className="p-2.5 rounded-xl hover:bg-blue-800 active:bg-blue-800/80 flex items-center gap-2.5 transition touch-manipulation"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Courses</span>
            </Link>

            <Link
              href="/resources?type=pathfinder"
              className="p-2.5 rounded-xl hover:bg-blue-800 active:bg-blue-800/80 flex items-center gap-2.5 transition touch-manipulation"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Pathfinders</span>
            </Link>

            <Link
              href="/resources?type=past_question"
              className="p-2.5 rounded-xl hover:bg-blue-800 active:bg-blue-800/80 flex items-center gap-2.5 transition touch-manipulation"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Past Questions</span>
            </Link>

            {user && isAdmin && (
              <Link
                href="/admin/resources"
                className="p-2.5 rounded-xl bg-blue-900/80 text-amber-300 active:bg-blue-900 flex items-center gap-2.5 border border-blue-700 touch-manipulation"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Admin Command Center</span>
              </Link>
            )}
          </nav>

          {/* MOBILE AUTH BUTTONS */}
          <div className="pt-2 border-t border-blue-800 flex flex-col gap-2">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full p-2.5 bg-blue-800/60 hover:bg-blue-700 active:bg-blue-800 text-blue-100 border border-blue-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer touch-manipulation"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="flex-1 py-2.5 text-center bg-[#f59e0b] active:bg-[#d97706] text-white rounded-xl text-xs font-bold shadow-md touch-manipulation"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="flex-1 py-2.5 text-center bg-transparent border border-white text-white active:bg-white active:text-[#1e3a8a] rounded-xl text-xs font-bold touch-manipulation"
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
