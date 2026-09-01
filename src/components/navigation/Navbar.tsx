"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LogOut,
  Shield,
  Menu,
  X,
  Home,
  BookOpen,
  ChevronDown,
  User as UserIcon,
  Settings,
  Target,
  LayoutDashboard,
  FileText,
  Info,
  Mail,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import BrandLogo from "@/components/BrandLogo";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    } = supabase.auth.onAuthStateChange((_event, session) =>
      checkUser(session?.user ?? null),
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setMoreDropdownOpen(false);
  }, [pathname]);

  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/admin/login" ||
    pathname === "/forgot-password" ||
    pathname === "/update-password"
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
    <>
      <header className="bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* BRAND LOGO */}
          <Link href="/" className="flex-shrink-0">
            <BrandLogo />
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-[#1e3a8a] transition">
              Home
            </Link>
            <Link href="/resources" className="hover:text-[#1e3a8a] transition">
              Courses
            </Link>

            {user && (
              <>
                <Link
                  href="/resources?type=pathfinder"
                  className="hover:text-[#1e3a8a] transition"
                >
                  Pathfinders
                </Link>
                <Link
                  href="/resources?type=past_question"
                  className="hover:text-[#1e3a8a] transition"
                >
                  Past Questions
                </Link>

                {/* MORE DROPDOWN */}
                <div
                  className="relative"
                  onMouseLeave={() => setMoreDropdownOpen(false)}
                >
                  <button
                    onMouseEnter={() => setMoreDropdownOpen(true)}
                    onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                    className="flex items-center gap-1 hover:text-[#1e3a8a] transition py-2 focus:outline-none"
                  >
                    <span>More</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {moreDropdownOpen && (
                    <div className="absolute top-full left-0 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-2 text-slate-700 z-50">
                      <Link
                        href="/lecturers"
                        className="block px-4 py-2 hover:bg-slate-50 hover:text-[#1e3a8a] transition"
                      >
                        Faculty
                      </Link>
                      <Link
                        href="/about"
                        className="block px-4 py-2 hover:bg-slate-50 hover:text-[#1e3a8a] transition"
                      >
                        About Us
                      </Link>
                      <Link
                        href="/contact"
                        className="block px-4 py-2 hover:bg-slate-50 hover:text-[#1e3a8a] transition"
                      >
                        Contact
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </nav>

          {/* AUTH / USER MENU */}
          <div className="hidden md:flex items-center gap-3">
            {!user ? (
              <>
                <Link
                  href="/login"
                  className="text-sm font-bold bg-[#1e3a8a] hover:bg-blue-900 text-white px-6 py-2 rounded-md transition shadow-sm"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 px-5 py-2 rounded-md transition"
                >
                  Register Free
                </Link>
              </>
            ) : (
              <div
                className="relative flex items-center gap-3"
                ref={dropdownRef}
              >
                {isAdmin && (
                  <Link
                    href="/admin/resources"
                    className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-md border border-slate-300 flex items-center gap-1.5 transition"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#1e3a8a]" />{" "}
                    <span>Admin</span>
                  </Link>
                )}

                {/* USER AVATAR DROPDOWN */}
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition cursor-pointer focus:outline-none"
                >
                  <UserIcon className="w-5 h-5 text-slate-600" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 text-slate-700 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                        Signed in as
                      </p>
                      <p className="text-sm font-bold text-[#1e3a8a] truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 hover:text-[#1e3a8a] transition"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link
                      href="/performance"
                      className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 hover:text-[#1e3a8a] transition"
                    >
                      <Target className="w-4 h-4" /> Performance Analytics
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 hover:text-[#1e3a8a] transition"
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-rose-50 text-rose-600 transition text-left font-medium"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* MOBILE HAMBURGER BUTTON */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 focus:outline-none cursor-pointer"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* MOBILE MENU DRAWER */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-4 shadow-xl text-slate-800 relative z-50 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="flex flex-col gap-1 text-sm font-semibold">
              <Link
                href="/"
                className="p-2.5 rounded-lg hover:bg-slate-50 flex items-center gap-3"
              >
                <Home className="w-5 h-5 text-slate-400" /> Home
              </Link>
              <Link
                href="/resources"
                className="p-2.5 rounded-lg hover:bg-slate-50 flex items-center gap-3"
              >
                <BookOpen className="w-5 h-5 text-slate-400" /> Courses
              </Link>

              {user && (
                <>
                  <Link
                    href="/resources?type=pathfinder"
                    className="p-2.5 rounded-lg hover:bg-slate-50 flex items-center gap-3"
                  >
                    <FileText className="w-5 h-5 text-slate-400" /> Pathfinders
                  </Link>
                  <Link
                    href="/resources?type=past_question"
                    className="p-2.5 rounded-lg hover:bg-slate-50 flex items-center gap-3"
                  >
                    <FileText className="w-5 h-5 text-slate-400" /> Past
                    Questions
                  </Link>
                  <div className="border-t border-slate-100 my-1"></div>
                  <Link
                    href="/dashboard"
                    className="p-2.5 rounded-lg bg-blue-50 text-[#1e3a8a] flex items-center gap-3"
                  >
                    <LayoutDashboard className="w-5 h-5" /> Dashboard
                  </Link>
                  <Link
                    href="/performance"
                    className="p-2.5 rounded-lg hover:bg-slate-50 flex items-center gap-3"
                  >
                    <Target className="w-5 h-5 text-slate-400" /> Performance
                    Analytics
                  </Link>
                  <Link
                    href="/lecturers"
                    className="p-2.5 rounded-lg hover:bg-slate-50 flex items-center gap-3"
                  >
                    <UserIcon className="w-5 h-5 text-slate-400" /> Faculty
                    Directory
                  </Link>
                  <Link
                    href="/about"
                    className="p-2.5 rounded-lg hover:bg-slate-50 flex items-center gap-3"
                  >
                    <Info className="w-5 h-5 text-slate-400" /> About Us
                  </Link>
                  <Link
                    href="/contact"
                    className="p-2.5 rounded-lg hover:bg-slate-50 flex items-center gap-3"
                  >
                    <Mail className="w-5 h-5 text-slate-400" /> Contact
                  </Link>
                </>
              )}
            </nav>

            <div className="pt-2 border-t border-slate-100">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full p-2.5 bg-rose-50 text-rose-600 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    className="w-full py-2.5 text-center bg-[#1e3a8a] text-white rounded-lg text-sm font-bold shadow-sm"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="w-full py-2.5 text-center bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-bold shadow-sm"
                  >
                    Register Free
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. BACKDROP OVERLAY FOR MOBILE MENU */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
        />
      )}
    </>
  );
}
