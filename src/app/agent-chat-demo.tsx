"use client";
import React, { useState, useEffect } from "react";
import SubscribeButton from "@/components/SubscribeButton";
import { useRouter } from "next/navigation";

const AGENT_TYPES = [
  { key: "lead", label: "Lead Generation" },
  { key: "finance", label: "Finance" },
  { key: "sales", label: "Sales" },
  { key: "content", label: "Content" },
];

export default function AgentChatDemo({
  initialAgent,
}: { initialAgent?: string } = {}) {
  const initial =
    initialAgent && AGENT_TYPES.some((a) => a.key === initialAgent)
      ? initialAgent
      : AGENT_TYPES[0].key;
  const [agentType, setAgentType] = useState<string>(initial);
  const [messages, setMessages] = useState<
    Array<{ sender: string; text: string }>
  >([
    {
      sender: "agent",
      text: `Hello! I am your ${getAgentLabel(initial)} agent. How can I help you today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tease, setTease] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const MAX_QUESTIONS = 15;

  const STORAGE_KEY_PREFIX = "agent_questions_";
  const router = useRouter();

  function getAgentLabel(key: string) {
    return AGENT_TYPES.find((a) => a.key === key)?.label || "AI";
  }

  function handleAgentChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setAgentType(e.target.value);
    setMessages([
      {
        sender: "agent",
        text: `Hello! I am your ${getAgentLabel(e.target.value)} agent. How can I help you today?`,
      },
    ]);
    // load saved count for the newly selected agent
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(
          `${STORAGE_KEY_PREFIX}${e.target.value}`
        );
        const n = saved ? parseInt(saved, 10) || 0 : 0;
        setQuestionCount(n);
        setTease(n >= MAX_QUESTIONS);
      }
    } catch (err) {
      setQuestionCount(0);
      setTease(false);
    }
  }

  // Initialize agentType from query param or localStorage if present
  useEffect(() => {
    // Respect server-provided `initialAgent` and any stored counters, but do not
    // auto-reset counters on mount. This effect only reads persisted state.
    try {
      if (typeof window === "undefined") return;
      const stored = localStorage.getItem("selected_agent");
      const candidate = initialAgent || stored || agentType;
      if (candidate && AGENT_TYPES.some((a) => a.key === candidate)) {
        setAgentType(candidate);
        setMessages([
          {
            sender: "agent",
            text: `Hello! I am your ${getAgentLabel(candidate)} agent. How can I help you today?`,
          },
        ]);
        try {
          const saved = localStorage.getItem(
            `${STORAGE_KEY_PREFIX}${candidate}`
          );
          const n = saved ? parseInt(saved, 10) || 0 : 0;
          setQuestionCount(n);
          setTease(n >= MAX_QUESTIONS);
          // persist selected agent so other flows can pick it up
          localStorage.setItem("selected_agent", candidate);
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {
      // ignore
    }
  }, [initialAgent]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || questionCount >= MAX_QUESTIONS) return;

    // Add the user's message immediately (functional update)
    setMessages((prev) => [...prev, { sender: "user", text: input }]);

    // compute deterministic next count so fallback uses correct count even if
    // async request fails or the messages state is stale due to closure
    const nextCount = questionCount + 1;

    // persist per-agent count synchronously where possible
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(
          `${STORAGE_KEY_PREFIX}${agentType}`,
          String(nextCount)
        );
      }
    } catch (err) {
      // ignore storage errors
    }
    setQuestionCount(nextCount);
    if (nextCount >= MAX_QUESTIONS) setTease(true);

    setLoading(true);

    // Call the real agent API. If it fails, fall back to the demo reply.
    (async () => {
      try {
        // Build a fresh snapshot of messages (read from current state) to avoid
        // using a stale `messages` closure. We derive the assistant/user roles
        // from the message objects.
        const snapshot = [...messages, { sender: "user", text: input }];
        const body = {
          messages: [
            {
              role: "system",
              content: `You are a helpful ${getAgentLabel(agentType)} agent.`,
            },
            ...snapshot.map((m) => ({
              role: m.sender === "user" ? "user" : "assistant",
              content: m.text,
            })),
            { role: "user", content: input },
          ],
          agentType,
        };

        const res = await fetch("/api/agents/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(
            `Agent API error: ${res.status} ${res.statusText} - ${text}`
          );
        }

        const data = await res.json().catch(async () => {
          const txt = await res.text().catch(() => "");
          throw new Error(`Invalid JSON from agent API: ${txt}`);
        });

        const reply = (
          data?.answer ||
          data?.text ||
          data?.message ||
          getAgentReply(input, nextCount, agentType)
        ).toString();

        setMessages((msgs) => {
          const newMsgs = [...msgs, { sender: "agent", text: reply }];
          if (
            newMsgs.filter((m) => m.sender === "user").length >= MAX_QUESTIONS
          )
            setTease(true);
          return newMsgs;
        });
      } catch (err: any) {
        try {
          console.error("Agent API error (details):", err);
        } catch (e) {}

        // Use deterministic nextCount for fallback so we don't keep returning the
        // very first demo message if API calls repeatedly fail.
        const fallback = getAgentReply(input, nextCount, agentType);
        setMessages((msgs) => {
          const newMsgs = [
            ...msgs,
            { sender: "agent", text: `${fallback} (Offline demo)` },
          ];
          if (
            newMsgs.filter((m) => m.sender === "user").length >= MAX_QUESTIONS
          )
            setTease(true);
          return newMsgs;
        });
      } finally {
        setLoading(false);
      }
    })();

    setInput("");
  }

  function getAgentReply(input: string, count: number, type: string) {
    if (type === "lead") {
      if (count === 1)
        return "I can help you find new leads and grow your business. Ask me about outreach strategies!";
      if (count === 2)
        return "Tip: Use LinkedIn and email campaigns for effective lead generation.";
      if (count === 3)
        return "Want to see advanced lead analytics? Subscribe for full access!";
    }
    if (type === "finance") {
      if (count === 1)
        return "I can analyze your finances and suggest optimizations. Ask me about budgeting or cash flow!";
      if (count === 2)
        return "Tip: Track expenses and automate invoicing for better results.";
      if (count === 3) return "Unlock premium finance insights by subscribing!";
    }
    if (type === "sales") {
      if (count === 1)
        return "I can help boost your sales and conversions. Ask me about sales funnels or CRM!";
      if (count === 2)
        return "Tip: Follow up with leads quickly for higher conversion rates.";
      if (count === 3) return "Get full sales analytics with a subscription!";
    }
    if (type === "content") {
      if (count === 1)
        return "I can generate content ideas and optimize your strategy. Ask me about blog topics or SEO!";
      if (count === 2) return "Tip: Consistent posting increases engagement.";
      if (count === 3) return "Unlock advanced content tools by subscribing!";
    }
    return `You said: ${input}. (Demo mode: Subscribe for unlimited questions!)`;
  }

  return (
    <div className="bg-zinc-900 rounded-2xl shadow-2xl p-8 max-w-xl mx-auto mt-12 animate-fade-in">
      <h2 className="text-2xl font-bold mb-4 text-indigo-400">
        Agent Chat Demo
      </h2>
      <div className="mb-4 flex items-center gap-4">
        <label htmlFor="agentType" className="text-indigo-300 font-semibold">
          Choose Agent:
        </label>
        <select
          id="agentType"
          value={agentType}
          onChange={handleAgentChange}
          className="bg-zinc-800 text-white px-4 py-2 rounded-xl border border-indigo-500"
          disabled={loading}
        >
          {AGENT_TYPES.map((a) => (
            <option key={a.key} value={a.key}>
              {a.label}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4 flex items-center gap-4">
        <button
          onClick={() => {
            try {
              localStorage.setItem("selected_agent", agentType);
            } catch (e) {}
            try {
              router.push("/");
            } catch (e) {
              if (typeof window !== "undefined") window.location.href = "/";
            }
          }}
          className="text-sm text-indigo-300 hover:underline"
        >
          Back to marketplace
        </button>
        <button
          onClick={() => {
            // Prevent anonymous users from silently renewing trials. Only allow
            // resets when the user explicitly confirms — we could check Clerk
            // sign-in server-side later; for now ask for confirmation.
            try {
              if (
                !confirm(
                  "Are you sure you want to reset demo attempts for this agent? This is for testing only."
                )
              )
                return;
            } catch (e) {
              // If confirm isn't available, abort
              return;
            }
            try {
              localStorage.setItem(`${STORAGE_KEY_PREFIX}${agentType}`, "0");
            } catch (e) {}
            setQuestionCount(0);
            setTease(false);
          }}
          className="text-sm text-indigo-300 hover:underline"
        >
          Renew attempts
        </button>
      </div>
      <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <span
              className={`px-4 py-2 rounded-xl ${msg.sender === "user" ? "bg-indigo-500 text-white" : "bg-zinc-800 text-indigo-200"}`}
            >
              {msg.text}
            </span>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <span className="px-4 py-2 rounded-xl bg-zinc-800 text-indigo-200 animate-pulse">
              Agent is typing...
            </span>
          </div>
        )}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          className="flex-1 px-4 py-2 rounded-xl bg-zinc-800 text-white border border-indigo-500 focus:outline-none"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            questionCount >= MAX_QUESTIONS
              ? "Subscribe for unlimited questions"
              : "Type your message..."
          }
          disabled={loading || questionCount >= MAX_QUESTIONS}
        />
        <button
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-2 rounded-xl transition"
          type="submit"
          disabled={loading || !input.trim() || questionCount >= MAX_QUESTIONS}
        >
          Send
        </button>
      </form>
      <div className="mt-4 text-indigo-300 text-sm">
        Questions left: {Math.max(0, MAX_QUESTIONS - questionCount)}
      </div>
      {tease && (
        <div className="mt-6 text-center">
          <div className="text-indigo-300 font-semibold mb-2">
            You've reached the demo limit. Subscribe for unlimited access to all
            agent features!
          </div>
          <div className="flex justify-center">
            <SubscribeButton />
          </div>
        </div>
      )}
    </div>
  );
}
