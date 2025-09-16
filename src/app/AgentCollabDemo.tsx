"use client";
import React, { useState } from "react";

const agents = [
  { name: "Leadgen Pro", icon: "🤖" },
  { name: "Content Creator", icon: "📝" },
  { name: "Sales Closer", icon: "💼" },
  { name: "Business Consultant", icon: "📊" },
  { name: "Receptionist", icon: "📞" },
];

const users = [
  { name: "Alice", avatar: "🧑‍💼" },
  { name: "Bob", avatar: "🧑‍💻" },
];

export default function AgentCollabDemo() {
  const [selectedAgent, setSelectedAgent] = useState(agents[0].name);
  const [messages, setMessages] = useState([
    { sender: "Alice", text: "Let's find new leads!" },
    { sender: "Leadgen Pro", text: "I found 10 new leads for you." },
  ]);
  const [input, setInput] = useState("");

  function sendMessage() {
    if (!input.trim()) return;
    setMessages([...messages, { sender: "You", text: input }]);
    setInput("");
    // Simulate agent reply
    setTimeout(() => {
      setMessages((msgs) => [
        ...msgs,
        {
          sender: selectedAgent,
          text: `Agent ${selectedAgent} is working on it!`,
        },
      ]);
    }, 800);
  }

  return (
    <div className="max-w-2xl mx-auto my-16 p-8 bg-gradient-to-br from-indigo-900 via-sky-900 to-zinc-900 rounded-2xl shadow-2xl text-white animate-fade-in">
      <h2 className="text-2xl font-bold mb-4 text-indigo-300 text-center">
        Real-Time Team Collaboration Demo
      </h2>
      <div className="flex gap-4 mb-6 justify-center">
        {agents.map((agent) => (
          <button
            key={agent.name}
            className={`px-4 py-2 rounded-xl font-bold text-lg shadow-lg transition border-2 ${
              selectedAgent === agent.name
                ? "bg-pink-500 border-pink-400"
                : "bg-zinc-800 border-zinc-700"
            }`}
            onClick={() => setSelectedAgent(agent.name)}
          >
            <span className="mr-2">{agent.icon}</span>
            {agent.name}
          </button>
        ))}
      </div>
      <div className="bg-zinc-800 rounded-xl p-4 mb-4 h-64 overflow-y-auto flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xl">
              {users.find((u) => u.name === msg.sender)?.avatar || "🤖"}
            </span>
            <span
              className={`font-bold ${
                msg.sender === "You" ? "text-pink-400" : "text-indigo-200"
              }`}
            >
              {msg.sender}:
            </span>
            <span className="">{msg.text}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 bg-zinc-700 text-white rounded-xl px-4 py-2 border border-indigo-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-6 py-2 rounded-xl transition"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
      <div className="mt-6 text-zinc-400 text-center text-sm">
        Multiple users and agents can chat and collaborate in real time.
      </div>
    </div>
  );
}
