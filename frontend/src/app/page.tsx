"use client";
import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface Email {
  id: string;
  snippet: string;
}

export default function Home() {
  const { data: session } = useSession();
  const [emails, setEmails] = useState<Email[]>([]);

  useEffect(() => {
    if (session) {
      // Fetch emails when the session is available
      fetch('/api/gmail')
        .then((res) => res.json())
        .then((data) => {
          setEmails(data.emails);
        });
    }
  }, [session]);

  if (session) {
    return (
      <div>
        <p>Signed in as {session.user?.email}</p>
        <button onClick={() => signOut()}>Sign out</button>

        <h2>Your Emails:</h2>
        {emails.length > 0 ? (
          <ul>
            {emails.map((email) => (
              <li key={email.id}>
                <strong>{email.snippet}</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p>Loading emails...</p>
        )}
      </div>
    );
  } else {
    return (
      <div>
        <p>You are not signed in.</p>
        <button onClick={() => signIn('google')}>Sign in with Google</button>
      </div>
    );
  }
}
