"use client";
import React, { useState } from "react";

export default function LeadCapture({ compact }: { compact?: boolean }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company }),
      });
      const data = await res.json();
      if (data?.ok) {
        setDone(true);
      } else {
        alert(data?.error || "Unable to save lead");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="p-4 bg-green-700 rounded text-white">
        Thanks — we'll be in touch!
      </div>
    );
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-3 py-2 rounded"
        />
        <button
          type="submit"
          disabled={sending}
          className="bg-indigo-600 text-white px-4 rounded"
        >
          {sending ? "Sending" : "Get Leads"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-zinc-800 p-4 rounded">
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-3 py-2 rounded"
      />
      <input
        type="email"
        placeholder="Email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-3 py-2 rounded"
      />
      <input
        type="text"
        placeholder="Company (optional)"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        className="w-full px-3 py-2 rounded"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={sending}
          className="bg-pink-500 text-white px-4 py-2 rounded"
        >
          {sending ? "Saving..." : "Get a Free Audit"}
        </button>
      </div>
    </form>
  );
}
