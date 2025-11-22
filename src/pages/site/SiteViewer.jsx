import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function SiteViewer() {
  const { username, usageId } = useParams();
  const toolId = "image-to-site";
  const [html, setHtml] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const sitePath = `${username}/${toolId}/${usageId}/index.html`;
        // Prefer a signed URL to avoid 400s if the bucket is private
        let siteUrl = "";
        try {
          const { data: signed } = await supabase.storage
            .from("tool-sites")
            .createSignedUrl(sitePath, 60);
          siteUrl = signed?.signedUrl || "";
        } catch {}
        if (!siteUrl) {
          const { data: pub } = supabase.storage.from("tool-sites").getPublicUrl(sitePath);
          siteUrl = pub?.publicUrl || "";
        }
        if (!siteUrl) throw new Error("Site URL not found");
        const res = await fetch(siteUrl);
        if (!res.ok) throw new Error(`Failed to load site HTML (${res.status})`);
        const text = await res.text();
        setHtml(text);
      } catch (e) {
        setError(e.message || String(e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [username, usageId]);

  if (loading) return <div style={{padding:20, color:'#555'}}>Loading site...</div>;
  if (error) return <div style={{padding:20, color:'#b91c1c'}}>Error: {error}</div>;

  // Render the HTML in an iframe via srcdoc to behave like a standalone page
  return (
    <iframe
      title="Generated Site"
      srcDoc={html}
      style={{ width: "100%", height: "100vh", border: "none" }}
    />
  );
}
