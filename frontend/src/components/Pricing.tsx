"use client";
import React, { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Check, 
  Zap, 
  Sparkles, 
  Lock, 
  HelpCircle, 
  ArrowRight,
  ShieldAlert
} from "lucide-react";

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  const plans = [
    {
      name: "Community Guard",
      badge: "Free Forever",
      priceMonthly: "$0",
      priceAnnual: "$0",
      period: "free tier",
      description: "Essential zero-trust security checks for individuals and security researchers.",
      popular: false,
      features: [
        "1 Connected Gmail Inbox",
        "Up to 50 manual sandbox scans / mo",
        "SPF DNS record verification",
        "Basic DKIM signature check",
        "Standard heuristic phishing flags",
        "Read-only privacy guarantee",
      ],
      cta: "Get Started Free",
      ctaLink: "/home",
      primary: false
    },
    {
      name: "Pro Cyber Defense",
      badge: "Most Popular",
      priceMonthly: "$19",
      priceAnnual: "$15",
      period: "per month",
      description: "Continuous real-time threat defense, VirusTotal attachment scanning, and DMARC enforcement.",
      popular: true,
      features: [
        "Up to 3 Connected Gmail Inboxes",
        "Unlimited real-time email scanning",
        "Deep SPF, DKIM & DMARC policy enforcement",
        "VirusTotal multi-engine attachment sandbox",
        "Link homograph & punycode spoof detection",
        "Interactive forensic dossier inspection",
        "Instant threat alerts & mitigation steps",
        "Priority DNS resolver cache",
      ],
      cta: "Start 14-Day Pro Trial",
      ctaLink: "/login",
      primary: true
    },
    {
      name: "Enterprise Sentinel",
      badge: "For Teams & Orgs",
      priceMonthly: "$59",
      priceAnnual: "$49",
      period: "per user / month",
      description: "Full Google Workspace coverage, organization-wide threat feeds, and SIEM webhooks.",
      popular: false,
      features: [
        "Unlimited organization inboxes",
        "Google Workspace domain integration",
        "Custom threat rules & whitelist policies",
        "SIEM / Slack / PagerDuty webhook alerts",
        "Multi-engine sandbox custom API keys",
        "Team audit logs & compliance reports",
        "Dedicated security engineer support",
        "99.99% uptime SLA",
      ],
      cta: "Contact Security Sales",
      ctaLink: "/login",
      primary: false
    }
  ];

  const faqs = [
    {
      q: "Does SpamOut read or store my emails?",
      a: "No. SpamOut operates on a Zero-Data Retention model. Emails are analyzed in ephemeral memory solely for cryptographic DNS headers, link reputation, and attachment hashes, and are immediately discarded. We request read-only OAuth scopes and never store your messages."
    },
    {
      q: "How does SpamOut detect domain spoofing?",
      a: "SpamOut resolves the sender domain against authoritative DNS name servers to inspect SPF (Sender Policy Framework) mechanisms, DKIM (DomainKeys Identified Mail) cryptographic public keys, and DMARC policies (Reject, Quarantine, or None). If an email claims to be from paypal.com but fails SPF/DKIM alignment, it is flagged as Grade F."
    },
    {
      q: "Can I use SpamOut without connecting my Gmail account?",
      a: "Yes! Our Manual Sandbox Inspector lets you paste any sender email and raw message text to run on-demand deep scans without needing to connect any OAuth accounts."
    },
    {
      q: "What is the VirusTotal integration?",
      a: "Incoming email attachments have their cryptographic SHA-256 hashes generated in memory and checked against VirusTotal's database of 60+ leading antivirus engines to identify known trojans and macro malware."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 cyber-grid py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Transparent Zero-Trust Pricing
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Predictable Plans for Uncompromising Defense
          </h1>
          <p className="text-base text-slate-400">
            Choose the tier that matches your inbox volume. Cancel or adjust anytime with zero lock-in.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="pt-6 flex items-center justify-center">
            <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  billingCycle === "annual"
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Annual Billing
                <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${billingCycle === "annual" ? "bg-slate-950 text-cyan-400" : "bg-cyan-500/20 text-cyan-400"}`}>
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => {
            const price = billingCycle === "annual" ? plan.priceAnnual : plan.priceMonthly;

            return (
              <div
                key={index}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.popular
                    ? "bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/15 md:-translate-y-2"
                    : "bg-slate-900/70 border border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Popular Pill */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs uppercase tracking-wider shadow-md">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    {!plan.popular && (
                      <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider block mb-1">
                        {plan.badge}
                      </span>
                    )}
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed min-h-[36px]">
                      {plan.description}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1.5 pb-4 border-b border-slate-800">
                    <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono tracking-tight">
                      {price}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {price === "$0" ? "forever" : `/${plan.period}`}
                    </span>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider block">
                      Included Protection:
                    </span>
                    <ul className="space-y-2.5 text-xs text-slate-300">
                      {plan.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-8">
                  <Link
                    href={plan.ctaLink}
                    className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      plan.primary
                        ? "bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/25"
                        : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security FAQ Section */}
        <div className="max-w-4xl mx-auto pt-12 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-400">Everything you need to know about our privacy and threat detection methodology.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                  {faq.q}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Pricing;
