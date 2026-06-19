const SHEET_URL = "https://script.google.com/macros/s/AKfycbwRaINcfSu40gGXOEEsDuLj6e7IhhZ7A7K_QPOje00lnYjqsG7M7W427VXL4G-_2Fph/exec";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    await fetch(SHEET_URL, {
      method: "POST",
      redirect: "follow",
      body: JSON.stringify(req.body)
    });
    res.status(200).json({ok:true});
  } catch(e) {
    res.status(200).json({ok:false});
  }
}
