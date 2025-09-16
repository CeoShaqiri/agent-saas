const fs = require("fs");
const path = require("path");

function loadEnvFile(envPath) {
  const out = {};
  if (!fs.existsSync(envPath)) return out;
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    // strip optional surrounding quotes
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const envFile = path.resolve(__dirname, ".env.local");
const env = loadEnvFile(envFile);
const HF_TOKEN = env.HUGGINGFACE_API_TOKEN || process.env.HUGGINGFACE_API_TOKEN;
const MODEL = env.HF_MODEL || process.env.HF_MODEL || "google/flan-t5-small";

if (!HF_TOKEN) {
  console.error("Missing HUGGINGFACE_API_TOKEN in .env.local or environment.");
  process.exit(2);
}

(async () => {
  try {
    // 1) Validate token with whoami endpoint
    const whoamiUrl = "https://huggingface.co/api/whoami-v2";
    console.log("Checking token with whoami:", whoamiUrl);
    const whoamiRes = await fetch(whoamiUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${HF_TOKEN}` },
    });
    console.log("whoami status:", whoamiRes.status, whoamiRes.statusText);
    const whoamiText = await whoamiRes.text();
    try {
      console.log(
        "whoami JSON:",
        JSON.stringify(JSON.parse(whoamiText), null, 2)
      );
    } catch (e) {
      console.log("whoami raw:", whoamiText);
    }

    // 2) Call model inference
    const url = `https://api-inference.huggingface.co/models/${MODEL}`;
    console.log("Calling HuggingFace Inference API:", url);

    const body = {
      inputs: "Explain the difference between HTTP and HTTPS in one sentence.",
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("Inference status:", res.status, res.statusText);
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      console.log("Inference JSON response:", JSON.stringify(json, null, 2));
    } catch (e) {
      console.log("Inference raw response:", text);
    }
  } catch (err) {
    console.error("Request failed:", err);
    process.exit(1);
  }
})();
