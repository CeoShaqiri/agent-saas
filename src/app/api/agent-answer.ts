import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { agent, question } = await req.json();
  // Example: Use Hugging Face Inference API
  const HF_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
  const modelMap: Record<string, string> = {
    leadgen: "mistralai/Mistral-7B-Instruct-v0.2",
    content: "google/gemma-7b-it",
    sales: "mistralai/Mistral-7B-Instruct-v0.2",
    consultant: "meta-llama/Llama-2-7b-chat-hf",
    receptionist: "google/gemma-7b-it",
  };
  const model = modelMap[agent] || "mistralai/Mistral-7B-Instruct-v0.2";

  const response = await fetch(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: question }),
    }
  );

  if (!response.ok) {
    return NextResponse.json({ error: "AI model error" }, { status: 500 });
  }
  const data = await response.json();
  // Hugging Face returns different formats; handle text output
  const answer =
    data?.[0]?.generated_text || data?.generated_text || JSON.stringify(data);
  return NextResponse.json({ answer });
}
