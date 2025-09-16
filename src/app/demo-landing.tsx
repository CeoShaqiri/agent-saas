import React from "react";
import Link from "next/link";
import AgentChatDemo from "./agent-chat-demo";
import DemoAnalytics from "./demo-analytics";

export default function DemoLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-indigo-900 to-sky-900 text-white flex flex-col">
      <header className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl tracking-tight">
            Aria S2C Agents
          </span>
        </div>
        <nav className="flex gap-6 text-lg">
          <Link href="#agents" className="hover:text-indigo-400 transition">
            Agents
          </Link>
          <Link href="#demo" className="hover:text-indigo-400 transition">
            Demo
          </Link>
          <Link href="#contact" className="hover:text-indigo-400 transition">
            Contact
          </Link>
        </nav>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-5xl sm:text-7xl font-extrabold mb-6 animate-fade-in">
          Try AI Agents Free
        </h1>
        <p className="text-xl sm:text-2xl max-w-2xl mb-10 animate-fade-in-delay">
          Agencies: Experience lead generation, content, finance, and sales
          agents in real time. No login required. Demo, customize, and impress
          your clients.
        </p>
        <Link
          href="#demo"
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-4 px-8 rounded-full shadow-lg transition text-xl animate-bounce"
        >
          Try Free Demo
        </Link>
        <div
          className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-5xl"
          id="agents"
        >
          <AgentCard
            title="Lead Generation"
            color="from-green-400 to-blue-500"
          />
          <AgentCard
            title="Content Management"
            color="from-pink-400 to-purple-500"
          />
          <AgentCard title="Finance" color="from-yellow-400 to-orange-500" />
          <AgentCard title="Sales" color="from-cyan-400 to-teal-500" />
        </div>
        <div
          id="demo"
          className="w-full flex flex-col items-center justify-center"
        >
          <AgentChatDemo />
          <DemoAnalytics />
        </div>
      </main>
      <footer className="py-8 text-center text-zinc-400" id="contact">
        &copy; 2025 aicorp. All rights reserved.
      </footer>
    </div>
  );
}

type AgentCardProps = {
  title: string;
  color: string;
};

function AgentCard({ title, color }: AgentCardProps) {
  return (
    <div
      className={`bg-gradient-to-br ${color} rounded-2xl p-8 shadow-xl flex flex-col items-center justify-center animate-float`}
    >
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-base opacity-80">
        AI-powered automation for {title.toLowerCase()}.
      </p>
    </div>
  );
}
