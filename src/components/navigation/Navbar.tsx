"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, FileText, LogOut, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // 1. LISTEN FOR REAL-TIME AUTH STATE & PROFILE ROLE CHANGES
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

    // Fetch initial user and check role
    supabase.auth.getUser().then(({ data }) => checkUser(data.user));

    // Listen for live login/logout events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      checkUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. HIDE NAVBAR ON LOGIN & REGISTER PAGES
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* BRAND LOGO */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-lg text-white tracking-tight"
        >
          <div className="bg-amber-500 p-1.5 rounded-lg text-slate-950">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span>CA Prep Academy</span>
        </Link>

        {/* NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link href="/" className="hover:text-amber-400 transition">
            Home
          </Link>
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

        {/* AUTH BUTTONS */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xs text-slate-400 hidden sm:inline">
                {user.email}
              </span>

              {/* SHOW ADMIN BUTTON ONLY IF PROFILE ROLE IS ADMIN */}
              {isAdmin && (
                <Link
                  href="/admin/resources"
                  className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
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
      </div>
    </header>
  );
}
