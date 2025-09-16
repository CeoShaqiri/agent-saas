"use client";
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import LeadCapture from "@/components/lead-capture";

const MAX_FREE_CREATIONS = 111;

type Message = { role: "system" | "user" | "assistant"; content: string };

export default function AgentPromoUI() {
  const [creationsLeft, setCreationsLeft] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("agent_creations_left");
      return stored ? parseInt(stored) : MAX_FREE_CREATIONS;
    }
    return MAX_FREE_CREATIONS;
  });
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [question, setQuestion] = useState("");
  const [lastAnswer, setLastAnswer] = useState<{
    question: string;
    answer: string;
  } | null>(null);
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("agent_messages");
        return raw
          ? (JSON.parse(raw) as Message[])
          : [
              {
                role: "system",
                content: "You are an expert SaaS growth consultant.",
              },
            ];
      } catch (e) {
        return [
          {
            role: "system",
            content: "You are an expert SaaS growth consultant.",
          },
        ];
      }
    }
    return [
      { role: "system", content: "You are an expert SaaS growth consultant." },
    ];
  });
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("agent_creations_left", creationsLeft.toString());
    }
  }, [creationsLeft]);

  function handleCreate() {
    if (!question.trim()) return;
    // show a temporary loading answer
    setLastAnswer({ question, answer: "Thinking..." });
    const q = question;
    setQuestion("");
    (async () => {
      try {
        // Append user message to conversation, send last messages to the API
        const newMessages: Message[] = [
          ...messages,
          { role: "user", content: q },
        ];
        // persist locally
        try {
          localStorage.setItem("agent_messages", JSON.stringify(newMessages));
        } catch (e) {}
        setMessages(newMessages);

        const res = await fetch("/api/agents/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages.slice(-8) }),
        });
        let data: any;
        try {
          data = await res.json();
        } catch (e) {
          // If response isn't JSON, fall back to text
          const text = await res.text();
          data = { error: text };
        }
        if (data?.answer) {
          // decrement free creations only when we successfully generate an answer
          if (creationsLeft > 1) {
            setCreationsLeft(creationsLeft - 1);
          } else {
            setCreationsLeft(0);
            setShowSubscribe(true);
          }
          setLastAnswer({ question: q, answer: data.answer });
          // append assistant response to conversation and persist
          const withAssistant: Message[] = [
            ...newMessages,
            { role: "assistant", content: data.answer },
          ];
          setMessages(withAssistant);
          try {
            localStorage.setItem(
              "agent_messages",
              JSON.stringify(withAssistant)
            );
          } catch (e) {}
        } else {
          // fallback simulated answer
          setLastAnswer({
            question: q,
            answer:
              data?.error ||
              "Your question was received! In this demo, your expert answer appears instantly below. In production, you’ll get immediate or fast responses from our agents—right here and by email.",
          });
        }
      } catch (err) {
        console.error("Agent request failed", err);
        setLastAnswer({
          question: q,
          answer:
            "Sorry, we couldn't reach the agent service. Please try again later or contact support.",
        });
      }
    })();
  }

  function handleFeedbackSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedbackSent(true);
    // TODO: Send feedback to backend or email
  }

  // Example professional/expert answers
  const exampleAnswers = [
    {
      question: "How can I increase my agency's lead conversion rate?",
      answer:
        "Our expert agents recommend optimizing your landing pages, using targeted outreach, and leveraging AI-driven follow-ups for best results.",
    },
    {
      question: "What's the best way to automate social media content?",
      answer:
        "Use our Content Creator agent to generate, schedule, and analyze posts across all major platforms—saving you hours every week.",
    },
    {
      question: "How do I track ROI for my campaigns?",
      answer:
        "The Analytics Dashboard provides real-time insights into campaign performance, cost, and conversion metrics for data-driven decisions.",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-sky-900 to-zinc-900 rounded-2xl shadow-2xl p-8 max-w-xl mx-auto mt-12 text-white animate-fade-in">
      <div className="mb-6 text-lg font-semibold">
        Free professional answers left:{" "}
        <span className="text-pink-400 text-3xl">{creationsLeft}</span> /{" "}
        {MAX_FREE_CREATIONS}
      </div>
      <div className="mb-6">
        <input
          className="w-full bg-zinc-800 text-white rounded-xl px-4 py-2 border border-indigo-500 mb-3"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question for an expert..."
          disabled={creationsLeft === 0}
        />
        <button
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition text-xl"
          onClick={handleCreate}
          disabled={creationsLeft === 0 || !question.trim()}
        >
          Get Expert Answer
        </button>
      </div>
      {showSubscribe && (
        <div className="mt-6 text-center">
          <div className="text-pink-400 font-bold mb-2 text-lg">
            You've reached the free limit!
          </div>
          <SubscribeButton />
          <div className="mt-2 text-zinc-300 text-sm">
            Choose a plan and unlock unlimited professional answers.
          </div>
        </div>
      )}
      <div className="mt-8">
        {lastAnswer && (
          <div className="mb-6 bg-zinc-800 rounded-xl p-4 border-2 border-pink-400">
            <div className="font-semibold text-pink-300 mb-1">
              Q: {lastAnswer.question}
            </div>
            <div className="text-white">A: {lastAnswer.answer}</div>
          </div>
        )}
        <h3 className="text-lg font-bold mb-2 text-indigo-200">
          Example Expert Answers:
        </h3>
        <ul className="space-y-4">
          {exampleAnswers.map((ex, i) => (
            <li
              key={i}
              className="bg-zinc-800 rounded-xl p-4 border border-indigo-500"
            >
              <div className="font-semibold text-pink-300 mb-1">
                Q: {ex.question}
              </div>
              <div className="text-white">A: {ex.answer}</div>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-10">
        <h3 className="text-lg font-bold mb-2 text-indigo-200">
          Contact Us – We're Here to Help!
        </h3>
        <form
          onSubmit={handleFeedbackSubmit}
          className="flex flex-col gap-4 bg-zinc-800 p-6 rounded-2xl border border-indigo-500 shadow-lg"
        >
          <input
            type="text"
            className="bg-zinc-900 text-white rounded-xl p-3 border border-pink-400 focus:border-indigo-400 outline-none"
            placeholder="Your Name"
            disabled={feedbackSent}
            required
          />
          <input
            type="email"
            className="bg-zinc-900 text-white rounded-xl p-3 border border-pink-400 focus:border-indigo-400 outline-none"
            placeholder="Your Email"
            disabled={feedbackSent}
            required
          />
          <textarea
            className="bg-zinc-900 text-white rounded-xl p-3 border border-pink-400 focus:border-indigo-400 outline-none"
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="How can we help you? Ask us anything, request features, or just say hi!"
            disabled={feedbackSent}
            required
          />
          <button
            type="submit"
            className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition"
            disabled={feedbackSent}
          >
            {feedbackSent ? "Thank you for reaching out!" : "Send Message"}
          </button>
        </form>
        <div className="mt-4 text-zinc-300 text-center text-sm">
          We reply fast and love to help. Your message goes straight to our
          team!
        </div>
      </div>
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-2 text-indigo-200">
          Or get a free audit
        </h3>
        <LeadCapture />
      </div>
    </div>
  );
}

function SubscribeButton() {
  const [loading, setLoading] = useState(false);
  const { isSignedIn, user } = useUser();

  async function handleSubscribe() {
    setLoading(true);
    try {
      if (!isSignedIn) {
        // Redirect to sign-in so Clerk can attach user metadata to the checkout
        window.location.href = "/auth/sign-in";
        return;
      }
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Include Clerk user email and id so webhook can attach subscriber
        body: JSON.stringify({
          email:
            // primaryEmailAddress isn't always set in every Clerk SDK version
            user?.primaryEmailAddress?.emailAddress ||
            user?.emailAddresses?.[0]?.emailAddress ||
            null,
          user_id: user?.id || null,
        }),
      });
      const data = await res.json();
      if (data?.url) {
        // Redirect browser to Stripe Checkout
        window.location.href = data.url;
      } else if (data?.sessionId) {
        // Fallback: open checkout using session id if url not returned
        window.location.href = `/success?session_id=${data.sessionId}`;
      } else {
        alert("Unable to start checkout. Please try again later.");
      }
    } catch (err) {
      console.error("Checkout error", err);
      alert("Checkout failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition text-lg disabled:opacity-60"
    >
      {loading ? "Starting checkout..." : "Subscribe to a Plan"}
    </button>
  );
}
