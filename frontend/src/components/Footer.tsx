"use client";
import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Terminal, Github, Heart, ShieldAlert, Cpu } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5">
                <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Spam<span className="text-cyan-400">Out</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Zero-trust email threat intelligence, SPF/DKIM/DMARC domain spoofing verification, and AI phishing defense.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Engine v2.4 Active & Scanning
            </div>
          </div>

          {/* Navigation Columns */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/home" className="hover:text-cyan-400 transition-colors">
                  Security Dashboard
                </Link>
              </li>
              <li>
                <Link href="/analyze_emails" className="hover:text-cyan-400 transition-colors">
                  Inbox Threat Analysis
                </Link>
              </li>
              <li>
                <Link href="/home" className="hover:text-cyan-400 transition-colors">
                  Manual Sandbox Inspector
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-cyan-400 transition-colors">
                  Pricing & Plans
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Detection Engines
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5">
                <span className="text-cyan-400">✓</span> SPF DNS Record Resolver
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-cyan-400">✓</span> DKIM Signature Verification
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-cyan-400">✓</span> DMARC Policy Enforcement
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-cyan-400">✓</span> VirusTotal Hash Sandbox
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-cyan-400">✓</span> Link Punycode & Redirection Audit
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Security & Privacy
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                <span>Read-only OAuth scopes. We never store, sell, or alter your emails.</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>Zero-Retention Architecture: All memory processing runs ephemerally.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} SpamOut Security. All rights reserved. Built for enterprise-grade inbox defense.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Security Whitepaper</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
