"use client";
import { useState, useEffect } from "react";

interface EmailAnalysisResult {
  id: string;
  snippet: string;
  sender: string;
  subject: string;
  overall_risk_score: number;
  security_analysis: {
    overall_score: number;
    overall_grade: string;
  };
  link_analysis: {
    total_links: number;
    suspicious_links: string[];
  };
  attachment_analysis: {
    [filename: string]: {
      status: string;
      details: string;
    };
  };
}

export default function GmailListDashboard() {
  const [emailResults, setEmailResults] = useState<EmailAnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmailResults = async () => {
      try {
        const autho = await fetch("http://127.0.0.1:5000/authorize")

        const response = await fetch("http://127.0.0.1:5000/analyze_emails");
        const data = await response.json();
        setEmailResults(data.results);
      } catch (error) {
        console.error("Error fetching email results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmailResults();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Email Analysis Results</h1>
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Sender</th>
            <th className="py-2 px-4 border-b">Subject</th>
            <th className="py-2 px-4 border-b">Snippet</th>
            <th className="py-2 px-4 border-b">Overall Risk Score</th>
            <th className="py-2 px-4 border-b">Security Score</th>
            <th className="py-2 px-4 border-b">Security Grade</th>
            <th className="py-2 px-4 border-b">Total Links</th>
            <th className="py-2 px-4 border-b">Suspicious Links</th>
            <th className="py-2 px-4 border-b">Attachments</th>
          </tr>
        </thead>
        <tbody>
          {emailResults.map((result) => (
            <tr key={result.id}>
              <td className="py-2 px-4 border-b">{result.sender}</td>
              <td className="py-2 px-4 border-b">{result.subject}</td>
              <td className="py-2 px-4 border-b">{result.snippet}</td>
              <td className="py-2 px-4 border-b">
                {result.overall_risk_score}
              </td>
              <td className="py-2 px-4 border-b">
                {result.security_analysis.overall_score}
              </td>
              <td className="py-2 px-4 border-b">
                {result.security_analysis.overall_grade}
              </td>
              <td className="py-2 px-4 border-b">
                {result.link_analysis.total_links}
              </td>
              <td className="py-2 px-4 border-b">
                {result.link_analysis.suspicious_links.length}
              </td>
              <td className="py-2 px-4 border-b">
                <ul>
                  {Object.entries(result.attachment_analysis).map(
                    ([filename, info]) => (
                      <li key={filename}>
                        {filename}: {info.status} - {info.details}
                      </li>
                    )
                  )}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
