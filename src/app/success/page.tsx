"use client";
import React, { useEffect, useState } from "react";

export default function SuccessPage() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const sessionId = url.searchParams.get("session_id");
      if (!sessionId) {
        setError("No session id provided");
        setLoading(false);
        return;
      }
      fetch(`/api/stripe/session?session_id=${encodeURIComponent(sessionId)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.error) setError(d.error);
          else setSession(d.session || d);
        })
        .catch((e) => setError(String(e)))
        .finally(() => setLoading(false));
    } catch (e) {
      setError(String(e));
      setLoading(false);
    }
  }, []);

  if (loading) return <div className="p-8">Loading checkout details…</div>;
  if (error) return <div className="p-8 text-red-400">Error: {error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">
        Thank you — subscription started
      </h1>
      <div className="bg-zinc-800 p-6 rounded-lg">
        <div className="mb-3">
          <strong>Session ID:</strong> {session?.id}
        </div>
        <div className="mb-3">
          <strong>Customer:</strong> {session?.customer}
        </div>
        <div className="mb-3">
          <strong>Payment status:</strong>{" "}
          {session?.payment_status || session?.payment_status}
        </div>
        <div className="mb-3">
          <strong>Mode:</strong>{" "}
          {session?.mode || session?.subscription?.status}
        </div>
      </div>
      <div className="mt-6">
        <a
          href="/agent-chat-demo"
          className="bg-indigo-500 text-white px-6 py-2 rounded-lg"
        >
          Go to Agent Chat
        </a>
      </div>
    </div>
  );
}
