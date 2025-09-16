"use client";
import React from "react";
import { useRouter } from "next/navigation";

const agents = [
  {
    name: "Leadgen Pro",
    description: "Find and qualify leads automatically.",
    color: "from-pink-500 to-yellow-400",
    icon: "🤖",
  },
  {
    name: "Content Creator",
    description: "Generate blogs, posts, and ads in seconds.",
    color: "from-indigo-500 to-sky-400",
    icon: "📝",
  },
  {
    name: "Sales Closer",
    description: "Automate outreach and follow-ups.",
    color: "from-green-500 to-teal-400",
    icon: "💼",
  },
  {
    name: "Business Consultant",
    description: "Get instant business advice and strategy.",
    color: "from-purple-500 to-fuchsia-400",
    icon: "📊",
  },
  {
    name: "Receptionist",
    description: "Handle bookings and customer queries 24/7.",
    color: "from-orange-500 to-amber-400",
    icon: "📞",
  },
];

export default function AgentMarketplace() {
  const router = useRouter();

  function nameToKey(name: string) {
    const n = name.toLowerCase();
    if (n.includes("lead")) return "lead";
    if (n.includes("content")) return "content";
    if (n.includes("sales") || n.includes("closer")) return "sales";
    if (n.includes("consult") || n.includes("business")) return "finance";
    if (n.includes("reception")) return "lead"; // fallback
    return "lead";
  }
  return (
    <div className="max-w-5xl mx-auto py-16 animate-fade-in">
      <h1 className="text-4xl font-extrabold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400 drop-shadow-lg">
        AI Agent Marketplace
      </h1>
      <div className="text-center text-lg text-zinc-300 mb-10 max-w-2xl mx-auto">
        <span className="font-bold text-pink-400">Welcome!</span> Explore a huge
        selection of specialized, expertly trained AI agents—built for lead
        generation, sales, content, consulting, and more.{" "}
        <span className="text-indigo-300 font-bold">Sign in or sign up</span> to
        unlock full access, add agents, and supercharge your business. Your
        agency’s next big leap starts here!
        <div className="flex justify-center gap-6 mt-6">
          <a
            href="/auth/sign-in"
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-6 py-2 rounded-xl shadow-lg transition"
          >
            Sign In
          </a>
          <a
            href="/auth/sign-up"
            className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-6 py-2 rounded-xl shadow-lg transition"
          >
            Sign Up
          </a>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {agents.map((agent) => (
          <div
            key={agent.name}
            className={`rounded-3xl shadow-2xl p-8 flex flex-col items-center bg-gradient-to-br ${agent.color} hover:scale-105 transition-transform duration-300`}
          >
            <div className="text-6xl mb-4 drop-shadow-xl">{agent.icon}</div>
            <div className="text-2xl font-bold mb-2 text-white text-center">
              {agent.name}
            </div>
            <div className="text-lg text-white text-center mb-6 opacity-90">
              {agent.description}
            </div>
            <button
              className="bg-white text-indigo-600 font-bold px-6 py-2 rounded-xl shadow-lg hover:bg-indigo-100 transition"
              onClick={() => {
                try {
                  const key = nameToKey(agent.name);
                  // store a quick pointer for the chat demo and navigate to it
                  if (typeof window !== "undefined") {
                    localStorage.setItem("selected_agent", key);
                  }
                  router.push(`/agents/${encodeURIComponent(key)}`);
                } catch (e) {
                  console.error("Add agent failed", e);
                }
              }}
            >
              Add Agent
            </button>
          </div>
        ))}
      </div>
      <div className="mt-16 text-center text-zinc-400 text-lg">
        <span className="font-bold text-pink-400">Wow factor:</span> Agencies
        can mix, match, and customize agents for their business needs. More
        agents coming soon!
      </div>
    </div>
  );
}
