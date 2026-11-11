"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  LayoutDashboard, 
  Scan, 
  CircleDollarSign, 
  Menu, 
  X, 
  LogIn, 
  LogOut, 
  Sun, 
  Moon, 
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut as firebaseSignOut, User } from "firebase/auth";

export const NavbarComponent = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    // Check initial dark mode class
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      const isDarkMode = root.classList.contains("dark") || 
        (!root.classList.contains("light") && window.matchMedia("(prefers-color-scheme: dark)").matches);
      setIsDark(isDarkMode);
      if (isDarkMode) {
        root.classList.add("dark");
        root.classList.remove("light");
      } else {
        root.classList.remove("dark");
        root.classList.add("light");
      }
    }

    // Check Firebase auth
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });

    // Check backend health
    fetch("http://127.0.0.1:5000/health")
      .then((res) => res.json())
      .then((data) => setBackendOnline(data.status === "ok"))
      .catch(() => setBackendOnline(false));

    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove("dark");
      root.classList.add("light");
      setIsDark(false);
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
      setIsDark(true);
    }
  };

  const currentUser = session?.user || firebaseUser;
  const userEmail = session?.user?.email || firebaseUser?.email;
  const userName = session?.user?.name || firebaseUser?.displayName || userEmail?.split("@")[0] || "User";

  const handleSignOut = async () => {
    try {
      if (session) await nextAuthSignOut({ callbackUrl: "/" });
      await firebaseSignOut(auth);
      sessionStorage.removeItem("token");
      localStorage.removeItem("token");
    } catch (err) {
      console.error("Signout error", err);
    }
  };

  const navLinks = [
    { href: "/home", label: "Dashboard", icon: LayoutDashboard },
    { href: "/analyze_emails", label: "Inbox Threat Feed", icon: Scan },
    { href: "/pricing", label: "Pricing", icon: CircleDollarSign },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-slate-900/80 light:bg-white/90 border-b border-slate-800 light:border-slate-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
                  SpamOut
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Zero-Trust
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase -mt-0.5">
                Cyber Threat Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60 light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Engine Status Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs">
              <span className={`w-2 h-2 rounded-full ${backendOnline === true ? "bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" : backendOnline === false ? "bg-amber-400" : "bg-slate-400"}`} />
              <span className="text-slate-300 font-mono text-[11px]">
                {backendOnline === true ? "Engine: Ready" : backendOnline === false ? "Engine: Offline" : "Checking..."}
              </span>
            </div>

            {/* Dark/Light Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 light:hover:bg-slate-100 light:hover:text-slate-900 transition-colors border border-transparent hover:border-slate-700"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* User Auth Info or Sign In */}
            {currentUser ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-800 light:border-slate-200">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-medium text-slate-200 light:text-slate-800 truncate max-w-[120px]">
                    {userName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                    {userEmail}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all duration-200"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/95 px-4 pt-3 pb-6 space-y-2 backdrop-blur-xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  {link.label}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </Link>
            );
          })}

          <div className="pt-4 border-t border-slate-800">
            {currentUser ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-200">{userName}</span>
                  <span className="text-[11px] text-slate-400">{userEmail}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1 text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-md border border-rose-500/30"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg shadow-md"
              >
                <LogIn className="w-4 h-4" />
                Sign In / Get Started
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
