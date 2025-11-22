import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, getUserSafe } from "@/lib/supabase";

// Simple Popup component (inline, modern and minimal)
const Popup = ({ open, title = "", message = "", onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 w-[90%] max-w-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded">Close</button>
        </div>
      </div>
    </div>
  );
};

export default function Tool_QRCodeGenerator() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(true);
  const [price, setPrice] = useState(null);
  const [text, setText] = useState("");
  const [size, setSize] = useState(300);
  const [margin, setMargin] = useState(0);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [format, setFormat] = useState("png"); // png | svg | jpg
  const [copied, setCopied] = useState(false);

  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(0);
  const [canUse, setCanUse] = useState(true);
  const [popup, setPopup] = useState({ open: false, title: "", message: "" });

  const LOGO_URL = "https://i.ibb.co/cShDsKLz/upscaled-2k-image.png";
  const toolId = "qr-code-generator";

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        setLoading(true);
        // Fetch tool status and price
        const { data: toolRow, error: toolErr } = await supabase
          .from("tools")
          .select("tool_id, is_active, price")
          .eq("tool_id", toolId)
          .maybeSingle();
        if (toolErr) throw toolErr;
        if (!cancelled) {
           setActive(toolRow?.is_active ?? false);
          setPrice(0);
        }
        // Fetch user wallet
        const { data: auth } = await getUserSafe();
        if (auth?.user) {
          if (!cancelled) setUser(auth.user);
          const { data: clients, error: cErr } = await supabase
            .from("client")
            .select("id, wallet")
            .eq("id", auth.user.id)
            .limit(1);
          if (!cErr && clients?.[0]) {
            const w = Number(clients[0].wallet || 0);
            if (!cancelled) setWallet(w);
          }
        }
      } catch (e) {
        console.warn("[QR Tool] init failed", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    init();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setCanUse(active);
  }, [active]);

  const qrUrl = useMemo(() => {
    const base = "https://api.qrserver.com/v1/create-qr-code/";
    const params = new URLSearchParams();
    const cl = (hex) => (hex || "").replace("#", "");
    const s = Math.max(64, Math.min(1024, Number(size) || 300));
    const m = Math.max(0, Math.min(50, Number(margin) || 0));
    params.set("size", `${s}x${s}`);
    params.set("data", text || "");
    if (fgColor) params.set("color", cl(fgColor));
    if (bgColor) params.set("bgcolor", cl(bgColor));
    if (m) params.set("qzone", String(m));
    if (format && format !== "png") params.set("format", format);
    return `${base}?${params.toString()}`;
  }, [text, size, margin, fgColor, bgColor, format]);

  const download = async () => {
    try {
      if (!canUse) {
        setPopup({ open: true, title: "Insufficient Balance", message: "Your balance is lower than the service price. Please recharge to continue." });
        return;
      }
      const res = await fetch(qrUrl);
      if (!res.ok) throw new Error(`Failed to fetch QR (${res.status})`);
      const imgBlob = await res.blob();
      const img = await new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = URL.createObjectURL(imgBlob);
      });
      const canvas = document.createElement("canvas");
      const s = Math.max(64, Math.min(1024, Number(size) || 300));
      canvas.width = s; canvas.height = s;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, s, s);
      // Draw center logo
      const logoImg = await new Promise((resolve, reject) => {
        const li = new Image();
        li.crossOrigin = "anonymous";
        li.onload = () => resolve(li);
        li.onerror = reject;
        li.src = LOGO_URL;
      });
      const logoSize = Math.floor(s * 0.28); // 28% of QR size
      const lx = Math.floor((s - logoSize) / 2);
      const ly = Math.floor((s - logoSize) / 2);
      // Draw rounded logo
      ctx.save();
      const r = Math.floor(logoSize * 0.18);
      const path = new Path2D();
      path.moveTo(lx + r, ly);
      path.arcTo(lx + logoSize, ly, lx + logoSize, ly + logoSize, r);
      path.arcTo(lx + logoSize, ly + logoSize, lx, ly + logoSize, r);
      path.arcTo(lx, ly + logoSize, lx, ly, r);
      path.arcTo(lx, ly, lx + logoSize, ly, r);
      ctx.clip(path);
      ctx.drawImage(logoImg, lx, ly, logoSize, logoSize);
      ctx.restore();
      // Download
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "qr-with-logo.png";
      a.click();
    } catch (e) {
      console.error(e);
      setPopup({ open: true, title: "Download Failed", message: "An error occurred while downloading the image. Please try again." });
    }
  };

  const copyLink = async () => {
    try {
      if (!canUse) {
        setPopup({ open: true, title: "Insufficient Balance", message: "Your balance is lower than the service price. Please recharge to continue." });
        return;
      }
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Copy failed", e);
      setPopup({ open: true, title: "Copy Failed", message: "Failed to copy the link to the clipboard." });
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 ml-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 -mt-1">QR Code Generator</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Create customized QR codes instantly</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Service price: Free</p>
            </div>
            <button onClick={() => navigate('/dashboard/tools')} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-900 hover:bg-gray-100">
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              >
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Back to Tools
            </button>
          </div>

          {!active && (
            <div className="mb-6 p-4 border border-yellow-300 bg-yellow-50 text-yellow-800 rounded-lg dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200">
              This tool is currently disabled. Admin can activate it from Supabase.
            </div>
          )}

          {/* Config Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 relative">
              {!active && (
                <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Insufficient Balance</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">This tool is disabled.</p>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Text or URL</label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter text, URL, or any payload"
                    rows={4}
                    disabled={!canUse || !active}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Size (px)</label>
                    <input
                      type="number"
                      min={64}
                      max={1024}
                      value={size}
                      onChange={(e) => setSize(parseInt(e.target.value || "300"))}
                      disabled={!canUse || !active}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Margin</label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={margin}
                      onChange={(e) => setMargin(parseInt(e.target.value || "0"))}
                      disabled={!canUse || !active}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Foreground Color</label>
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      disabled={!canUse || !active}
                      className="w-full h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Background Color</label>
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      disabled={!canUse || !active}
                      className="w-full h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    disabled={!canUse || !active}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-60"
                  >
                    <option value="png">PNG</option>
                    <option value="svg">SVG</option>
                    <option value="jpg">JPG</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    disabled={!active || !text || loading}
                    onClick={download}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
                  >
                    Download QR
                  </button>
                  <button
                    disabled={!active || !text}
                    onClick={copyLink}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    {copied ? "Copied!" : "Copy Image Link"}
                  </button>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex items-center justify-center min-h-[360px]">
              {!text ? (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  Enter text to preview the QR code.
                </div>
              ) : (
                <div className="relative" style={{ width: size, height: size }}>
                  {format === "svg" ? (
                    <object type="image/svg+xml" data={qrUrl} aria-label="QR Code" className="max-w-full max-h-[480px]" />
                  ) : (
                    <img src={qrUrl} alt="QR Code" className="max-w-full max-h-[480px]" style={{ width: size, height: size }} />
                  )}
                  {/* Center Logo Overlay */}
                  <img
                    src={LOGO_URL}
                    alt="Center Logo"
                    className="absolute rounded-lg shadow-md"
                    style={{
                      width: Math.floor(size * 0.28),
                      height: Math.floor(size * 0.28),
                      left: Math.floor((size - Math.floor(size * 0.28)) / 2),
                      top: Math.floor((size - Math.floor(size * 0.28)) / 2),
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Help */}
          <div className="mt-8 text-xs text-gray-500 dark:text-gray-400">
            Note: This uses a public QR API. For production, you can switch to a private service or library.
          </div>
        </div>
      </div>

      <Popup open={popup.open} title={popup.title} message={popup.message} onClose={() => setPopup({ open: false, title: "", message: "" })} />
    </>
  );
}

