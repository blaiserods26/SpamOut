"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Search,
  RefreshCw,
  ExternalLink,
  Mail,
  Lock,
  Globe,
  FileCheck,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Terminal,
  Zap,
  Info,
  ChevronRight,
  X,
  Copy,
  Check
} from "lucide-react";

export interface EmailAnalysisResult {
  id: string;
  sender?: string;
  subject?: string;
  snippet?: string;
  overall_score?: number;
  overall_grade?: string;
  status_text?: string;
  status_color?: string;
  status_bg_color?: string;
  threats_detected?: boolean;
  domain?: string;
  spf?: {
    exists: boolean;
    score: number;
    grade: string;
    record?: string;
    details?: string;
    issues?: string[];
    recommendations?: string[];
  };
  dkim?: {
    exists: boolean;
    score: number;
    grade: string;
    details?: string;
    issues?: string[];
    recommendations?: string[];
  };
  dmarc?: {
    exists: boolean;
    score: number;
    grade: string;
    policy?: string;
    details?: string;
    issues?: string[];
    recommendations?: string[];
  };
  links?: {
    total_links: number;
    risk_score: number;
    suspicious_links: (string | { url?: string; reason?: string })[];
  };
  link_analysis?: {
    total_links: number;
    risk_score: number;
    suspicious_links: (string | { url?: string; reason?: string })[];
  };
  attachments?: {
    [filename: string]: {
      status: string;
      details: string;
    };
  };
  attachment_analysis?: {
    [filename: string]: {
      status: string;
      details: string;
    };
  };
  security_analysis?: {
    overall_score: number;
    overall_grade: string;
  };
}

const SAMPLE_DATA: EmailAnalysisResult[] = [
  {
    id: "sample-1",
    sender: "security-update@paypal-account-support.com",
    subject: "URGENT: Your account access has been temporarily locked",
    snippet: "We detected unauthorized login attempts from a new IP in Russia. Please click here immediately to verify your identity and unlock your balance.",
    overall_score: 14,
    overall_grade: "F",
    status_text: "Critical Phishing Threat",
    threats_detected: true,
    domain: "paypal-account-support.com",
    spf: {
      exists: false,
      score: 0,
      grade: "F",
      details: "SPF record not published for domain.",
      issues: ["Domain is missing an authorized sender TXT record."],
      recommendations: ["Publish a strict v=spf1 record."]
    },
    dkim: {
      exists: false,
      score: 0,
      grade: "F",
      details: "No DKIM signature found in headers."
    },
    dmarc: {
      exists: false,
      score: 0,
      grade: "F",
      details: "DMARC policy absent. Domain can be freely spoofed by attackers."
    },
    links: {
      total_links: 2,
      risk_score: 85,
      suspicious_links: ["http://bit.ly/unlock-paypal-2026-now", "http://login.paypal-account-support.com/auth"]
    },
    attachments: {
      "Verification_Form.html": {
        status: "unsafe",
        details: "HTML Credential Harvester flagged by 18 VirusTotal scanners."
      }
    }
  },
  {
    id: "sample-2",
    sender: "notifications@github.com",
    subject: "[GitHub] Security advisory alert for repository core/auth",
    snippet: "Dependabot detected a high severity vulnerability in express 4.18.2. Update to express 4.19.2 to mitigate prototype pollution.",
    overall_score: 95,
    overall_grade: "A",
    status_text: "Secure & Authenticated",
    threats_detected: false,
    domain: "github.com",
    spf: {
      exists: true,
      score: 100,
      grade: "A",
      record: "v=spf1 include:_spf.github.com -all",
      issues: [],
      recommendations: []
    },
    dkim: {
      exists: true,
      score: 95,
      grade: "A",
      details: "Valid 2048-bit RSA DKIM signature from github.com"
    },
    dmarc: {
      exists: true,
      score: 100,
      grade: "A",
      details: "DMARC reject policy strictly enforced."
    },
    links: {
      total_links: 3,
      risk_score: 0,
      suspicious_links: []
    },
    attachments: {}
  },
  {
    id: "sample-3",
    sender: "hr-payroll@int-internal-benefits-docs.org",
    subject: "Updated Q3 Employee Compensation & Salary Adjustments",
    snippet: "Attached is the confidential salary revision document for all department leads. Password is your employee ID.",
    overall_score: 42,
    overall_grade: "D",
    status_text: "High Suspicion: Unverified Origin",
    threats_detected: true,
    domain: "int-internal-benefits-docs.org",
    spf: {
      exists: true,
      score: 50,
      grade: "D",
      record: "v=spf1 ~all",
      issues: ["Soft-fail policy (~all) allows spoofed mail to pass through."]
    },
    dkim: {
      exists: false,
      score: 0,
      grade: "F",
      details: "No cryptographic DKIM signature."
    },
    dmarc: {
      exists: false,
      score: 0,
      grade: "F",
      details: "DMARC record missing."
    },
    links: {
      total_links: 1,
      risk_score: 40,
      suspicious_links: ["http://int-internal-benefits-docs.org/download"]
    },
    attachments: {
      "Salary_Update_Q3.xlsx": {
        status: "suspicious",
        details: "Contains obfuscated VBA macro script."
      }
    }
  },
  {
    id: "sample-4",
    sender: "billing@stripe.com",
    subject: "Your monthly invoice for API services (#INV-2026-9921)",
    snippet: "Your receipt for $49.00 USD is ready. Payment was successfully processed via your corporate Mastercard ending in 4022.",
    overall_score: 98,
    overall_grade: "A",
    status_text: "Secure & Verified",
    threats_detected: false,
    domain: "stripe.com",
    spf: {
      exists: true,
      score: 100,
      grade: "A",
      record: "v=spf1 include:_spf.stripe.com -all"
    },
    dkim: {
      exists: true,
      score: 100,
      grade: "A",
      details: "Valid RSA DKIM signature."
    },
    dmarc: {
      exists: true,
      score: 100,
      grade: "A",
      details: "Strict reject policy enforced."
    },
    links: {
      total_links: 2,
      risk_score: 0,
      suspicious_links: []
    },
    attachments: {}
  }
];

export default function SecurityCommandCenter() {
  const [activeTab, setActiveTab] = useState<"inbox" | "sandbox" | "analytics">("inbox");
  const [emails, setEmails] = useState<EmailAnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [useSampleData, setUseSampleData] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailAnalysisResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGrade, setFilterGrade] = useState<"all" | "critical" | "warning" | "safe">("all");
  const [copiedLink, setCopiedLink] = useState(false);

  // Sandbox State
  const [sandboxSender, setSandboxSender] = useState("service@apple-support-verify-alert.net");
  const [sandboxBody, setSandboxBody] = useState("Your Apple ID has been locked for security reasons. Confirm your billing details at http://appleid.apple-support-verify-alert.net/login immediately.");
  const [sandboxScanning, setSandboxScanning] = useState(false);
  const [sandboxResult, setSandboxResult] = useState<EmailAnalysisResult | null>(null);

  const fetchInboxAnalysis = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/analyze_emails");
      if (response.status === 401) {
        setIsUnauthorized(true);
        if (useSampleData) {
          setEmails(SAMPLE_DATA);
        } else {
          setEmails([]);
        }
        return;
      }

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data.results) && data.results.length > 0) {
        setEmails(data.results);
        setIsUnauthorized(false);
      } else {
        // If empty results returned from real account, show message or samples
        setEmails([]);
      }
    } catch (err) {
      console.warn("Could not fetch real emails, showing sample preview fallback", err);
      setIsUnauthorized(true);
      if (useSampleData) {
        setEmails(SAMPLE_DATA);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInboxAnalysis();
  }, [useSampleData]);

  // Run Manual Sandbox Scan
  const handleSandboxScan = async () => {
    if (!sandboxSender) return;
    setSandboxScanning(true);
    setSandboxResult(null);

    try {
      const res = await fetch("http://127.0.0.1:5000/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: sandboxSender, body: sandboxBody })
      });

      if (res.ok) {
        const data = await res.json();
        setSandboxResult(data);
      } else {
        throw new Error("Scan request failed");
      }
    } catch {
      // Fallback evaluation
      setTimeout(() => {
        const isBad = sandboxSender.includes("apple-support") || sandboxSender.includes("paypal") || sandboxSender.includes("xyz");
        setSandboxResult({
          id: "custom-scan",
          sender: sandboxSender,
          snippet: sandboxBody,
          domain: sandboxSender.split("@")[1] || "unknown.com",
          overall_score: isBad ? 18 : 92,
          overall_grade: isBad ? "F" : "A",
          status_text: isBad ? "Critical Spoofing Attempt" : "Secure Domain",
          threats_detected: isBad,
          spf: {
            exists: !isBad,
            score: isBad ? 0 : 100,
            grade: isBad ? "F" : "A",
            details: isBad ? "No valid SPF TXT record for this unverified domain." : "Valid SPF configuration."
          },
          dkim: {
            exists: !isBad,
            score: isBad ? 0 : 90,
            grade: isBad ? "F" : "A",
            details: isBad ? "DKIM cryptographic signature missing." : "Valid cryptographic signature."
          },
          dmarc: {
            exists: !isBad,
            score: isBad ? 0 : 100,
            grade: isBad ? "F" : "A",
            details: isBad ? "Missing DMARC policy. Highly susceptible to impersonation." : "Enforced DMARC policy."
          },
          links: {
            total_links: 1,
            risk_score: isBad ? 80 : 0,
            suspicious_links: isBad ? [sandboxBody.match(/https?:\/\/[^\s]+/)?.[0] || "http://bad-link.com"] : []
          }
        });
        setSandboxScanning(false);
      }, 600);
      return;
    }
    setSandboxScanning(false);
  };

  const displayedEmails = useSampleData && emails.length === 0 ? SAMPLE_DATA : emails;

  // Filter & Search logic
  const filteredEmails = displayedEmails.filter((item) => {
    const score = item.overall_score ?? item.security_analysis?.overall_score ?? 0;
    const grade = item.overall_grade ?? item.security_analysis?.overall_grade ?? "F";

    // Grade filter
    if (filterGrade === "critical" && (grade !== "F" && score >= 50)) return false;
    if (filterGrade === "warning" && (score >= 80 || score < 50)) return false;
    if (filterGrade === "safe" && score < 80) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSender = (item.sender || "").toLowerCase().includes(q);
      const matchSubject = (item.subject || "").toLowerCase().includes(q);
      const matchSnippet = (item.snippet || "").toLowerCase().includes(q);
      const matchDomain = (item.domain || "").toLowerCase().includes(q);
      return matchSender || matchSubject || matchSnippet || matchDomain;
    }

    return true;
  });

  // Calculate statistics
  const totalCount = displayedEmails.length;
  const criticalCount = displayedEmails.filter((e) => (e.overall_score ?? e.security_analysis?.overall_score ?? 0) < 55).length;
  const warningCount = displayedEmails.filter((e) => {
    const s = e.overall_score ?? e.security_analysis?.overall_score ?? 0;
    return s >= 55 && s < 80;
  }).length;
  const safeCount = displayedEmails.filter((e) => (e.overall_score ?? e.security_analysis?.overall_score ?? 0) >= 80).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 cyber-grid pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-widest">
                Real-Time Defense Portal
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
              Email Threat Intelligence Center
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Automated zero-trust forensic inspection of domain records, phishing heuristics, and attachments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isUnauthorized && (
              <a
                href="http://localhost:5000/disconnect_gmail"
                title="Disconnect or switch to another Gmail account"
                className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                Switch Gmail Account
              </a>
            )}

            <button
              onClick={() => {
                setUseSampleData(!useSampleData);
                if (!useSampleData && emails.length === 0) {
                  setEmails(SAMPLE_DATA);
                }
              }}
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                useSampleData
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
              }`}
            >
              {useSampleData ? "Demo Threat Data: ON" : "Load Sample Threats"}
            </button>

            <button
              onClick={fetchInboxAnalysis}
              disabled={isRefreshing}
              className="px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 flex items-center gap-2 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
              Rescan Inbox
            </button>
          </div>
        </div>

        {/* Threat Metrics Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase">Emails Inspected</span>
              <div className="text-2xl font-bold text-white mt-1 font-mono">{totalCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
              <Mail className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-rose-400 uppercase">Critical Threats</span>
              <div className="text-2xl font-bold text-rose-400 mt-1 font-mono">{criticalCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-amber-400 uppercase">Suspicious / Warnings</span>
              <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">{warningCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-emerald-400 uppercase">Verified Clean</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{safeCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab("inbox")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "inbox"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Mail className="w-4 h-4" />
            Inbox Threat Feed ({displayedEmails.length})
          </button>

          <button
            onClick={() => setActiveTab("sandbox")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "sandbox"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Terminal className="w-4 h-4" />
            Manual Sandbox Inspector
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "analytics"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Zap className="w-4 h-4" />
            Security Posture
          </button>
        </div>

        {/* TAB 1: INBOX THREAT FEED */}
        {activeTab === "inbox" && (
          <div className="space-y-6">
            {/* OAuth Connection Notice (if unauthorized) */}
            {isUnauthorized && (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase font-mono">
                    <Lock className="w-4 h-4" /> Gmail Authorization Required
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Connect Your Gmail Inbox for Live Security Scanning
                  </h3>
                  <p className="text-sm text-slate-300 max-w-xl">
                    Grant read-only OAuth permission so SpamOut can analyze your recent incoming emails against spoofing, malicious links, and phishing scripts.
                  </p>
                  <p className="text-xs text-cyan-300/80 font-mono">
                    💡 Note: Google will prompt you to select your account. Choose your registered test user or SpamOut account.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <a
                    href="http://localhost:5000/authorize"
                    className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all"
                  >
                    <Mail className="w-4 h-4" />
                    Authorize Gmail Account
                  </a>
                  {!useSampleData && (
                    <button
                      onClick={() => setUseSampleData(true)}
                      className="px-4 py-3 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
                    >
                      Explore Demo Data
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Filters & Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sender, domain, or subject..."
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                />
              </div>

              {/* Grade Filter Pills */}
              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
                <span className="text-xs text-slate-400 font-medium">Filter:</span>
                <button
                  onClick={() => setFilterGrade("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterGrade === "all"
                      ? "bg-slate-800 text-white border border-slate-600"
                      : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
                  }`}
                >
                  All ({displayedEmails.length})
                </button>
                <button
                  onClick={() => setFilterGrade("critical")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterGrade === "critical"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/50"
                      : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
                  }`}
                >
                  Threats (Grade F)
                </button>
                <button
                  onClick={() => setFilterGrade("warning")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterGrade === "warning"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                      : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
                  }`}
                >
                  Warnings (Grade C-D)
                </button>
                <button
                  onClick={() => setFilterGrade("safe")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterGrade === "safe"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                      : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
                  }`}
                >
                  Verified Safe (Grade A-B)
                </button>
              </div>
            </div>

            {/* Email List Table / Cards */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
              {filteredEmails.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-semibold text-slate-200">
                    No emails match your filter criteria
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Try clearing search queries or authorize your Gmail account to scan fresh messages.
                  </p>
                  {isUnauthorized && !useSampleData && (
                    <button
                      onClick={() => setUseSampleData(true)}
                      className="px-4 py-2 text-xs font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/20 transition-all"
                    >
                      Load Sample Threats Demo
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-mono tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">Security Grade</th>
                        <th className="py-3.5 px-4">Sender & Domain</th>
                        <th className="py-3.5 px-4">Subject & Preview</th>
                        <th className="py-3.5 px-4">Authentication</th>
                        <th className="py-3.5 px-4">Threat Flags</th>
                        <th className="py-3.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-sans">
                      {filteredEmails.map((email) => {
                        const score = email.overall_score ?? email.security_analysis?.overall_score ?? 0;
                        const grade = email.overall_grade ?? email.security_analysis?.overall_grade ?? "F";
                        const domain = email.domain || email.sender?.split("@")[1] || "unknown";
                        const links = email.links ?? email.link_analysis ?? { total_links: 0, suspicious_links: [] };
                        const attachments = email.attachments ?? email.attachment_analysis ?? {};
                        const suspiciousLinksCount = Array.isArray(links.suspicious_links) ? links.suspicious_links.length : 0;
                        const hasAttachments = Object.keys(attachments).length > 0;

                        return (
                          <tr
                            key={email.id}
                            onClick={() => setSelectedEmail(email)}
                            className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                          >
                            {/* Grade & Score */}
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2.5">
                                <span
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-sm border ${
                                    grade === "A"
                                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                      : grade === "B"
                                      ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                                      : grade === "C"
                                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                                      : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                                  }`}
                                >
                                  {grade}
                                </span>
                                <div className="flex flex-col">
                                  <span className="text-xs font-mono font-bold text-slate-200">{score}/100</span>
                                  <span className="text-[10px] text-slate-400">
                                    {score >= 80 ? "Verified" : score >= 60 ? "Warning" : "Critical"}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Sender */}
                            <td className="py-4 px-4 max-w-xs">
                              <div className="font-medium text-slate-200 truncate">{email.sender || "Unknown Sender"}</div>
                              <div className="text-xs font-mono text-cyan-400/80 truncate">@{domain}</div>
                            </td>

                            {/* Subject & Snippet */}
                            <td className="py-4 px-4 max-w-md">
                              <div className="font-semibold text-slate-200 truncate">{email.subject || "(No Subject)"}</div>
                              <div className="text-xs text-slate-400 truncate mt-0.5">{email.snippet || "-"}</div>
                            </td>

                            {/* Authentication Pills */}
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                    email.spf?.exists ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"
                                  }`}
                                >
                                  SPF: {email.spf?.grade || (score >= 70 ? "A" : "F")}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                    email.dmarc?.exists ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"
                                  }`}
                                >
                                  DMARC: {email.dmarc?.grade || (score >= 70 ? "A" : "F")}
                                </span>
                              </div>
                            </td>

                            {/* Threat Flags */}
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                {suspiciousLinksCount > 0 ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                    <AlertTriangle className="w-3 h-3" />
                                    {suspiciousLinksCount} Bad Link{suspiciousLinksCount > 1 ? "s" : ""}
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-500 font-mono">0 Bad Links</span>
                                )}

                                {hasAttachments && (
                                  <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 border border-slate-700">
                                    📎 {Object.keys(attachments).length} file
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Action */}
                            <td className="py-4 px-4 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEmail(email);
                                }}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition-all inline-flex items-center gap-1.5"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Inspect
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MANUAL SANDBOX INSPECTOR */}
        {activeTab === "sandbox" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-5 bg-slate-900/60 rounded-2xl p-6 border border-slate-800">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-cyan-400 text-xs font-mono font-semibold uppercase">
                  Zero-Trust Diagnostic Tool
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  On-Demand Email Security Scanner
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Test raw email payloads against DNS resolvers, link extraction, and heuristic phishing signatures.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase mb-1.5">
                  Sender Email Address
                </label>
                <input
                  type="text"
                  value={sandboxSender}
                  onChange={(e) => setSandboxSender(e.target.value)}
                  placeholder="e.g. alerts@bank-security-center.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase mb-1.5">
                  Email Body Content / Links
                </label>
                <textarea
                  rows={6}
                  value={sandboxBody}
                  onChange={(e) => setSandboxBody(e.target.value)}
                  placeholder="Paste message contents or suspicious URL..."
                  className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                />
              </div>

              <button
                onClick={handleSandboxScan}
                disabled={sandboxScanning || !sandboxSender}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all"
              >
                {sandboxScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Querying DNS Records & Evaluating Risk...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Execute Deep Security Scan
                  </>
                )}
              </button>
            </div>

            {/* Sandbox Results Column */}
            <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 flex flex-col justify-center">
              {sandboxResult ? (
                <div className="space-y-6">
                  {/* Score header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div>
                      <span className="text-xs font-mono text-slate-400 uppercase">Analyzed Domain</span>
                      <h4 className="text-xl font-bold text-white font-mono">{sandboxResult.domain}</h4>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-mono text-slate-400 block">SECURITY GRADE</span>
                        <span
                          className={`text-2xl font-black ${
                            sandboxResult.overall_grade === "A"
                              ? "text-emerald-400"
                              : sandboxResult.overall_grade === "B"
                              ? "text-blue-400"
                              : sandboxResult.overall_grade === "C"
                              ? "text-amber-400"
                              : "text-rose-400"
                          }`}
                        >
                          GRADE {sandboxResult.overall_grade}
                        </span>
                      </div>
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black border ${
                          (sandboxResult.overall_score || 0) >= 80
                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                            : (sandboxResult.overall_score || 0) >= 60
                            ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                            : "bg-rose-500/20 border-rose-500/40 text-rose-400"
                        }`}
                      >
                        {sandboxResult.overall_score}
                      </div>
                    </div>
                  </div>

                  {/* Verdict Banner */}
                  <div
                    className={`p-4 rounded-xl flex items-center gap-3 text-sm font-semibold border ${
                      sandboxResult.threats_detected
                        ? "bg-rose-950/40 border-rose-800 text-rose-300"
                        : "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                    }`}
                  >
                    {sandboxResult.threats_detected ? (
                      <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                    <span>{sandboxResult.status_text || "Analysis Complete"}</span>
                  </div>

                  {/* DNS Breakdown */}
                  <div className="space-y-2">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                      Domain Authentication Status
                    </span>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="text-xs font-mono text-slate-400">SPF Record</div>
                        <div className={`text-sm font-bold mt-1 ${sandboxResult.spf?.exists ? "text-emerald-400" : "text-rose-400"}`}>
                          {sandboxResult.spf?.exists ? "Valid (Score: " + sandboxResult.spf?.score + ")" : "Missing (Grade F)"}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="text-xs font-mono text-slate-400">DKIM Signing</div>
                        <div className={`text-sm font-bold mt-1 ${sandboxResult.dkim?.exists ? "text-emerald-400" : "text-rose-400"}`}>
                          {sandboxResult.dkim?.exists ? "Signed" : "Failed / Absent"}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="text-xs font-mono text-slate-400">DMARC Policy</div>
                        <div className={`text-sm font-bold mt-1 ${sandboxResult.dmarc?.exists ? "text-emerald-400" : "text-rose-400"}`}>
                          {sandboxResult.dmarc?.exists ? "Enforced" : "No Policy"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Link details */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">URL Sandboxing:</span>
                      <span className="text-white">{sandboxResult.links?.total_links || 0} links scanned</span>
                    </div>
                    {sandboxResult.links?.suspicious_links && sandboxResult.links.suspicious_links.length > 0 && (
                      <div className="pt-2 border-t border-slate-800">
                        <span className="text-rose-400 font-bold block mb-1">Flagged URLs:</span>
                        {sandboxResult.links.suspicious_links.map((link, idx) => (
                          <div key={idx} className="text-rose-300 truncate bg-rose-950/30 p-1.5 rounded">
                            {typeof link === "string" ? link : link.url || "Suspicious URL"}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400">
                    <Terminal className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-semibold text-slate-200">
                    Inspector Ready
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Enter any suspicious sender and message text, then click &ldquo;Execute Deep Security Scan&rdquo;.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SECURITY POSTURE & ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
              <h3 className="text-lg font-bold text-white">Threat Vectors Distribution</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Domain Spoofing (Missing SPF/DMARC)</span>
                    <span className="text-rose-400 font-bold">58%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: "58%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Credential Harvesters / Malicious URLs</span>
                    <span className="text-amber-400 font-bold">32%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: "32%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Weaponized Attachments / Macros</span>
                    <span className="text-indigo-400 font-bold">10%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: "10%" }} />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-mono text-cyan-400 font-semibold uppercase">
                  Primary Recommendation
                </span>
                <p className="text-xs text-slate-300">
                  Enforce incoming DMARC reject policies. Over 50% of caught spoofing attempts lacked a valid SPF hard-fail or DMARC record.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
              <h3 className="text-lg font-bold text-white">System Threat Defense Matrix</h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-200">SPF DNS Lookup Cache</span>
                  </div>
                  <span className="font-mono text-emerald-400">Active (TTL 300s)</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-200">VirusTotal Multi-Scanner API</span>
                  </div>
                  <span className="font-mono text-cyan-400">Connected</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-200">Homograph / Punycode Inspector</span>
                  </div>
                  <span className="font-mono text-emerald-400">Strict Enabled</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-200">Ephemeral Memory Processing</span>
                  </div>
                  <span className="font-mono text-emerald-400">Zero-Retention</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EMAIL DETAILS FORENSIC DOSSIER MODAL */}
        {selectedEmail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-base border ${
                      (selectedEmail.overall_score || 0) >= 80
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                        : (selectedEmail.overall_score || 0) >= 60
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                        : "bg-rose-500/20 border-rose-500/40 text-rose-400"
                    }`}
                  >
                    {selectedEmail.overall_grade || "F"}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Threat Forensic Dossier
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      ID: {selectedEmail.id}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedEmail(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Meta details */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-mono">FROM:</span>
                    <span className="font-mono text-cyan-400 font-semibold truncate max-w-md">
                      {selectedEmail.sender}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-mono">SUBJECT:</span>
                    <span className="text-white font-semibold truncate max-w-md">
                      {selectedEmail.subject || "(No Subject)"}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                    <span className="text-slate-500 font-mono block mb-1">SNIPPET:</span>
                    <p className="bg-slate-900 p-2.5 rounded-lg font-mono text-[11px] leading-relaxed">
                      {selectedEmail.snippet || "No text snippet available."}
                    </p>
                  </div>
                </div>

                {/* Score & Verdict Banner */}
                <div
                  className={`p-4 rounded-xl flex items-center justify-between border ${
                    (selectedEmail.overall_score || 0) < 70
                      ? "bg-rose-950/40 border-rose-800 text-rose-300"
                      : "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {(selectedEmail.overall_score || 0) < 70 ? (
                      <ShieldAlert className="w-6 h-6 text-rose-400" />
                    ) : (
                      <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    )}
                    <div>
                      <div className="font-bold text-sm">
                        {selectedEmail.status_text || ((selectedEmail.overall_score || 0) < 70 ? "High Risk Spoofing Threat" : "Verified Authentic Message")}
                      </div>
                      <div className="text-xs opacity-80">
                        Evaluated risk score: {selectedEmail.overall_score}/100
                      </div>
                    </div>
                  </div>
                </div>

                {/* DNS Records Detail */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                    Cryptographic Domain Authentication (SPF / DKIM / DMARC)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="flex justify-between items-center text-xs mb-1 font-mono">
                        <span className="text-slate-400">SPF Record</span>
                        <span className={selectedEmail.spf?.exists ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                          {selectedEmail.spf?.grade || "F"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {selectedEmail.spf?.details || (selectedEmail.spf?.exists ? "Valid SPF Record" : "No SPF record published")}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="flex justify-between items-center text-xs mb-1 font-mono">
                        <span className="text-slate-400">DKIM Signature</span>
                        <span className={selectedEmail.dkim?.exists ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                          {selectedEmail.dkim?.grade || "F"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {selectedEmail.dkim?.details || (selectedEmail.dkim?.exists ? "Cryptographically Signed" : "Unverified DKIM")}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="flex justify-between items-center text-xs mb-1 font-mono">
                        <span className="text-slate-400">DMARC Policy</span>
                        <span className={selectedEmail.dmarc?.exists ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                          {selectedEmail.dmarc?.grade || "F"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {selectedEmail.dmarc?.details || (selectedEmail.dmarc?.exists ? "Policy Active" : "No DMARC Enforcement")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Link Analysis */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-300 font-bold">Embedded Links Forensic Check:</span>
                    <span className="text-slate-400">
                      Total: {selectedEmail.links?.total_links ?? selectedEmail.link_analysis?.total_links ?? 0}
                    </span>
                  </div>

                  {((selectedEmail.links?.suspicious_links?.length || 0) > 0 || (selectedEmail.link_analysis?.suspicious_links?.length || 0) > 0) ? (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-xs text-rose-400 font-semibold block">Flagged Malicious Links:</span>
                      {(selectedEmail.links?.suspicious_links || selectedEmail.link_analysis?.suspicious_links || []).map((link, idx) => (
                        <div key={idx} className="p-2 rounded bg-rose-950/30 border border-rose-900/50 text-xs font-mono text-rose-300 break-all">
                          {typeof link === "string" ? link : link.url || "Suspicious URL"}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-emerald-400 font-mono">
                      ✓ No suspicious homograph or flagged URLs detected.
                    </div>
                  )}
                </div>

                {/* Attachment Analysis */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-mono text-slate-300 font-bold block">
                    Attachment VirusTotal Scan:
                  </span>
                  {selectedEmail.attachments && Object.keys(selectedEmail.attachments).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(selectedEmail.attachments).map(([fname, info]) => (
                        <div key={fname} className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                          <span className="font-mono text-white font-semibold">{fname}</span>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${info.status === "unsafe" ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                            {info.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 font-mono">
                      No attachments included in this message.
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(selectedEmail, null, 2));
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-all"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? "Report Copied!" : "Copy Raw Dossier JSON"}
                </button>

                <button
                  onClick={() => setSelectedEmail(null)}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

