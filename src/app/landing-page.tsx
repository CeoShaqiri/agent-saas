import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-indigo-900 to-sky-900 text-white flex flex-col">
      <header className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <Image src="/globe.svg" alt="Logo" width={32} height={32} />
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
          The Future of SaaS Agents
        </h1>
        <p className="text-xl sm:text-2xl max-w-2xl mb-10 animate-fade-in-delay">
          Experience AI-powered agents for lead generation, content management,
          finance, sales, and more. Free, public, and ready to impress your
          clients.
        </p>
        <Link
          href="#demo"
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-4 px-8 rounded-full shadow-lg transition text-xl animate-bounce"
        >
          Try the Demo
        </Link>
        <div
          className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-5xl"
          id="agents"
        >
          <AgentCard
            title="Lead Generation"
            icon="/file.svg"
            color="from-green-400 to-blue-500"
          />
          <AgentCard
            title="Content Management"
            icon="/window.svg"
            color="from-pink-400 to-purple-500"
          />
          <AgentCard
            title="Finance"
            icon="/vercel.svg"
            color="from-yellow-400 to-orange-500"
          />
          <AgentCard
            title="Sales"
            icon="/next.svg"
            color="from-cyan-400 to-teal-500"
          />
        </div>
      </main>
      <footer className="py-8 text-center text-zinc-400" id="contact">
        &copy; 2025 aicorp. All rights reserved.
      </footer>
    </div>
  );
}

function AgentCard({
  title,
  icon,
  color,
}: {
  title: string;
  icon: string;
  color: string;
}) {
  return (
    <div
      className={`bg-gradient-to-br ${color} rounded-2xl p-8 shadow-xl flex flex-col items-center justify-center animate-float`}
    >
      <Image src={icon} alt={title} width={48} height={48} className="mb-4" />
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-base opacity-80">
        AI-powered automation for {title.toLowerCase()}.
      </p>
    </div>
  );
}
