Superhost Reply Suite
src/App.jsx — paste this entire file into GitHub
import { useState, useEffect } from "react";
import { LS_CHECKOUT_URL, TRIAL_DAYS, getTrialStart, getTrialDaysRemaining, isPaywalled } from "./config.js";
// ■■ Design tokens ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
const C = {
teal: "#0D9488", tealDark: "#0F766E", tealLight: "#CCFBF1", tealGhost: "#F0FDFA",
sand: "#FAFAF7", ink: "#111827", muted: "#6B7280", border: "#E5E7EB", white: "#FFFFFF",
redSoft: "#FEF2F2", redBorder: "#FECACA", red: "#DC2626",
amber: "#D97706", amberSoft: "#FFFBEB", amberBorder: "#FDE68A",
green: "#059669", greenSoft: "#ECFDF5", greenBorder: "#A7F3D0",
purple: "#7C3AED", purpleSoft: "#F5F3FF", purpleBorder: "#DDD6FE",
};
const TOOLS = [
{ id: "bad", label: "Bad Review", icon: "■", color: C.red, headline: "Turn a bad review into a trust signal", { id: "positive", label: "Positive Review", icon: "■", color: C.amber, headline: "Say thank you like you mean it", { id: "neutral", label: "Neutral Review", icon: "■", color: C.teal, headline: "The 3-star review is the sneakiest threat", { id: "dispute", label: "Dispute & Flag", icon: "■■", color: C.purple, headline: "Build your escalation case — word by word", sub: "Future gu
sub: "Hosts w
sub: "A lukew
sub: "Use the
];
const TONES = ["Professional", "Warm", "Firm", "Apologetic"];
const TONE_ICONS = { Professional: "■", Warm: "■", Firm: "■■", Apologetic: "■■" };
const BAD_ISSUES = ["Cleanliness complaint","Amenity not as described","Noise complaint","Check-in issue","Host communication","Safety concern (unf
const DISPUTE_GROUNDS = ["Retaliatory review after dispute","Review violates Airbnb content policy","Guest caused damage and reviewed negatively",
// ■■ Prompt builders ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
function buildPrompt(toolId, f) {
const prop = f.propertyName ? ` for "${f.propertyName}"` : "";
if (toolId === "bad") return `You are an expert Airbnb Superhost consultant. Generate a ${f.tone.toLowerCase()} public response to this bad revie
Complaint: ${f.issueType}
Review: "${f.review}"
Rules: Under 200 words. ${f.tone === "Firm" ? "Politely correct inaccuracies." : ""} ${f.tone === "Apologetic" ? "Acknowledge with genuine empathy
if (toolId === "positive") return `You are an expert Airbnb Superhost consultant. Generate a ${f.tone.toLowerCase()} public thank-you response to
Review: "${f.review}"
${f.stayHighlights ? `Host notes: ${f.stayHighlights}` : ""}
Rules: Under 150 words. Reference something specific from the review. Sound like a real person. Invite them back. Do NOT start with 'Thank you so m
if (toolId === "neutral") return `You are an expert Airbnb Superhost consultant. Generate a thoughtful public response to this neutral/mixed revi
Review: "${f.review}"
${f.yourContext ? `Context (do not quote directly): ${f.yourContext}` : ""}
Rules: Under 180 words. Acknowledge what they enjoyed, address what fell short without being defensive. Turn lukewarm into a trust signal. Write ON
if (toolId === "dispute") return `You are an expert Airbnb dispute specialist. Write a formal review removal request to Airbnb support${prop}.
Grounds: ${f.disputeGround}
Review: "${f.review}"
${f.yourContext ? `Evidence: ${f.yourContext}` : ""}
Rules: Under 300 words. Open with clear policy violation statement. Quote relevant review language. Reference Airbnb Review Policy. Factual and cal
}
// ■■ Reusable components ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
function FieldLabel({ children, optional }) {
return <label style={{ fontSize: "13px", fontWeight: "600", color: C.ink, marginBottom: "6px", display: "block" }}>{children}{optional && <span s
}
function Input({ value, onChange, placeholder }) {
return <input value={value} onChange={onChange} placeholder={placeholder} style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius
}
function Textarea({ value, onChange, placeholder, rows = 5, max = 1000 }) {
return <div><textarea value={value} onChange={e => onChange(e.target.value.slice(0, max))} placeholder={placeholder} rows={rows} style={{ width:
}
function Select({ value, onChange, options, placeholder }) {
return <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: "
}
function ToneSelector({ tone, setTone }) {
return <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>{TONES.map(t => <div key={t} onClick={() => setTone(t)} style={{ padding:
function GenerateBtn({ can, loading, onClick, label = "Generate Response →" }) {
return <button onClick={onClick} disabled={!can || loading} style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "none", backgr
}
}
function OutputCard({ output, onRegenerate, onCopy, copied }) {
return <div style={{ background: C.white, border: `1.5px solid ${C.teal}`, borderRadius: "14px", padding: "24px", marginTop: "20px", boxShadow:
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
<div style={{ fontSize: "11px", fontWeight: "700", color: C.tealDark, letterSpacing: "0.8px", textTransform: "uppercase" }}>✦ Your response<
<button onClick={onCopy} style={{ padding: "7px 14px", background: C.tealLight, color: C.tealDark, border: "none", borderRadius: "7px", fontS
</div>
<div style={{ fontSize: "15px", color: C.ink, lineHeight: "1.8", whiteSpace: "pre-wrap" }}>{output}</div>
<div style={{ height: "1px", background: C.border, margin: "18px 0" }} />
<button onClick={onRegenerate} style={{ width: "100%", padding: "11px", background: C.tealGhost, color: C.tealDark, border: `1px solid ${C.teal
<div style={{ background: C.tealLight, border: `1px solid ${C.teal}`, borderRadius: "10px", padding: "11px 14px", fontSize: "13px", color: C.te
</div>;
}
// ■■ Paywall modal ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
function PaywallModal({ onClose }) {
return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyConte
<div style={{ background: C.white, borderRadius: "20px", padding: "36px 28px", maxWidth: "420px", width: "100%", textAlign: "center", animation
<div style={{ fontSize: "40px", marginBottom: "12px" }}>■</div>
<div style={{ fontSize: "22px", fontWeight: "800", color: C.ink, letterSpacing: "-0.4px", marginBottom: "8px" }}>You've used your free respon
<div style={{ fontSize: "14px", color: C.muted, lineHeight: "1.6", marginBottom: "24px" }}>Unlock unlimited responses across all four tools —
<div style={{ background: C.tealGhost, border: `1px solid ${C.tealLight}`, borderRadius: "14px", padding: "20px", marginBottom: "24px" }}>
<div style={{ fontSize: "32px", fontWeight: "800", color: C.teal, letterSpacing: "-1px" }}>$12<span style={{ fontSize: "16px", fontWeight:
<div style={{ fontSize: "13px", color: C.muted, marginTop: "4px" }}>Cancel anytime</div>
<div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "8px", textAlign: "left" }}>
{["Unlimited responses across all 4 tools","Bad review responses that protect your reputation","Positive & neutral review replies","Profe
</div>
</div>
<a href={LS_CHECKOUT_URL} target="_blank" rel="noopener noreferrer" style={{ display: "block", width: "100%", padding: "15px", background: `l
<button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, fontSize: "13px", cursor: "pointer" }}>Maybe later</bu
</div>
</div>;
}
// ■■ Landing page ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
function LandingPage({ onGetStarted }) {
return <div style={{ minHeight: "100vh", background: C.sand }}>
<div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "16px 28px", display: "flex", alignItems: "center", justifyC
<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
<div style={{ width: "34px", height: "34px", background: `linear-gradient(135deg, ${C.teal} 0%, ${C.tealDark} 100%)`, borderRadius: "9px",
<div>
<div style={{ fontSize: "16px", fontWeight: "800", color: C.ink, letterSpacing: "-0.4px" }}>Superhost Reply Suite</div>
<div style={{ fontSize: "11px", color: C.muted, letterSpacing: "0.4px", textTransform: "uppercase" }}>AI Review Toolkit</div>
</div>
</div>
<button onClick={onGetStarted} style={{ padding: "9px 18px", background: C.teal, color: C.white, border: "none", borderRadius: "8px", fontSi
</div>
<div style={{ maxWidth: "680px", margin: "0 auto", padding: "60px 24px 80px", textAlign: "center" }}>
<div style={{ display: "inline-block", background: C.tealLight, color: C.tealDark, fontSize: "12px", fontWeight: "600", padding: "5px 12px",
<h1 style={{ fontSize: "40px", fontWeight: "800", color: C.ink, letterSpacing: "-1px", lineHeight: "1.15", marginBottom: "16px" }}>Stop losin
<p style={{ fontSize: "16px", color: C.muted, lineHeight: "1.65", marginBottom: "36px", maxWidth: "480px", margin: "0 auto 36px" }}>Generate
<button onClick={onGetStarted} style={{ padding: "16px 36px", background: `linear-gradient(135deg, ${C.teal} 0%, ${C.tealDark} 100%)`, color
<div style={{ fontSize: "13px", color: C.muted }}>No credit card required · $12/month after trial</div>
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "56px", textAlign: "left" }}>
{[
{ icon: "■", title: "Bad Review Response", desc: "Turn a 1-star nightmare into a trust signal for future guests." },
{ icon: "■", title: "Positive Review Reply", desc: "Thank guests in a way that feels personal, not automated." },
{ icon: "■", title: "Neutral Review Follow-up", desc: "The 3-star review is the sneakiest threat. Handle it right." },
{ icon: "■■", title: "Dispute & Flag Drafter", desc: "Build a formal Airbnb removal request using their own policy." },
].map(f => <div key={f.title} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "18px" }}>
<div style={{ fontSize: "22px", marginBottom: "8px" }}>{f.icon}</div>
<div style={{ fontSize: "14px", fontWeight: "700", color: C.ink, marginBottom: "4px" }}>{f.title}</div>
<div style={{ fontSize: "13px", color: C.muted, lineHeight: "1.5" }}>{f.desc}</div>
</div>)}
</div>
<div style={{ marginTop: "56px", background: C.white, border: `1px solid ${C.border}`, borderRadius: "16px", padding: "32px" }}>
<div style={{ fontSize: "28px", fontWeight: "800", color: C.teal, letterSpacing: "-0.5px", marginBottom: "4px" }}>$12<span style={{ fontSi
<div style={{ fontSize: "14px", color: C.muted, marginBottom: "20px" }}>Unlimited responses · Cancel anytime</div>
<button onClick={onGetStarted} style={{ padding: "14px 28px", background: `linear-gradient(135deg, ${C.teal} 0%, ${C.tealDark} 100%)`, colo
</div>
</div>
</div>;
}
// ■■ Tool panels ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
function BadReviewTool({ onGenerate, loading, output, copied, onCopy }) {
const [review, setReview] = useState(""); const [issueType, setIssueType] = useState(""); const [tone, setTone] = useState("Professional"); const
const can = review.trim().length > 10 && !!issueType;
const prompt = () => buildPrompt("bad", { review, tone, propertyName, issueType });
return <div>
<div style={{ marginBottom: "14px" }}><FieldLabel optional>Property name</FieldLabel><Input value={propertyName} onChange={e => setPropertyName
<div style={{ marginBottom: "14px" }}><FieldLabel>Complaint type</FieldLabel><Select value={issueType} onChange={setIssueType} options={BAD_ISS
<div style={{ marginBottom: "14px" }}><FieldLabel>Guest review</FieldLabel><Textarea value={review} onChange={setReview} placeholder="Paste the
<div style={{ marginBottom: "18px" }}><FieldLabel>Response tone</FieldLabel><ToneSelector tone={tone} setTone={setTone} /></div>
<GenerateBtn can={can} loading={loading} onClick={() => onGenerate(prompt())} />
{output && <OutputCard output={output} onRegenerate={() => onGenerate(prompt())} onCopy={onCopy} copied={copied} />}
</div>;
}
function PositiveReviewTool({ onGenerate, loading, output, copied, onCopy }) {
const [review, setReview] = useState(""); const [tone, setTone] = useState("Warm"); const [propertyName, setPropertyName] = useState(""); const
const can = review.trim().length > 10;
const prompt = () => buildPrompt("positive", { review, tone, propertyName, stayHighlights });
return <div>
<div style={{ marginBottom: "14px" }}><FieldLabel optional>Property name</FieldLabel><Input value={propertyName} onChange={e => setPropertyName
<div style={{ marginBottom: "14px" }}><FieldLabel>Guest review</FieldLabel><Textarea value={review} onChange={setReview} placeholder="Paste the
<div style={{ marginBottom: "14px" }}><FieldLabel optional>Anything specific to highlight?</FieldLabel><Input value={stayHighlights} onChange=
<div style={{ marginBottom: "18px" }}><FieldLabel>Response tone</FieldLabel><ToneSelector tone={tone} setTone={setTone} /></div>
<GenerateBtn can={can} loading={loading} onClick={() => onGenerate(prompt())} />
{output && <OutputCard output={output} onRegenerate={() => onGenerate(prompt())} onCopy={onCopy} copied={copied} />}
</div>;
}
function NeutralReviewTool({ onGenerate, loading, output, copied, onCopy }) {
const [review, setReview] = useState(""); const [tone, setTone] = useState("Professional"); const [propertyName, setPropertyName] = useState("")
const can = review.trim().length > 10;
const prompt = () => buildPrompt("neutral", { review, tone, propertyName, yourContext });
return <div>
<div style={{ marginBottom: "14px" }}><FieldLabel optional>Property name</FieldLabel><Input value={propertyName} onChange={e => setPropertyName
<div style={{ marginBottom: "14px" }}><FieldLabel>Guest review</FieldLabel><Textarea value={review} onChange={setReview} placeholder="Paste the
<div style={{ marginBottom: "14px" }}><FieldLabel optional>What you've since fixed or context</FieldLabel><Input value={yourContext} onChange=
<div style={{ marginBottom: "18px" }}><FieldLabel>Response tone</FieldLabel><ToneSelector tone={tone} setTone={setTone} /></div>
<GenerateBtn can={can} loading={loading} onClick={() => onGenerate(prompt())} />
{output && <OutputCard output={output} onRegenerate={() => onGenerate(prompt())} onCopy={onCopy} copied={copied} />}
</div>;
}
function DisputeTool({ onGenerate, loading, output, copied, onCopy }) {
const [review, setReview] = useState(""); const [disputeGround, setDisputeGround] = useState(""); const [propertyName, setPropertyName] = useStat
const can = review.trim().length > 10 && !!disputeGround;
const prompt = () => buildPrompt("dispute", { review, disputeGround, propertyName, yourContext });
return <div>
<div style={{ background: C.purpleSoft, border: `1px solid ${C.purpleBorder}`, borderRadius: "10px", padding: "12px 14px", marginBottom: "18px
<div style={{ marginBottom: "14px" }}><FieldLabel optional>Property name</FieldLabel><Input value={propertyName} onChange={e => setPropertyName
<div style={{ marginBottom: "14px" }}><FieldLabel>Grounds for dispute</FieldLabel><Select value={disputeGround} onChange={setDisputeGround} opt
<div style={{ marginBottom: "14px" }}><FieldLabel>The review you want removed</FieldLabel><Textarea value={review} onChange={setReview} placeho
<div style={{ marginBottom: "18px" }}><FieldLabel optional>Your evidence or context</FieldLabel><Textarea value={yourContext} onChange={setYour
<GenerateBtn can={can} loading={loading} label="Draft Dispute Message →" onClick={() => onGenerate(prompt())} />
{output && <OutputCard output={output} onRegenerate={() => onGenerate(prompt())} onCopy={onCopy} copied={copied} />}
</div>;
}
// ■■ Main app ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
export default function App() {
const [page, setPage] = useState("landing");
const [activeTool, setActiveTool] = useState("bad");
const [loading, setLoading] = useState(false);
const [outputs, setOutputs] = useState({ bad: "", positive: "", neutral: "", dispute: "" });
const [copied, setCopied] = useState(false);
const [error, setError] = useState("");
const [showPaywall, setShowPaywall] = useState(false);
const [daysRemaining, setDaysRemaining] = useState(TRIAL_DAYS);
useEffect(() => { getTrialStart(); setDaysRemaining(getTrialDaysRemaining()); }, []);
const tool = TOOLS.find(t => t.id === activeTool);
const handleGenerate = async (prompt) => {
if (isPaywalled()) { setShowPaywall(true); return; }
setLoading(true); setError("");
try {
const res = await fetch("https://api.anthropic.com/v1/messages", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
});
const data = await res.json();
const text = data.content?.map(b => b.text || "").join("").trim();
if (text) {
setOutputs(prev => ({ ...prev, [activeTool]: text }));
setDaysRemaining(getTrialDaysRemaining());
} else { setError("Something went wrong. Please try again."); }
} catch { setError("Connection error. Please try again."); }
finally { setLoading(false); }
};
const handleCopy = () => { navigator.clipboard.writeText(outputs[activeTool]); setCopied(true); setTimeout(() => setCopied(false), 2000); };
if (page === "landing") return <LandingPage onGetStarted={() => setPage("app")} />;
const sharedProps = { onGenerate: handleGenerate, loading, output: outputs[activeTool], copied, onCopy: handleCopy };
return <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: C.sand, minHeight: "100vh" }}>
{showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
<div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "16px 28px", display: "flex", alignItems: "center", justifyC
<div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => setPage("landing")}>
<div style={{ width: "34px", height: "34px", background: `linear-gradient(135deg, ${C.teal} 0%, ${C.tealDark} 100%)`, borderRadius: "9px",
<div>
<div style={{ fontSize: "16px", fontWeight: "800", color: C.ink, letterSpacing: "-0.4px" }}>Superhost Reply Suite</div>
<div style={{ fontSize: "11px", color: C.muted, letterSpacing: "0.4px", textTransform: "uppercase" }}>AI Review Toolkit</div>
</div>
</div>
{daysRemaining > 0
? <div style={{ background: C.tealLight, color: C.tealDark, fontSize: "12px", fontWeight: "600", padding: "5px 12px", borderRadius: "20px"
: <a href={LS_CHECKOUT_URL} target="_blank" rel="noopener noreferrer" style={{ background: `linear-gradient(135deg, ${C.teal} 0%, ${C.tealD
}
</div>
<div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 28px", display: "flex", gap: "0", overflowX: "auto" }}>
{TOOLS.map(t => <button key={t.id} onClick={() => { setActiveTool(t.id); setError(""); }} style={{ padding: "14px 18px", border: "none", back
<span>{t.icon}</span> {t.label}
{outputs[t.id] && <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: C.teal, display: "inline-block" }} />}
</button>)}
</div>
<div style={{ maxWidth: "680px", margin: "0 auto", padding: "32px 20px 80px" }}>
<div style={{ marginBottom: "28px" }}>
<div style={{ fontSize: "11px", fontWeight: "700", color: tool.color, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px
<div style={{ fontSize: "24px", fontWeight: "800", color: C.ink, letterSpacing: "-0.5px", lineHeight: "1.25", marginBottom: "6px" }}>{tool
<div style={{ fontSize: "14px", color: C.muted, lineHeight: "1.55" }}>{tool.sub}</div>
</div>
<div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "14px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,
{activeTool === "bad" && <BadReviewTool {...sharedProps} />}
{activeTool === "positive" && <PositiveReviewTool {...sharedProps} />}
{activeTool === "neutral" && <NeutralReviewTool {...sharedProps} />}
{activeTool === "dispute" && <DisputeTool {...sharedProps} />}
</div>
{error && <div style={{ background: C.redSoft, border: `1px solid ${C.redBorder}`, borderRadius: "10px", padding: "12px 14px", marginTop: "14
<div style={{ textAlign: "center", marginTop: "40px", fontSize: "12px", color: C.muted }}>Superhost Reply Suite · Built for serious hosts</di
</div>
</div>;
}
