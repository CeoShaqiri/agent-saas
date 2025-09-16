import { NextResponse } from "next/server";

// Minimal proxy handler: forwards POSTs to /api/agents/ask_v2
export async function POST(req: Request) {
  try {
    const host = req.headers.get("host") || "localhost:3000";
    const proto = req.headers.get("x-forwarded-proto") || "http";
    const origin = `${proto}://${host}`;
    const url = new URL("/api/agents/ask_v2", origin).toString();
    const forwardRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: await req.text(),
    });
    const text = await forwardRes.text();
    const ct = forwardRes.headers.get("content-type") || "application/json";
    return new NextResponse(text, {
      status: forwardRes.status,
      headers: { "Content-Type": ct },
    });
  } catch (e: any) {
    console.error("proxy ask err", e);
    return NextResponse.json(
      { error: e?.message || "proxy error" },
      { status: 500 }
    );
  }
}
