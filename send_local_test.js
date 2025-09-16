const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function tryPost(url, body, retries = 10, delay = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      console.log("LOCAL STATUS:", res.status, res.statusText);
      try {
        console.log("LOCAL JSON:", JSON.stringify(JSON.parse(text), null, 2));
      } catch (e) {
        console.log("LOCAL BODY:", text);
      }
      return;
    } catch (err) {
      console.error("Attempt", i + 1, "failed:", err.message || err);
      await wait(delay);
    }
  }
  console.error("All attempts failed");
}

(async () => {
  const url = "http://localhost:3001/api/agents/ask";
  await tryPost(
    url,
    { question: "What is the best way to increase lead conversion rate?" },
    12,
    500
  );
})();
