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
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* BRAND LOGO */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-sm sm:text-lg text-white tracking-tight flex-shrink-0"
        >
          <div className="bg-amber-500 p-1.5 rounded-lg text-slate-950 flex-shrink-0">
            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="whitespace-nowrap">CA Prep Academy</span>
        </Link>

        {/* DESKTOP NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link href="/" className="hover:text-amber-400 transition">
            Home
          </Link>
          {user && (
            <Link
              href="/dashboard"
              className="hover:text-amber-400 transition font-bold text-amber-400"
            >
              Dashboard
            </Link>
          )}
          <Link
            href="/resources"
            className="hover:text-amber-400 transition flex items-center gap-1"
          >
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Study Materials</span>
          </Link>
          <Link
            href="/resources?type=pathfinder"
            className="hover:text-amber-400 transition"
          >
            Pathfinders
          </Link>
          <Link
            href="/resources?type=past_question"
            className="hover:text-amber-400 transition"
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
                  className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg border border-slate-700 flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin</span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-3 py-2 rounded-lg border border-rose-500/20 flex items-center gap-1.5 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-300 hover:text-white px-3 py-2 transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-lg transition shadow-sm"
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
            className="p-2 text-slate-300 hover:text-white bg-slate-800 rounded-xl border border-slate-700 focus:outline-none cursor-pointer"
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
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-4 space-y-3">
          <nav className="flex flex-col gap-1.5 text-sm font-semibold text-slate-300">
            <Link
              href="/"
              className="p-2.5 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 transition"
            >
              <Home className="w-4 h-4 text-amber-400" />
              <span>Home</span>
            </Link>

            {user && (
              <Link
                href="/dashboard"
                className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 flex items-center gap-2.5 font-bold border border-amber-500/20"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            )}

            <Link
              href="/resources"
              className="p-2.5 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 transition"
            >
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>Study Materials</span>
            </Link>

            <Link
              href="/resources?type=pathfinder"
              className="p-2.5 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 transition"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Pathfinders</span>
            </Link>

            <Link
              href="/resources?type=past_question"
              className="p-2.5 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 transition"
            >
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Past Questions</span>
            </Link>

            {user && isAdmin && (
              <Link
                href="/admin/resources"
                className="p-2.5 rounded-xl bg-slate-800 text-slate-200 flex items-center gap-2.5 border border-slate-700"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Admin Command Center</span>
              </Link>
            )}
          </nav>

          {/* MOBILE AUTH BUTTONS */}
          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="flex-1 py-2.5 text-center bg-slate-800 text-slate-200 rounded-xl text-xs font-bold border border-slate-700"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="flex-1 py-2.5 text-center bg-amber-500 text-slate-950 rounded-xl text-xs font-bold shadow-md"
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
