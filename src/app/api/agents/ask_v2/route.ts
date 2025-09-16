import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import path from "path";
import fs from "fs/promises";
import { prisma } from "@/lib/prisma";

type RequestBody = {
  question?: string;
  agent?: string;
  messages?: Array<{ role: string; content: string }>;
  agentType?: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const TRIALS_FILE = path.join(DATA_DIR, "trials.json");
const SUBSCRIPTIONS_FILE = path.join(DATA_DIR, "subscriptions.json");
const MAX_FREE_QUESTIONS = Number(process.env.MAX_FREE_QUESTIONS || 15);

async function readJson(filePath: string) {
  try {
    const txt = await fs.readFile(filePath, "utf8");
    return JSON.parse(txt || "{}");
  } catch (e) {
    return null;
  }
}

async function writeJson(filePath: string, data: any) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

async function ensureTrials() {
  try {
    const s = await fs.readFile(TRIALS_FILE, "utf8");
    JSON.parse(s);
  } catch (_) {
    await writeJson(TRIALS_FILE, { trials: {} });
  }
}

async function readSubs() {
  // keep JSON fallback for older dev setups
  try {
    const rows = await prisma.subscription.findMany();
    return rows || [];
  } catch (e) {
    const js = await readJson(SUBSCRIPTIONS_FILE);
    return js?.subscribers || [];
  }
}

async function callOllama(question: string, model = "ollama3") {
  const base = process.env.OLLAMA_URL;
  if (!base) throw new Error("No OLLAMA_URL");
  const url = `${base}/v1/generate`;
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    Number(process.env.OLLAMA_TIMEOUT_MS || 15000)
  );
  const body = { model, prompt: question, max_tokens: 512 };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: controller.signal,
  });
  clearTimeout(timeout);
  if (!res.ok) throw new Error("Ollama failed");
  const js = await res.json();
  // Ollama 3+ often returns `results` array with `content` being text or chunks.
  if (js?.results && Array.isArray(js.results) && js.results.length) {
    const first = js.results[0];
    if (typeof first.content === "string") return first.content;
    if (Array.isArray(first.content)) return first.content.join("\n");
    if (first?.content?.length) return String(first.content);
  }
  if (typeof js?.text === "string") return js.text;
  return JSON.stringify(js);
}

async function callOpenAI(question: string) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("No OpenAI key");
  const url = "https://api.openai.com/v1/chat/completions";
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    Number(process.env.OPENAI_TIMEOUT_MS || 15000)
  );
  const body = {
    model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
    messages: [{ role: "user", content: question }],
    max_tokens: 500,
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: controller.signal,
  });
  clearTimeout(timeout);
  if (!res.ok) throw new Error("OpenAI failed");
  const js = await res.json();
  return js.choices?.[0]?.message?.content || "";
}

export async function POST(req: Request) {
  try {
    const auth = getAuth(req as any);
    const userId = auth.userId || null;

    // Simple in-process rate limiter to prevent accidental runaway requests.
    // Note: for production you should use Redis or another distributed store.
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "local";
    (globalThis as any).__rate_limit__ =
      (globalThis as any).__rate_limit__ || {};
    const rl = (globalThis as any).__rate_limit__;
    const now = Date.now();
    rl[ip] = rl[ip] || { ts: now, count: 0 };
    if (now - rl[ip].ts > 60_000) {
      rl[ip].ts = now;
      rl[ip].count = 0;
    }
    rl[ip].count += 1;
    if (rl[ip].count > Number(process.env.RATE_LIMIT_PER_MIN || 60)) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    const body = (await req.json()) as RequestBody;
    // Accept legacy `messages` (client sends an array) — extract the last user message
    let question = body?.question || "";
    // basic input validation
    if (typeof question !== "string") question = "";
    if (!question && Array.isArray(body?.messages)) {
      for (let i = body.messages.length - 1; i >= 0; i--) {
        const m = body.messages[i];
        if (m.role === "user" && typeof m.content === "string") {
          question = m.content;
          break;
        }
      }
    }
    const agent = body?.agent || body?.agentType || "default";

    // Protect against huge inputs
    if (question.length > Number(process.env.MAX_QUESTION_LENGTH || 2000)) {
      return NextResponse.json({ error: "Question too long" }, { status: 413 });
    }

    const userEmail =
      (auth as any)?.email || (auth as any)?.primaryEmailAddress?.email || null;
    const subs = await readSubs();
    const isSubscribed = !!subs.find(
      (s: any) => s.clerkId === userId || s.email === userEmail
    );

    // Use DB-backed trials
    const clerkId = userId || "anon";
    const trialRow = await prisma.trial
      .findUnique({ where: { clerkId_agent: { clerkId: clerkId, agent } } })
      .catch(() => null as any);
    const used = trialRow?.count || 0;
    if (!isSubscribed && used >= MAX_FREE_QUESTIONS)
      return NextResponse.json({ error: "Payment required" }, { status: 402 });

    let answer = "";
    let provider = "none";
    // Ollama first with simple provider circuit-breaker (counts failures in memory)
    (globalThis as any).__provider_failures__ = (globalThis as any)
      .__provider_failures__ || { ollama: 0, openai: 0 };
    const pf = (globalThis as any).__provider_failures__;
    const OLLAMA_FAIL_THRESHOLD = Number(
      process.env.OLLAMA_FAIL_THRESHOLD || 3
    );
    try {
      if (pf.ollama >= OLLAMA_FAIL_THRESHOLD)
        throw new Error("Ollama temporarily disabled");
      answer = await callOllama(
        question,
        process.env.OLLAMA_MODEL || "ollama3"
      );
      provider = "ollama";
      pf.ollama = 0;
    } catch (e) {
      pf.ollama = (pf.ollama || 0) + 1;
      // fallback to OpenAI
      try {
        if (pf.openai >= OLLAMA_FAIL_THRESHOLD)
          throw new Error("OpenAI temporarily disabled");
        answer = await callOpenAI(question);
        provider = "openai";
        pf.openai = 0;
      } catch (err) {
        pf.openai = (pf.openai || 0) + 1;
        return NextResponse.json(
          { error: "Upstream failure" },
          { status: 502 }
        );
      }
    }

    if (!isSubscribed) {
      // increment trial in DB (upsert)
      await prisma.trial.upsert({
        where: { clerkId_agent: { clerkId: clerkId, agent } },
        update: { count: (trialRow?.count || 0) + 1 },
        create: { clerkId: clerkId, agent, count: 1 },
      });
    }

    // Dev log: record which provider served the request and who asked
    try {
      console.log(
        "[ask_v2] provider=",
        provider,
        "userId=",
        userId,
        "email=",
        (auth as any)?.email || (auth as any)?.primaryEmailAddress?.email
      );
    } catch (e) {}

    return NextResponse.json({ answer, provider });
  } catch (e: any) {
    console.error("ask_v2 err", e);
    return NextResponse.json(
      { error: e?.message || "server error" },
      { status: 500 }
    );
  }
}
