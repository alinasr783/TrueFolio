import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, getUserSafe } from "@/lib/supabase";
import DropzoneUpload from "@/components/ui/DropzoneUpload";
import { Copy, Download, Trash2, Link as LinkIcon, Image, QrCode, History, FileText, ArrowLeft } from "lucide-react";

// Config
const PRICE_EGP = 0;
const IMAGE_BUCKET = "tool-images";
const SITE_BUCKET = "tool-sites";

// Helper: generate simple website HTML using the uploaded image URL
const cleanUrl = (u) => String(u || "").trim().replace(/`/g, "");

const generateSiteHtml = ({ title, imageUrl, imageUrls = [], username }) => {
  const urls = (imageUrls && imageUrls.length ? imageUrls : [imageUrl]).filter(Boolean).map(cleanUrl);
  const safeTitle = String(title || "").trim();
  return {
    html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle}</title>
    <meta name="robots" content="index, follow" />
    <meta name="description" content="Auto-generated website from your images." />
    <style>
      :root { color-scheme: dark; }
      * { box-sizing: border-box; }
      body { margin:0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background:#0b0f17; color:#e5e7eb; }
      .wrap { max-width: 1000px; margin: 0 auto; padding: 0; }
      .img { width: 100%; height: auto; display:block; }
      .stack { display: grid; gap: 16px; padding: 16px; }
      .credit { width:100%; background:#111827; border-top:1px solid #374151; padding:8px 12px; }
      .credit-row { display:flex; align-items:center; justify-content:center; gap:6px; }
      .credit-text { font-size:11px; color:#d1d5db; }
      .credit-link { font-size:11px; color:#818cf8; text-decoration:none; display:inline-flex; align-items:center; gap:4px; transition: color .2s ease; }
      .credit-link:hover { color:#fff; }
      .credit-icon { color:#818cf8; display:inline-flex; align-items:center; justify-content:center; transition: transform .3s ease; }
      .credit.hovered .credit-icon { transform: scale(1.2); }
      .ext { width:12px; height:12px; vertical-align:middle; }
    </style>
  </head>
  <body>
    <main class="wrap">
      <div class="stack">
        ${urls.map(u => `<img class=\"img\" src=\"${u}\" alt=\"${safeTitle || 'Image'}\" />`).join("\n        ")}
      </div>
    </main>
    <div id="dev-credit" class="credit">
      <div class="credit-row">
        <span class="credit-text">Crafted by</span>
        <span id="dev-icon" class="credit-icon" aria-hidden="true"></span>
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
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <script>
      (function(){
        var names = ['code','cpu','binary','sparkles'];
        var idx = 0; var isHovered = false;
        var iconEl = document.getElementById('dev-icon');
        var creditEl = document.getElementById('dev-credit');
        function render(){
          try {
            var svg = window.lucide && window.lucide.createIcon(names[idx % names.length]).toSvg({stroke:'currentColor'});
            if (svg) {
              iconEl.innerHTML = svg;
              var svgEl = iconEl.querySelector('svg');
              if (svgEl) { svgEl.style.width='12px'; svgEl.style.height='12px'; }
            }
          } catch (e) {}
        }
        render();
        var timer = setInterval(function(){ if (!isHovered) { idx = (idx+1)%names.length; render(); } }, 1500);
        creditEl.addEventListener('mouseenter', function(){ isHovered = true; creditEl.classList.add('hovered'); });
        creditEl.addEventListener('mouseleave', function(){ isHovered = false; creditEl.classList.remove('hovered'); });
      })();
    </script>
  </body>
</html>`
  };
};

const Popup = ({ open, title = "", message = "", onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-700 mb-4 whitespace-pre-line">{message}</p>
        <button
          onClick={onClose}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-xl"
        >
          Ok, Thanks
        </button>
      </div>
    </div>
  );
};

export default function Tool_ImageToSite() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("guest");
  const [items, setItems] = useState([]);
  const [ordinal, setOrdinal] = useState(1);
  const [saving, setSaving] = useState(false);
  const [finalSiteUrl, setFinalSiteUrl] = useState("");
  const [history, setHistory] = useState([]);
  const [title, setTitle] = useState("My Auto Site");
  const [wallet, setWallet] = useState(0);
  const [canUse, setCanUse] = useState(false);
  const [popup, setPopup] = useState({ open: false, title: "", message: "" });
  const toolId = "image-to-site";

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
          const emailLocal = (auth.user.email || "").split("@")[0] || "user";
          const rawName = emailLocal || client?.company_name || client?.first_name || "user";
          const uname = String(rawName || "user")
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9._-]/g, "-");
          setUsername(uname);
          const currentWallet = Number(client?.wallet || 0);
          setWallet(currentWallet);
          setCanUse(true);

          const { count } = await supabase
            .from("tool_instances")
            .select("id", { count: "exact" })
            .eq("client_id", auth.user.id)
            .eq("tool_id", toolId)
            .range(0, 0);
          if (typeof count === "number") {
            setOrdinal((count || 0) + 1);
          }
        }
      } catch (e) {
        console.error("[ImageToSite] init error:", e);
      }
    };
    init();
  }, []);

  const handleFilesFromDropzone = (incoming) => {
    const results = Array.isArray(incoming) ? incoming : [];
    if (!results.length) return;
    console.log("[ImageToSite] files added:", results.map(it => ({ name: it.file?.name, size: it.file?.size })));
    setItems((prev) => [...prev, ...results]);
    if (title === "My Auto Site" && results[0]?.file?.name) {
      const base = results[0].file.name.replace(/\.[^.]+$/, "");
      setTitle(base);
    }
  };

  const site = useMemo(() => {
    const origin = typeof window !== "undefined" && window.location?.origin ? window.location.origin : "https://truefolio.tech";
    const previewFriendlyUrl = finalSiteUrl || "";
    const htmlObj = generateSiteHtml({ title, imageUrls: items.map(it => it.dataUrl), username });
    return { ...htmlObj, siteUrl: finalSiteUrl || previewFriendlyUrl };
  }, [items, title, username, toolId, finalSiteUrl]);

  const downloadCombinedHtml = () => {
    const htmlObj = generateSiteHtml({ title, imageUrls: items.map(it => it.dataUrl), username });
    const blob = new Blob([htmlObj.html], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${toolId}-combined.html`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const qrUrl = useMemo(() => {
    try {
      const target = encodeURIComponent(site.siteUrl || "");
      if (!target) return "";
      return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${target}`;
    } catch {
      return "";
    }
  }, [site.siteUrl]);

  const makeQrUrl = (u) => {
    try {
      const target = encodeURIComponent(String(u || ""));
      if (!target) return "";
      return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${target}`;
    } catch {
      return "";
    }
  };

  const downloadQr = () => {
    if (!qrUrl) return;
    window.open(qrUrl, "_blank");
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
      console.warn("[ImageToSite] QR download fallback:", err);
      window.open(url, "_blank");
    }
  };

  const sanitizeFilename = (name) => name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const origin = typeof window !== "undefined" && window.location?.origin ? window.location.origin : "https://truefolio.tech";
  const friendly = (uname, usageId) => `${origin}/${uname}/${toolId}/${usageId}`;
  const toFriendlyFromStorageUrl = (u) => {
    try {
      const m = String(u || "").match(/tool-sites\/(.*?)\/image-to-site\/([^/]+)\/index\.html/);
      if (!m) return u;
      const uname = m[1];
      const usageId = m[2];
      return friendly(uname, usageId);
    } catch {
      return u;
    }
  };
  const uploadToStorage = async (bucket, path, fileData, contentType) => {
    console.log("[ImageToSite] upload start:", { bucket, path, contentType, size: fileData?.size });
    const { error } = await supabase.storage.from(bucket).upload(path, fileData, {
      upsert: true,
      cacheControl: "3600",
      contentType: contentType || "application/octet-stream",
    });
    if (error) {
      console.error("[ImageToSite] upload error:", error);
      throw error;
    }
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
    console.log("[ImageToSite] public URL:", pub);
    return pub.publicUrl;
  };

  // Ensure tools registry has this tool (helps RPCs that reference tools table)
  const ensureToolExists = async () => {
    try {
      const { data: existsData, error: existsErr } = await supabase
        .from("tools")
        .select("tool_id")
        .eq("tool_id", toolId)
        .limit(1);
      if (existsErr) {
        console.warn("[ImageToSite] Unable to check tools table:", existsErr.message || existsErr);
      }
      const exists = Array.isArray(existsData) && existsData.length > 0;
      if (!exists) {
        const { error: insertErr } = await supabase.from("tools").insert({
          tool_id: toolId,
          name: "Image to Site",
          price: PRICE_EGP,
          is_active: true,
        });
        if (insertErr) {
          console.warn("[ImageToSite] Tool insert failed (likely RLS):", insertErr.message || insertErr);
        }
      }
    } catch (e) {
      console.warn("[ImageToSite] ensureToolExists error:", e);
    }
  };

  const saveCombinedInstance = async () => {
    if (!user) return setPopup({ open: true, title: "Login Required", message: "Please sign in first." });
    if (!items.length) return setPopup({ open: true, title: "No Images", message: "Please upload at least one image." });
    

    try {
      setSaving(true);
      await ensureToolExists();
      

      // 1) Purchase instance (server assigns usage_id) with minimal retry on unique violation
      let purchaseErr, purchase;
      for (let attempt = 0; attempt < 2; attempt++) {
        const { data: pData, error: pErr } = await supabase.rpc("purchase_tool_instance", {
          p_client_id: user.id,
          p_tool_id: toolId,
          p_price: PRICE_EGP,
          p_site_url: "",
          p_source_image_url: "",
          p_title: title,
        });
        purchase = pData; purchaseErr = pErr;
        if (!purchaseErr) break;
        const msg = (purchaseErr?.message || "").toLowerCase();
        if (purchaseErr?.code === "23505" || msg.includes("usage_id") || msg.includes("unique")) {
          console.warn("[ImageToSite] purchase retry due to unique usage_id:", purchaseErr);
          await new Promise(r => setTimeout(r, 300));
          continue;
        }
        break;
      }
      if (purchaseErr) throw purchaseErr;

      // 2) Get latest usage_id
      const { data: lastInst } = await supabase
        .from("tool_instances")
        .select("id, usage_id")
        .eq("client_id", user.id)
        .eq("tool_id", toolId)
        .order("created_at", { ascending: false })
        .limit(1);
      const usageId = lastInst?.[0]?.usage_id;
      if (!usageId) throw new Error("usage_id was not found for the created record.");

      // 3) Upload images and HTML under usage_id path
      const imagePublicUrls = [];
      for (const item of items) {
        const safeName = sanitizeFilename(item.file.name || `img_${Date.now()}.png`);
        const imagePath = `${username}/${toolId}/${usageId}/${safeName}`;
        try {
          const url = await uploadToStorage(IMAGE_BUCKET, imagePath, item.file, item.file.type || "image/png");
          imagePublicUrls.push(url);
        } catch (err) {
          const msg = err?.message || String(err);
          setPopup({ open: true, title: "Image Upload Failed", message: msg });
          throw err;
        }
      }

      const sitePath = `${username}/${toolId}/${usageId}/index.html`;
      const finalHtml = generateSiteHtml({ title, imageUrls: imagePublicUrls, username }).html;
      const htmlBlob = new Blob([finalHtml], { type: "text/html; charset=utf-8" });
      try {
        await uploadToStorage(SITE_BUCKET, sitePath, htmlBlob, "text/html; charset=utf-8");
      } catch (err) {
        const msg = err?.message || String(err);
        setPopup({ open: true, title: "Page Upload Failed", message: msg });
        throw err;
      }

      // 4) Update DB with friendly URL
      const friendlyUrl = friendly(username, usageId);
      await supabase
        .from("tool_instances")
        .update({ site_url: friendlyUrl })
        .eq("id", lastInst?.[0]?.id);

      setFinalSiteUrl(friendlyUrl);
      setItems((prev) => prev.map((it) => ({ ...it, finalSiteUrl: friendlyUrl })));
      setPopup({ open: true, title: "Created", message: "The website has been created successfully." });
      await loadHistory();
    } catch (e) {
      const msg = e?.message || String(e);
      setPopup({ open: true, title: "Save Failed", message: msg });
      console.error("[ImageToSite] saveInstance error:", e);
    } finally {
      setSaving(false);
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
      console.error("[ImageToSite] history error:", error);
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
    if (!user) return setPopup({ open: true, title: "Login Required", message: "Please sign in first." });
    if (!confirm("Do you want to delete this record?")) return;
    const { error } = await supabase
      .from("tool_instances")
      .delete()
      .eq("id", id)
      .eq("client_id", user.id)
      .eq("tool_id", toolId);
    if (error) {
      console.error("[ImageToSite] delete error:", error);
      setPopup({ open: true, title: "Delete Failed", message: error.message || "" });
      return;
    }
    setPopup({ open: true, title: "Deleted", message: "The record has been deleted from history." });
    await loadHistory();
  };

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 py-8 ml-10">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 -mt-1">Image to Website</h1>
            <p className="text-gray-600 text-lg">Transform your images into a beautiful stacked website</p>
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
          {/* Left: Upload & Items */}
          <div className="xl:col-span-2 space-y-6">
            {/* Upload Section */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Image className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Upload Images</h2>
                    <p className="text-sm text-gray-600">Choose one or more images for your website</p>
                  </div>
                </div>
              </div>

              {/* Site Title Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Website Title</label>
                <input
                  className="w-full rounded-xl border border-gray-300 bg-white text-gray-900 p-3 shadow-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Awesome Website"
                />
              </div>

              {/* Dropzone */}
              <DropzoneUpload
                multiple
                accept="image/*"
                value={items}
                onFilesChange={handleFilesFromDropzone}
                className="mt-2"
                label="Drag & drop images here"
                sublabel="or click to browse"
              />

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={downloadCombinedHtml}
                  disabled={!items.length}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl disabled:opacity-50 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Download HTML
                </button>
                <button
                  onClick={saveCombinedInstance}
                  disabled={saving || !items.length}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-xl disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Site...
                    </>
                  ) : (
                    <>
                      <Image className="w-4 h-4" />
                      Create Website
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Image Previews */}
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                        <img src={item.dataUrl} alt="Preview" className="w-full h-48 object-cover" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      {item.finalSiteUrl && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Live Website:</p>
                          <a 
                            href={item.finalSiteUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-sm text-blue-600 hover:text-blue-700 break-all inline-flex items-center gap-1"
                          >
                            <LinkIcon className="w-4 h-4" />
                            {item.finalSiteUrl}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {!items.length && (
                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No images uploaded yet</h3>
                  <p className="text-gray-600">Upload some images to create your website</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Access & History */}
          <div className="space-y-6">
            {/* Current Site Access */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <QrCode className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Website Access</h2>
                  <p className="text-sm text-gray-600">Your latest generated website</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Website URL</p>
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
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">QR Code</p>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 inline-block">
                    {qrUrl ? (
                      <img src={qrUrl} alt="QR Code" className="w-40 h-40" />
                    ) : (
                      <div className="w-40 h-40 bg-gray-100 rounded flex items-center justify-center">
                        <QrCode className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={downloadQr} 
                    disabled={!qrUrl}
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
                  <History className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">History</h2>
                  <p className="text-sm text-gray-600">Your previously created websites</p>
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
                          src={makeQrUrl(row.site_url) || null}
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
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {!history.length && (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No websites created yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Popup open={popup.open} title={popup.title} message={popup.message} onClose={() => setPopup({ open: false, title: "", message: "" })} />
    </>
  );
}