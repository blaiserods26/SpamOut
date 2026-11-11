"use client";
import { useState, useEffect } from "react";

interface EmailAnalysisResult {
  id: string;
  snippet?: string;
  sender?: string;
  subject?: string;
  overall_score?: number;
  overall_grade?: string;
  overall_risk_score?: number;
  status_text?: string;
  security_analysis?: {
    overall_score: number;
    overall_grade: string;
  };
  links?: {
    total_links: number;
    suspicious_links: any[];
  };
  link_analysis?: {
    total_links: number;
    suspicious_links: any[];
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
}

export default function GmailListDashboard() {
  const [emailResults, setEmailResults] = useState<EmailAnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const fetchEmailResults = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/analyze_emails", {
          signal: controller.signal,
        });

        if (response.status === 401) {
          setUnauthorized(true);
          return;
        }

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        if (Array.isArray(data.results)) {
          setEmailResults(data.results);
        } else {
          setEmailResults([]);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Error fetching email results:", err);
          setError(err.message || "Failed to load emails");
        }
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    fetchEmailResults();

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6 text-center text-gray-500 dark:text-gray-400">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cyan-500 border-t-transparent mb-2"></div>
        <p>Scanning and analyzing emails...</p>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="container mx-auto p-6 text-center bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 my-4">
        <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Gmail Analysis Authorization Required</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Connect your Gmail account to enable live inbox threat scanning.
        </p>
        <a
          href="http://localhost:5000/authorize"
          className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Connect Gmail Account
        </a>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 text-center text-red-500">
        <p>Error loading email analysis: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 overflow-x-auto">
      <h1 className="text-2xl font-bold mb-4">Email Threat Analysis Results</h1>
      {emailResults.length === 0 ? (
        <p className="text-gray-500">No emails analyzed yet.</p>
      ) : (
        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-left text-xs uppercase font-medium">
              <th className="py-3 px-4 border-b">Sender</th>
              <th className="py-3 px-4 border-b">Subject</th>
              <th className="py-3 px-4 border-b">Snippet</th>
              <th className="py-3 px-4 border-b">Security Score</th>
              <th className="py-3 px-4 border-b">Grade</th>
              <th className="py-3 px-4 border-b">Links</th>
              <th className="py-3 px-4 border-b">Suspicious Links</th>
              <th className="py-3 px-4 border-b">Attachments</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
            {emailResults.map((result) => {
              const score = result.overall_score ?? result.security_analysis?.overall_score ?? 0;
              const grade = result.overall_grade ?? result.security_analysis?.overall_grade ?? "N/A";
              const links = result.links ?? result.link_analysis ?? { total_links: 0, suspicious_links: [] };
              const attachments = result.attachments ?? result.attachment_analysis ?? {};

              return (
                <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="py-2 px-4 border-b font-medium">{result.sender || "Unknown"}</td>
                  <td className="py-2 px-4 border-b">{result.subject || "(no subject)"}</td>
                  <td className="py-2 px-4 border-b text-gray-500 max-w-xs truncate">{result.snippet || "-"}</td>
                  <td className="py-2 px-4 border-b">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${score >= 80 ? "bg-green-100 text-green-800" : score >= 60 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                      {score}/100
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b font-bold">{grade}</td>
                  <td className="py-2 px-4 border-b">{links.total_links}</td>
                  <td className="py-2 px-4 border-b text-red-600 font-medium">
                    {Array.isArray(links.suspicious_links) ? links.suspicious_links.length : 0}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {Object.keys(attachments).length === 0 ? (
                      <span className="text-gray-400">None</span>
                    ) : (
                      <ul className="text-xs space-y-1">
                        {Object.entries(attachments).map(([filename, info]) => (
                          <li key={filename}>
                            <strong>{filename}:</strong> {info.status}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
