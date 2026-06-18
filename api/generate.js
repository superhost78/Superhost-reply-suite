const SHEET_URL = "https://script.google.com/macros/s/AKfycbwRaINcfSu40gGXOEEsDuLj6e7IhhZ7A7K_QPOje00lnYjqsG7M7W427VXL4G-_2Fph/exec";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify(req.body)
  });

  const data = await response.json();

  try {
    const logRes = await fetch(SHEET_URL, {
      method: "POST",
      redirect: "follow",
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        tool: req.body?.messages?.[0]?.content?.slice(0, 80) || "unknown",
        status: response.status,
        model: req.body?.model || "unknown",
        ip: req.headers["x-forwarded-for"] || "unknown"
      })
    });
    console.log("Sheet log status:", logRes.status);
  } catch (err) {
    console.log("Sheet log error:", err.message);
  }

  res.status(response.status).json(data);
}
