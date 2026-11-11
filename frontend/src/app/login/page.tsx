"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  User,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { signIn as nextAuthSignIn } from "next-auth/react";
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  KeyRound,
  ShieldAlert
} from "lucide-react";

const googleProvider = new GoogleAuthProvider();

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        sessionStorage.setItem("token", "1");
        router.push("/home");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await signInWithPopup(auth, googleProvider);
      sessionStorage.setItem("token", "1");
      router.push("/home");
    } catch (err: any) {
      console.warn("Firebase popup signin notice, attempting NextAuth fallback", err);
      try {
        await nextAuthSignIn("google", { callbackUrl: "/home" });
      } catch (authErr: any) {
        setErrorMessage(err.message || "Failed to authenticate with Google");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      sessionStorage.setItem("token", "1");
      router.push("/home");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found") {
        setErrorMessage("Invalid email or password. Please verify your credentials.");
      } else {
        setErrorMessage(err.message || "An authentication error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAccess = () => {
    sessionStorage.setItem("token", "guest");
    router.push("/home");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 cyber-grid flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Cybersecurity Hero Panel */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 bg-gradient-to-br from-cyan-950/70 via-slate-900 to-blue-950/70 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Logo */}
          <div className="relative space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Spam<span className="text-cyan-400">Out</span>
              </span>
            </Link>

            <div className="pt-6 space-y-2">
              <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-widest">
                Security Analyst Access
              </span>
              <h2 className="text-3xl font-extrabold text-white leading-tight">
                Defend Your Inboxes with Sub-Second Zero-Trust Forensics.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Connect your Gmail inbox or test suspicious emails inside our isolated memory sandbox to neutralize phishing, spoofing, and malicious links.
              </p>
            </div>
          </div>

          {/* Pillars List */}
          <div className="relative pt-8 space-y-3">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>Automated SPF, DKIM & DMARC DNS verification</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>VirusTotal multi-engine attachment hash inspection</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <span>Read-only Google OAuth scope with zero email retention</span>
            </div>
          </div>

          {/* Compliance note */}
          <div className="relative pt-8 text-[11px] text-slate-500 font-mono">
            SECURE PORTAL • 256-BIT TLS ENCRYPTED • SOC-2 ALIGNED
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-white">Sign In to SpamOut</h3>
              <p className="text-xs text-slate-400">
                Choose your preferred sign-in method to access the threat portal.
              </p>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Primary Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-slate-900 bg-white hover:bg-slate-100 shadow-lg shadow-white/5 flex items-center justify-center gap-3 transition-all duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google Account</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[11px] font-mono text-slate-500 uppercase">
                Or with Email
              </span>
              <div className="border-t border-slate-800 w-full" />
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@domain.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all"
              >
                {isLoading ? "Authenticating..." : "Sign In to Console"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Guest Sandbox Bypass Button */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleGuestAccess}
                className="text-xs text-slate-400 hover:text-cyan-400 font-medium transition-colors"
              >
                Want to test first? <span className="underline">Enter Dashboard as Guest Analyst →</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
