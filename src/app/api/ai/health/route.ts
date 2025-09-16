import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const checks: any = { ollama: { ok: false }, openai: { ok: false } };
  try {
    const ollama = process.env.OLLAMA_URL;
    if (ollama) {
      const res = await global
        .fetch(`${ollama}/v1/models`)
        .catch(() => null as any);
      checks.ollama.ok = !!res && res.ok;
    }
  } catch (e) {}
  try {
    checks.openai.ok = !!process.env.OPENAI_API_KEY;
  } catch (e) {}
  return NextResponse.json({ checks });
}
