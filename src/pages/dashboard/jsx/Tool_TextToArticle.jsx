import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, getUserSafe } from "@/lib/supabase";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Sparkles, Globe, Type, Languages, ListChecks, Link as LinkIcon, Copy, Download, Trash2, FileText, BookOpen, Send, ArrowLeft } from "lucide-react";
// Pricing
const PRICE_EGP = 0;
const SITE_BUCKET = "tool-sites";

// Gemini API
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_API_KEY = import.meta.env?.VITE_GEMINI_API_KEY || "AIzaSyBpknrp9hVYU6zgY86QIQedSl4NmjrPCj4";

const LOGO_URL = "https://i.ibb.co/cShDsKLz/upscaled-2k-image.png";

const clean = (s) => String(s || "").trim();

// Modern Popup component (inline, consistent with QR tool style)
const Popup = ({ open, title = "", message = "", onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title || "Notification"}</h3>
        </div>
        <div className="px-5 py-4 text-gray-700 dark:text-gray-300 whitespace-pre-line">{message}</div>
        <div className="px-5 py-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded">OK</button>
        </div>
      </div>
    </div>
  );
};

const ConfirmPopup = ({ open, title = "Confirm", message = "", onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        </div>
        <div className="px-5 py-4 text-gray-700 dark:text-gray-300 whitespace-pre-line">{message}</div>
        <div className="px-5 py-4 flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded">Confirm</button>
        </div>
      </div>
    </div>
  );
};

// Build prompt for Gemini
function buildPrompt({ sourceText, sourceUrl, style, englishTone, paragraphs, keywords }) {
  const srcText = clean(sourceText);
  const srcUrl = clean(sourceUrl);
  const kw = Array.isArray(keywords)
    ? keywords
    : String(keywords || "").split(",").map((k) => clean(k)).filter(Boolean);
  const kwStr = kw.length ? `Keywords: ${kw.join(", ")}.` : "";
  const sourceBlock = srcText
    ? `Write an article based on the following text:\n\n"""\n${srcText}\n"""\n\n`
    : (srcUrl
        ? `Write an article inspired by the page at: ${srcUrl}. If direct fetching is blocked by the browser, use the general topic of the URL without verbatim copying.`
        : `Write an article on a suitable general topic.`);
  const enHint = String(englishTone || "Formal").toLowerCase().includes("american")
    ? "American English, conversational tone"
    : "Formal English, clear and professional";
  return [
    sourceBlock,
    `Requirements: Style: ${style}. Tone: ${enHint}. Paragraphs: ${paragraphs}. ${kwStr}`,
    `Formatting: Divide into clear paragraphs of 3–6 sentences each. Use simple headings if helpful. Integrate the keywords naturally without stuffing. Return plain text only (no Markdown). Language: English (use the specified tone).`,
  ].join("\n\n");
}

async function callGemini(prompt) {
  const models = [
    GEMINI_MODEL,
    "gemini-2.0-flash-latest",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro-latest",
  ];
  let lastErr = null;
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const body = {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        let msg = `Gemini error ${res.status}`;
        try {
          const errText = await res.text();
          const errObj = JSON.parse(errText);
          const apiMsg = errObj?.error?.message || "";
          if (apiMsg) msg = `${msg}: ${apiMsg}`;
        } catch {}
        throw new Error(msg);
      }
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (text) return clean(text);
      lastErr = new Error("Gemini returned empty text");
    } catch (e) {
      console.warn(`[TextToArticle] Gemini model ${model} failed:`, e);
      lastErr = e;
    }
  }
  throw lastErr || new Error("Gemini failed");
}

// Translate English article to Arabic in a chosen dialect
async function translateToArabic(text, dialect) {
  const dialectHint = String(dialect || "MSA").toLowerCase().includes("egypt") ? "Egyptian Arabic" : "Modern Standard Arabic";
  const prompt = [
    `Translate the following English article into Arabic (${dialectHint}).`,
    `Keep the structure and paragraphing. Return plain text only (no Markdown).`,
    `Avoid diacritics; keep language natural and readable.`,
    `\n\n"""\n${clean(text)}\n"""\n`
  ].join(" \n");
  return await callGemini(prompt);
}

// Generate concise English and Arabic titles for the article
async function generateTitles(articleEn) {
  const prompt = [
    `Propose compelling titles in English and Arabic for the following article.`,
    `Respond STRICTLY as JSON with keys: title_en, title_ar. Each <= 60 characters.`,
    `\n\n"""\n${clean(articleEn)}\n"""\n`
  ].join(" \n");
  const raw = await callGemini(prompt);
  try {
    const obj = JSON.parse(raw);
    return { en: clean(obj.title_en), ar: clean(obj.title_ar) };
  } catch {
    const lines = raw.split(/\r?\n/).map((l) => clean(l)).filter(Boolean);
    const en = lines.find((l) => /english|en/i.test(l)) || lines[0] || "Untitled";
    const ar = lines.find((l) => /arabic|ar/i.test(l)) || lines[1] || "Untitled";
    return { en: clean(en.replace(/^[^:]*:\s*/, "")), ar: clean(ar.replace(/^[^:]*:\s*/, "")) };
  }
}

function buildArticleHtml({ title, articleText, username }) {
  const safeTitle = clean(title) || "AI Article";
  const safeText = clean(articleText).replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle}</title>
    <meta name="robots" content="index, follow" />
    <meta name="description" content="AI-generated article" />
    <style>
      :root { color-scheme: dark; }
      * { box-sizing: border-box; }
      body { margin:0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background:#0b0f17; color:#e5e7eb; }
      .wrap { max-width: 900px; margin: 0 auto; padding: 24px; }
      h1 { font-size: 22px; margin: 0 0 16px; }
      .article { white-space: pre-wrap; line-height: 1.9; }
      .credit { width:100%; background:#111827; border-top:1px solid #374151; padding:8px 12px; margin-top:24px; }
      .credit-row { display:flex; align-items:center; justify-content:center; gap:6px; }
      .credit-text { font-size:11px; color:#d1d5db; }
      .credit-link { font-size:11px; color:#818cf8; text-decoration:none; display:inline-flex; align-items:center; gap:4px; transition: color .2s ease; }
      .credit-link:hover { color:#fff; }
      .ext { width:12px; height:12px; vertical-align:middle; }
    </style>
  </head>
  <body>
    <main class="wrap">
      <h1>${safeTitle}</h1>
      <div class="article">${safeText}</div>
    </main>
    <div class="credit">
      <div class="credit-row">
        <span class="credit-text">Crafted by</span>
        <a class="credit-link" href="https://truefolio.tech" target="_blank" rel="noopener noreferrer">
          TrueFolio
          <svg class="ext" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <path d="M15 3h6v6" />
            <path d="M10 14 21 3" />
          </svg>
        </a>
      </div>
    </div>
  </body>
</html>`;
}

export default function Tool_TextToArticle() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("guest");
  const [ordinal, setOrdinal] = useState(1);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [title, setTitle] = useState("New Article");
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [sourceType, setSourceType] = useState("text");
  const [sourceText, setSourceText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [style, setStyle] = useState("Formal");
  const [dialect, setDialect] = useState("MSA");
  const [englishTone, setEnglishTone] = useState("Formal");
  const [paragraphs, setParagraphs] = useState(5);
  const [keywordsInput, setKeywordsInput] = useState("");
  const [articleText, setArticleText] = useState("");
  const [articleTextAr, setArticleTextAr] = useState("");
  const [finalSiteUrl, setFinalSiteUrl] = useState("");
  const [history, setHistory] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [businessDetails, setBusinessDetails] = useState("");
  const [articleType, setArticleType] = useState("Educational");
  const [articleGoal, setArticleGoal] = useState("Sales");
  const [suggesting, setSuggesting] = useState(false);
  const [autoSuggestedFor, setAutoSuggestedFor] = useState("");
  const [purchasedThisRun, setPurchasedThisRun] = useState(false);
  const [popup, setPopup] = useState({ open: false, title: "", message: "" });
  const [confirmState, setConfirmState] = useState({ open: false, title: "", message: "", onConfirm: null });
  const [wallet, setWallet] = useState(0);
  const [canUse, setCanUse] = useState(true);
  const toolId = "text-to-article";

  useEffect(() => {
    const init = async () => {
      try {
        const { data: auth } = await getUserSafe();
        if (auth?.user) {
          setUser(auth.user);
          const { data: clients } = await supabase
            .from("client")
            .select("id, first_name, company_name, email, wallet")
            .eq("id", auth.user.id)
            .limit(1);
          const client = clients?.[0];
          const emailLocal = auth.user.email ? auth.user.email.split("@")[0] : "user";
          const uname = String(emailLocal || "user").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9._-]/g, "-");
          setUsername(uname);
          const w = Number(client?.wallet || 0);
          setWallet(w);
          setCanUse(w >= PRICE_EGP);

          const { count } = await supabase
            .from("tool_instances")
            .select("id", { count: "exact" })
            .eq("client_id", auth.user.id)
            .eq("tool_id", toolId)
            .range(0, 0);
          if (typeof count === "number") setOrdinal((count || 0) + 1);

          const { data: projData, error: projErr } = await supabase
            .from("project")
            .select("id, name, supabase_url, supabase_anon, blog_tabel_name, client_id, details")
            .eq("client_id", auth.user.id);
          if (!projErr) setProjects(projData || []);
        }
      } catch (e) {
        console.error("[TextToArticle] init error:", e);
      }
    };
    init();
  }, []);

  const origin = typeof window !== "undefined" && window.location?.origin ? window.location.origin : "https://truefolio.tech";
  const friendly = (uname, usageId) => `${origin}/${uname}/${toolId}/${usageId}`;

  const site = useMemo(() => {
    const previewFriendlyUrl = finalSiteUrl || "";
    return { siteUrl: finalSiteUrl || previewFriendlyUrl };
  }, [finalSiteUrl]);

  const makeQrUrl = (u) => {
    try {
      const target = encodeURIComponent(String(u || ""));
      if (!target) return "";
      return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${target}`;
    } catch {
      return "";
    }
  };

  const downloadQrFromUrl = async (url, filename = "qr.png") => {
    try {
      if (!url) return;
      const res = await fetch(url, { mode: "cors" });
      if (!res.ok) throw new Error(`Failed to fetch QR (${res.status})`);
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(href);
    } catch (err) {
      console.warn("[TextToArticle] QR download fallback:", err);
      window.open(url, "_blank");
    }
  };

  const downloadQrWithLogo = async (url, filename = "qr-with-logo.png") => {
    try {
      if (!url) return;
      const qrImg = new Image();
      qrImg.crossOrigin = "anonymous";
      qrImg.src = url;
      await new Promise((res, rej) => { qrImg.onload = res; qrImg.onerror = rej; });
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.src = LOGO_URL;
      await new Promise((res, rej) => { logoImg.onload = res; logoImg.onerror = rej; });
      const size = 600;
      const canvas = document.createElement("canvas");
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(qrImg, 0, 0, size, size);
      const center = size / 2; const radius = size * 0.12;
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath(); ctx.arc(center, center, radius, 0, Math.PI * 2); ctx.fill();
      const logoSize = radius * 1.6;
      ctx.save();
      ctx.beginPath(); ctx.arc(center, center, radius * 1.05, 0, Math.PI * 2); ctx.clip();
      ctx.drawImage(logoImg, center - logoSize / 2, center - logoSize / 2, logoSize, logoSize);
      ctx.restore();
      const href = canvas.toDataURL("image/png");
      const a = document.createElement("a"); a.href = href; a.download = filename; a.click();
    } catch (err) {
      console.warn("[TextToArticle] QR canvas download failed, fallback:", err);
      window.open(url, "_blank");
    }
  };

  const generateArticle = async () => {
    try {
      if (!canUse) {
        setPopup({ open: true, title: "Insufficient Balance", message: `Your current balance is ${wallet} EGP, and the service price is ${PRICE_EGP} EGP. Please recharge to continue.` });
        return;
      }
      setGenerating(true);
      const prompt = buildPrompt({
        sourceText,
        sourceUrl,
        style,
        englishTone,
        paragraphs,
        keywords: keywordsInput,
      });
      const text = await callGemini(prompt);
      setArticleText(text);
      try {
        const ar = await translateToArabic(text, dialect);
        setArticleTextAr(ar);
      } catch (e) {
        console.warn("[TextToArticle] Arabic translation failed:", e);
      }
      try {
        const t = await generateTitles(text);
        setTitleEn(t.en || "Untitled");
        setTitleAr(t.ar || "Untitled");
        setTitle(t.en || "Untitled");
      } catch (e) {
        console.warn("[TextToArticle] Title generation failed:", e);
        if (!title || title === "New Article") {
          const base = clean(sourceText).slice(0, 24) || clean(sourceUrl).slice(0, 24) || "Article";
          setTitle(`${base} — ${style}`);
        }
      }
    } catch (e) {
      setPopup({ open: true, title: "Generation Failed", message: e.message || String(e) });
      console.error("[TextToArticle] generate error:", e);
    } finally {
      setGenerating(false);
    }
  };

  const uploadToStorage = async (bucket, path, fileData, contentType) => {
    const { error } = await supabase.storage.from(bucket).upload(path, fileData, {
      upsert: true,
      cacheControl: "3600",
      contentType: contentType || "application/octet-stream",
    });
    if (error) throw error;
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
    return pub.publicUrl;
  };

  const ensureToolExists = async () => {
    try {
      const { data: existsData, error: existsErr } = await supabase
        .from("tools")
        .select("tool_id")
        .eq("tool_id", toolId)
        .limit(1);
      if (existsErr) {
        console.warn("[TextToArticle] Unable to check tools table:", existsErr.message || existsErr);
      }
      const exists = Array.isArray(existsData) && existsData.length > 0;
      if (!exists) {
        const { error: insertErr } = await supabase.from("tools").insert({
          tool_id: toolId,
          name: "Text to Article",
          price: PRICE_EGP,
          is_active: true,
        });
        if (insertErr) {
          console.warn("[TextToArticle] Tool insert failed (likely RLS):", insertErr.message || insertErr);
        }
      }
    } catch (e) {
      console.warn("[TextToArticle] ensureToolExists error:", e);
    }
  };

  const saveArticleInstance = async () => {
    if (!user) return setPopup({ open: true, title: "Login Required", message: "Please sign in first." });
    if (!articleText) return setPopup({ open: true, title: "Article Not Ready", message: "Please generate the article first." });
    if (!canUse) return setPopup({ open: true, title: "Insufficient Balance", message: `Your current balance is ${wallet} EGP, and the service price is ${PRICE_EGP} EGP.` });
    try {
      setSaving(true);
      await ensureToolExists();
      const { count } = await supabase
        .from("tool_instances")
        .select("id", { count: "exact" })
        .eq("client_id", user.id)
        .eq("tool_id", toolId)
        .range(0, 0);
      if (typeof count === "number") setOrdinal((count || 0) + 1);

      // refresh wallet before purchase
      const { data: clientsLatest } = await supabase
        .from("client")
        .select("wallet")
        .eq("id", user.id)
        .limit(1);
      const latestWallet = Number(clientsLatest?.[0]?.wallet || wallet);
      if (latestWallet < PRICE_EGP) {
        setWallet(latestWallet);
        setCanUse(false);
        setSaving(false);
        return setPopup({ open: true, title: "Insufficient Balance", message: `Your current balance is ${latestWallet} EGP, and the service price is ${PRICE_EGP} EGP.` });
      }

      // Defer HTML upload until usageId is assigned by the server (post-purchase)

      // Purchase instance (DB will assign a unique usage_id)
      const { data: purchase, error: purchaseErr } = await supabase.rpc("purchase_tool_instance", {
        p_client_id: user.id,
        p_tool_id: toolId,
        p_price: PRICE_EGP,
        p_site_url: "", // Will be updated after obtaining usage_id
        p_source_image_url: "",
        p_title: title,
      });
      if (purchaseErr) throw purchaseErr;

      // Fetch latest instance to get usage_id
      const { data: lastInst } = await supabase
        .from("tool_instances")
        .select("id, usage_id")
        .eq("client_id", user.id)
        .eq("tool_id", toolId)
        .order("created_at", { ascending: false })
        .limit(1);
      const usageId = lastInst?.[0]?.usage_id;
      if (!usageId) throw new Error("usage_id was not found for the created record.");
      const friendlyUrl = friendly(username, usageId);

      // Upload HTML to storage under usageId path
      const sitePath = `${username}/${toolId}/${usageId}/index.html`;
      const html = buildArticleHtml({ title, articleText, username });
      const htmlBlob = new Blob([html], { type: "text/html; charset=utf-8" });
      await uploadToStorage(SITE_BUCKET, sitePath, htmlBlob, "text/html; charset=utf-8");

      // Update DB with friendly URL structure
      await supabase
        .from("tool_instances")
        .update({ site_url: friendlyUrl })
        .eq("id", lastInst?.[0]?.id);

      setFinalSiteUrl(friendlyUrl);
      setPurchasedThisRun(true);
      setPopup({ open: true, title: "Saved", message: "The article has been saved and the service cost was deducted successfully." });
      await loadHistory();
    } catch (e) {
      const msg = e?.message || String(e);
      if (/insufficient/i.test(msg)) {
        setPopup({ open: true, title: "Insufficient Balance", message: `Insufficient funds to complete the operation. Balance: ${wallet} EGP, Price: ${PRICE_EGP} EGP.` });
      } else {
        setPopup({ open: true, title: "Save Failed", message: msg });
      }
      console.error("[TextToArticle] save error:", e);
    } finally {
      setSaving(false);
    }
  };

  const selectedProject = useMemo(() => {
    return projects.find((p) => String(p.id) === String(selectedProjectId)) || null;
  }, [projects, selectedProjectId]);

  useEffect(() => {
    setBusinessDetails(selectedProject?.details || "");
    if (selectedProject?.details && selectedProjectId && autoSuggestedFor !== selectedProjectId) {
      setAutoSuggestedFor(selectedProjectId);
      aiSuggestFromDetails();
    }
  }, [selectedProject]);

  const aiSuggestFromDetails = async () => {
    try {
      if (!selectedProject) return;
      const detailsText = String(businessDetails || "").slice(0, 6000);
      if (!detailsText) return;
      setSuggesting(true);
      const prompt = [
        `You are a content strategist. Read the following business details and propose SEO keywords and a concise source text to base the article on.`,
        `Return STRICTLY JSON with keys: keywords (array of strings), source_text (string).`,
        `Article type: ${articleType}. Primary objective: ${articleGoal}.`,
        `"""
${detailsText}
"""`
      ].join("\n\n");
      const raw = await callGemini(prompt);
      let obj = null;
      try { obj = JSON.parse(raw); } catch { obj = null; }
      if (!obj || !Array.isArray(obj.keywords) || !obj.source_text) {
        const lines = raw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
        const kws = lines.slice(0, 10);
        setKeywordsInput(kws.join(", "));
        setSourceText(detailsText);
        setSourceType("text");
      } else {
        setKeywordsInput((obj.keywords || []).join(", "));
        setSourceText(String(obj.source_text || detailsText));
        setSourceType("text");
      }
    } catch (e) {
      setPopup({ open: true, title: "Suggestion Failed", message: e.message || String(e) });
    } finally {
      setSuggesting(false);
    }
  };

  const saveToProject = async () => {
    if (!user) return setPopup({ open: true, title: "Login Required", message: "Please sign in first." });
    if (!selectedProject) return setPopup({ open: true, title: "Select a Project", message: "Please select the project you want to send to." });
    if (!articleText && !articleTextAr) return setPopup({ open: true, title: "No Content", message: "Please generate content first (English or Arabic)." });
    if (!canUse) return setPopup({ open: true, title: "Insufficient Balance", message: `Your current balance is ${wallet} EGP, and the service price is ${PRICE_EGP} EGP.` });
    try {
      setSaving(true);
      await ensureToolExists();
      if (!purchasedThisRun) {
        const { count } = await supabase
          .from("tool_instances")
          .select("id", { count: "exact" })
          .eq("client_id", user.id)
          .eq("tool_id", toolId)
          .range(0, 0);
        if (typeof count === "number") setOrdinal((count || 0) + 1);
        const { error: purchaseErr } = await supabase.rpc("purchase_tool_instance", {
          p_client_id: user.id,
          p_tool_id: toolId,
          p_price: PRICE_EGP,
          p_site_url: "",
          p_source_image_url: "",
          p_title: title,
        });
        if (purchaseErr) throw purchaseErr;
        setPurchasedThisRun(true);
      }

      const blogTable = clean(selectedProject.blog_tabel_name) || "articles";
      const remote = createSupabaseClient(clean(selectedProject.supabase_url), clean(selectedProject.supabase_anon));

      // Try combined insert first, then fall back based on errors to handle single-language tables
      const payloadCombined = {
        title_en: clean(titleEn || title),
        title_ar: clean(titleAr),
        content_en: clean(articleText),
        content_ar: clean(articleTextAr),
        image_url: null,
        show_on_homepage: true,
      };
      let insertErr = null;
      let inserted = false;

      // Attempt combined if we have at least one language content
      if (articleText || articleTextAr) {
        const { error } = await remote.from(blogTable).insert(payloadCombined);
        if (!error) {
          inserted = true;
        } else {
          insertErr = error;
        }
      }

      // If combined failed or we only want single language, try English-only then Arabic-only
      if (!inserted) {
        if (articleText) {
          const payloadEn = {
            title_en: clean(titleEn || title),
            content_en: clean(articleText),
            image_url: null,
            show_on_homepage: true,
          };
          const { error: enErr } = await remote.from(blogTable).insert(payloadEn);
          if (!enErr) {
            inserted = true;
          } else {
            insertErr = enErr;
          }
        }
        if (!inserted && articleTextAr) {
          const payloadAr = {
            title_ar: clean(titleAr || ""),
            content_ar: clean(articleTextAr),
            image_url: null,
            show_on_homepage: true,
          };
          const { error: arErr } = await remote.from(blogTable).insert(payloadAr);
          if (!arErr) {
            inserted = true;
          } else {
            insertErr = arErr;
          }
        }
      }

      if (!inserted) {
        throw insertErr || new Error("Insert into project table failed.");
      }

      setPopup({ open: true, title: "Sent", message: "The article has been sent to the selected project's database." });
    } catch (e) {
      setPopup({ open: true, title: "Send Failed", message: e.message || String(e) });
      console.error("[TextToArticle] saveToProject error:", e);
    } finally {
      setSaving(false);
    }
  };

  const toFriendlyFromStorageUrl = (u) => {
    try {
      const m = String(u || "").match(/tool-sites\/(.*?)\/text-to-article\/([^/]+)\/index\.html/);
      if (!m) return u;
      const uname = m[1];
      const usageId = m[2];
      return friendly(uname, usageId);
    } catch {
      return u;
    }
  };

  const loadHistory = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("tool_instances")
      .select("id, created_at, site_url, title")
      .eq("client_id", user.id)
      .eq("tool_id", toolId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[TextToArticle] history error:", error);
      return;
    }
    const mapped = (data || []).map((row) => ({ ...row, site_url: toFriendlyFromStorageUrl(row.site_url) }));
    setHistory(mapped);
  };

  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  const copyToClipboard = async (text) => {
    try { await navigator.clipboard.writeText(text); setPopup({ open: true, title: "Copied", message: "Link copied successfully." }); } catch {}
  };

  const deleteInstance = async (id) => {
    setConfirmState({
      open: true,
      title: "Delete Confirmation",
      message: "Do you want to delete this record?",
      onConfirm: async () => {
        setConfirmState((s) => ({ ...s, open: false }));
        const { error } = await supabase.from("tool_instances").delete().eq("id", id).eq("client_id", user.id);
        if (error) {
          setPopup({ open: true, title: "Delete Failed", message: error.message || "" });
          return;
        }
        await loadHistory();
        setPopup({ open: true, title: "Deleted", message: "The record has been deleted successfully." });
      },
    });
  };

  const qrUrl = useMemo(() => {
    try {
      const target = encodeURIComponent(site.siteUrl || "");
      if (!target) return "";
      return `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${target}`;
    } catch {
      return "";
    }
  }, [site.siteUrl]);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Wallet gate overlay (only when paid) */}
      {PRICE_EGP > 0 && !canUse && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="max-w-md w-full bg-white border border-gray-200 rounded-xl shadow-xl p-6 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Insufficient Balance</h3>
            <p className="text-gray-700">Your current balance is {wallet} EGP, and the service price is {PRICE_EGP} EGP. Please recharge to continue.</p>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 py-8 ml-10">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 -mt-1">Text to Article</h1>
            <p className="text-gray-600 text-lg">Transform text or URLs into professional articles with AI</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
              <span className="text-sm font-medium text-gray-700">Price:</span>
              <span className="text-lg font-bold text-gray-900">{PRICE_EGP === 0 ? "Free" : `${PRICE_EGP} EGP`}</span>
            </div>
          </div>
          <button onClick={() => navigate('/dashboard/tools')} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-900 hover:bg-gray-100">
            <ArrowLeft className="w-4 h-4" />
            Back to Tools
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: Inputs & Generation */}
          <div className="xl:col-span-2 space-y-6">
            {/* Main Input Section */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Article Settings</h2>
                  <p className="text-sm text-gray-600">Configure your article preferences</p>
                </div>
              </div>

              {/* Title Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    English Title
                  </label>
                  <input
                    className="w-full rounded-xl border border-gray-300 bg-white text-gray-900 p-3 shadow-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    value={titleEn}
                    onChange={(e) => { setTitleEn(e.target.value); setTitle(e.target.value); }}
                    placeholder="Article title in English"
                    disabled={!canUse}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    Arabic Title
                  </label>
                  <input
                    className="w-full rounded-xl border border-gray-300 bg-white text-gray-900 p-3 shadow-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    placeholder="Article title (Arabic)"
                    disabled={!canUse}
                  />
                </div>
              </div>

              {/* Style and Paragraphs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Writing Style
                  </label>
                  <select
                    className="w-full rounded-xl border border-gray-300 bg-white text-gray-900 p-3 shadow-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    disabled={!canUse}
                  >
                    <option>Formal</option>
                    <option>Creative</option>
                    <option>Technical</option>
                    <option>Narrative</option>
                    <option>Promotional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <ListChecks className="w-4 h-4" />
                    Paragraphs
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className="w-full rounded-xl border border-gray-300 bg-white text-gray-900 p-3 shadow-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    value={paragraphs}
                    onChange={(e) => setParagraphs(Math.max(1, Math.min(10, Number(e.target.value) || 5)))}
                    disabled={!canUse}
                  />
                </div>
              </div>

              {/* Language Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    English Tone
                  </label>
                  <select
                    className="w-full rounded-xl border border-gray-300 bg-white text-gray-900 p-3 shadow-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    value={englishTone}
                    onChange={(e) => setEnglishTone(e.target.value)}
                    disabled={!canUse}
                  >
                    <option value="Formal">Formal English</option>
                    <option value="American (Colloquial)">American English (colloquial)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    <label className="block text-gray-700 mb-1">Arabic Dialect</label>
                  </label>
                  <select
                    className="w-full rounded-xl border border-gray-300 bg-white text-gray-900 p-3 shadow-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    value={dialect}
                    onChange={(e) => setDialect(e.target.value)}
                    disabled={!canUse}
                  >
                    <option value="MSA">Modern Standard Arabic</option>
                    <option value="Egyptian">Egyptian Arabic</option>
                  </select>
                </div>
              </div>

              {/* Source Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Source Material
                </label>
                <div className="flex gap-2 mb-3">
                  <button 
                    onClick={() => setSourceType("text")} 
                    className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                      sourceType === "text" 
                        ? "bg-gray-800 text-white" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    disabled={!canUse}
                  >
                    Text
                  </button>
                  <button 
                    onClick={() => setSourceType("url")} 
                    className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                      sourceType === "url" 
                        ? "bg-gray-800 text-white" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    disabled={!canUse}
                  >
                    URL
                  </button>
                </div>
                {sourceType === "text" ? (
                  <textarea
                    className="w-full min-h-32 rounded-xl border border-gray-300 bg-white text-gray-900 p-3 shadow-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder="Paste your source text here..."
                    disabled={!canUse}
                  />
                ) : (
                  <input
                    className="w-full rounded-xl border border-gray-300 bg-white text-gray-900 p-3 shadow-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="Enter a URL to extract content from..."
                    disabled={!canUse}
                  />
                )}
              </div>

              {/* Keywords */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Keywords (comma-separated)
                </label>
                <input
                  className="w-full rounded-xl border border-gray-300 bg-white text-gray-900 p-3 shadow-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  value={keywordsInput}
                  onChange={(e) => setKeywordsInput(e.target.value)}
                  placeholder="Example: digital marketing, SEO, content strategy"
                  disabled={!canUse}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={generateArticle}
                  disabled={generating || !canUse}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-xl disabled:opacity-50 transition-colors"
                >
                  {generating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Article
                    </>
                  )}
                </button>
                <button
                  onClick={saveArticleInstance}
                  disabled={saving || !articleText || !canUse}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-xl disabled:opacity-50 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Save Article
                </button>
              </div>
            </div>

            {/* Article Previews */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Article Preview</h2>
                  <p className="text-sm text-gray-600">Generated content in both languages</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">English Version</h3>
                  {articleText ? (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">{articleText}</pre>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-8 text-center border border-dashed border-gray-300">
                      <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Generate an article to see the preview</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Arabic Version</h3>
                  {articleTextAr ? (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans" dir="rtl">{articleTextAr}</pre>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-8 text-center border border-dashed border-gray-300">
                      <Languages className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Arabic translation will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Project & History */}
          <div className="space-y-6">
            {/* Project Selection */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Send className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Save to Project</h2>
                  <p className="text-sm text-gray-600">Send article to your project database</p>
                </div>
              </div>

              <select
                className="w-full rounded-xl border border-gray-300 bg-white text-gray-900 p-3 shadow-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent mb-4"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                disabled={!canUse}
              >
                <option value="">Select a project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name || p.id}</option>
                ))}
              </select>

              {selectedProject && (
                <div className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 mb-4">
                  <div><strong>Supabase URL:</strong> {selectedProject.supabase_url}</div>
                  <div><strong>Blog Table:</strong> {selectedProject.blog_tabel_name || "articles"}</div>
                </div>
              )}

              {selectedProject && (
                <div className="space-y-3 mb-4">
                  <p className="text-sm font-medium text-gray-900">Business Details</p>
                  <textarea
                    value={businessDetails}
                    onChange={(e) => setBusinessDetails(e.target.value)}
                    rows={5}
                    className="w-full rounded-xl border border-gray-300 bg-white text-gray-900 p-3 shadow-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Project business details"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Article Type</label>
                      <select
                        value={articleType}
                        onChange={(e) => setArticleType(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white text-gray-900 p-2 shadow-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      >
                        <option>Educational</option>
                        <option>Awareness</option>
                        <option>Technical</option>
                        <option>Comparison</option>
                        <option>Sales</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Primary Objective</label>
                      <select
                        value={articleGoal}
                        onChange={(e) => setArticleGoal(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white text-gray-900 p-2 shadow-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      >
                        <option>Sales</option>
                        <option>Lead Generation</option>
                        <option>Brand Awareness</option>
                        <option>Engagement</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={aiSuggestFromDetails}
                    disabled={suggesting || !businessDetails}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-xl disabled:opacity-50"
                  >
                    {suggesting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Generating Suggestions...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        AI Suggest Keywords & Source
                      </>
                    )}
                  </button>
                </div>
              )}

              <button
                onClick={saveToProject}
                disabled={saving || !articleText || !selectedProjectId || !canUse}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-xl disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
                Save to Project
              </button>

              {PRICE_EGP > 0 && !purchasedThisRun && (
                <p className="text-xs text-gray-600 mt-2 text-center">
                  Payment required for project integration
                </p>
              )}
            </div>

            {/* Current Article Access */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <LinkIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Article Access</h2>
                  <p className="text-sm text-gray-600">Your latest generated article</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Article URL</p>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <LinkIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <a 
                      href={site.siteUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-blue-600 hover:text-blue-700 break-all text-sm flex-1"
                    >
                      {site.siteUrl}
                    </a>
                    <button 
                      onClick={() => copyToClipboard(site.siteUrl)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      disabled={!canUse}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">QR Code</p>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 inline-block relative">
                    {qrUrl ? (
                      <div className="relative w-60 h-60">
                        <img src={qrUrl} alt="QR Code" className="w-60 h-60 rounded" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md">
                            <img src={LOGO_URL} alt="Logo" className="w-12 h-12 object-contain" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-60 h-60 bg-gray-100 rounded flex items-center justify-center">
                        <LinkIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => downloadQrWithLogo(qrUrl, `qr-${username}.png`)} 
                    disabled={!qrUrl || !canUse}
                    className="w-full mt-3 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    Download QR Code
                  </button>
                </div>
              </div>
            </div>

            {/* History Section */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">History</h2>
                  <p className="text-sm text-gray-600">Previously generated articles</p>
                </div>
              </div>

              <div className="space-y-4">
                {history.map((row) => (
                  <div
                    key={row.id}
                    className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <img
                          src={makeQrUrl(row.site_url)}
                          alt="QR"
                          className="h-16 w-16 rounded-lg bg-white border border-gray-200 object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        {row.title && (
                          <div className="text-sm font-semibold text-gray-900 truncate mb-1">
                            {row.title}
                          </div>
                        )}
                        <div className="flex items-center gap-2 min-w-0 mb-2">
                          <LinkIcon className="h-3 w-3 text-gray-500 flex-shrink-0" />
                          <a
                            href={row.site_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-600 truncate"
                            title={row.site_url}
                          >
                            {row.site_url}
                          </a>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(row.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => copyToClipboard(row.site_url)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Copy URL"
                          disabled={!canUse}
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => downloadQrFromUrl(makeQrUrl(row.site_url), `qr-${row.id}.png`)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Download QR"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteInstance(row.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                          disabled={!canUse}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {!history.length && (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No articles generated yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Popup open={popup.open} title={popup.title} message={popup.message} onClose={() => setPopup({ open: false, title: "", message: "" })} />
      <ConfirmPopup 
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        onCancel={() => setConfirmState((s) => ({ ...s, open: false }))}
        onConfirm={confirmState.onConfirm || (() => setConfirmState((s) => ({ ...s, open: false })))}
      />
    </div>
  );
}
