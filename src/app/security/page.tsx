import React from "react";
import Link from "next/link";
import { ShieldCheck, Mail, AlertTriangle, Lock, Eye, FileText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security Policy & Responsible Disclosure | Modern Data Engineer",
  description: "Security policy, vulnerability reporting guidelines, and responsible disclosure terms for moderndataengineer.uk.",
};

export default function SecurityPage() {
  return (
    <div className="min-h-[70vh] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="border-b border-[var(--border)] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono uppercase tracking-wider mb-4 border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
            Vulnerability Disclosure & Security Policy
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)]">
            Security & Responsible Disclosure Policy
          </h1>
          <p className="mt-3 text-[var(--muted-foreground)] text-base sm:text-lg">
            We prioritize the security and confidentiality of our data systems and learners. If you discover a vulnerability, we encourage prompt and responsible disclosure.
          </p>
        </div>

        {/* Section 1: Reporting */}
        <section className="bg-[var(--surface-1)] border border-[var(--border)] rounded-xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
            <Mail className="w-5 h-5" />
            <h2 className="text-xl font-semibold text-[var(--foreground)]">Reporting a Security Vulnerability</h2>
          </div>
          <p className="text-[var(--foreground)]/90 text-sm sm:text-base leading-relaxed">
            Please report any security findings directly to our administrative team at{" "}
            <a
              href="mailto:santu.jammi@gmail.com"
              className="text-emerald-600 dark:text-emerald-400 underline hover:text-emerald-500 font-mono font-medium"
            >
              santu.jammi@gmail.com
            </a>
            . We will review and acknowledge all submissions within 48 hours.
          </p>
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg p-4 font-mono text-xs text-[var(--foreground)] space-y-1">
            <p className="text-[var(--muted-foreground)]"># Standard security.txt endpoint</p>
            <p>Canonical: https://moderndataengineer.uk/.well-known/security.txt</p>
            <p>Contact: mailto:santu.jammi@gmail.com</p>
            <p>Preferred-Languages: en</p>
          </div>
        </section>

        {/* Section 2: Ground Rules & Scope */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-xl p-6 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
              <Eye className="w-5 h-5" />
              <h3 className="font-semibold text-[var(--foreground)]">In Scope</h3>
            </div>
            <ul className="text-sm text-[var(--foreground)]/85 space-y-2 list-disc list-inside">
              <li>https://lakehousearchitect.com</li>
              <li>https://moderndataengineer.uk</li>
              <li>Authentication & authorization flaws</li>
              <li>Serverless API endpoint security vulnerabilities</li>
              <li>Cross-Site Scripting (XSS) and injection vectors</li>
              <li>Data exposure or broken access controls</li>
            </ul>
          </div>

          <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-xl p-6 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-semibold text-[var(--foreground)]">Out of Scope</h3>
            </div>
            <ul className="text-sm text-[var(--foreground)]/85 space-y-2 list-disc list-inside">
              <li>Denial of Service (DoS / DDoS) attacks</li>
              <li>Social engineering or phishing targeting operators</li>
              <li>Spam, automated volumetric fuzzing, or scraping</li>
              <li>Issues in third-party CDN or DNS infrastructure</li>
            </ul>
          </div>
        </section>

        {/* Section 3: Safe Harbor */}
        <section className="bg-[var(--surface-1)] border border-[var(--border)] rounded-xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
            <Lock className="w-5 h-5" />
            <h2 className="text-xl font-semibold text-[var(--foreground)]">Safe Harbor & Commitment</h2>
          </div>
          <p className="text-[var(--foreground)]/90 text-sm sm:text-base leading-relaxed">
            We will not pursue legal action against researchers who make a good-faith effort to avoid privacy violations, data destruction, and service degradation, and who allow reasonable time for remediation before any public disclosure.
          </p>
        </section>

        {/* Footer Navigation */}
        <div className="pt-6 border-t border-[var(--border)] flex justify-between items-center text-sm text-[var(--muted-foreground)]">
          <Link href="/" className="hover:text-[var(--foreground)] transition-colors">
            ← Back to Home
          </Link>
          <a
            href="/.well-known/security.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-medium"
          >
            <FileText className="w-4 h-4" />
            View security.txt
          </a>
        </div>
      </div>
    </div>
  );
}
