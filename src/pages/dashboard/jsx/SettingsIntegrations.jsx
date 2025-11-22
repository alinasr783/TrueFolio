import React, { useEffect, useState } from "react";
import { supabase, getUserSafe } from "@/lib/supabase";
import { Blocks, Globe, Github, BarChart3, CheckCircle, X, Settings as SettingsIcon, RefreshCcw } from "lucide-react";

const INTEGRATIONS = [
  { key: "supabase", name: "Supabase", icon: Blocks, description: "Database, auth, and storage integration." },
  { key: "vercel", name: "Vercel", icon: Globe, description: "Deploy previews and production hosting." },
  { key: "github", name: "GitHub", icon: Github, description: "Repository linking and automatic deployments." },
  { key: "analytics", name: "Google Analytics", icon: BarChart3, description: "Website traffic and conversion tracking." },
];

export default function SettingsIntegrations() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [savingKey, setSavingKey] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const { data: auth } = await getUserSafe();
        const u = auth?.user || null;
        if (!cancelled) setUser(u);

        // Try to load from Supabase, fallback to defaults
        let rows = [];
        if (u) {
          const { data, error } = await supabase
            .from("integrations")
            .select("key, name, connected, last_synced, settings")
            .eq("owner_id", u.id);
          if (!error && Array.isArray(data)) rows = data;
        }

        const merged = INTEGRATIONS.map((tpl) => {
          const found = rows.find((r) => r.key === tpl.key);
          return {
            key: tpl.key,
            name: tpl.name,
            description: tpl.description,
            icon: tpl.icon,
            connected: found?.connected ?? false,
            last_synced: found?.last_synced ?? null,
            settings: found?.settings ?? {},
          };
        });
        if (!cancelled) setItems(merged);
      } catch (e) {
        console.warn("[SettingsIntegrations] load fallback:", e);
        if (!cancelled) setItems(INTEGRATIONS.map((i) => ({ ...i, connected: false, last_synced: null, settings: {} })));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const toggleIntegration = async (key, connect) => {
    setSavingKey(key);
    setError("");
    try {
      setItems((arr) => arr.map((it) => it.key === key ? { ...it, connected: connect } : it));
      if (user) {
        const payload = {
          key,
          name: INTEGRATIONS.find((i) => i.key === key)?.name || key,
          connected: connect,
          owner_id: user.id,
          last_synced: connect ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        };
        const { error } = await supabase
          .from("integrations")
          .upsert(payload, { onConflict: "key" });
        if (error) throw new Error(error.message);
      }
    } catch (e) {
      console.error("[SettingsIntegrations] toggle error:", e);
      setError(e.message || String(e));
    } finally {
      setSavingKey("");
    }
  };

  const syncNow = async (key) => {
    setSavingKey(key);
    setError("");
    try {
      setItems((arr) => arr.map((it) => it.key === key ? { ...it, last_synced: new Date().toISOString() } : it));
      if (user) {
        const { error } = await supabase
          .from("integrations")
          .update({ last_synced: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq("owner_id", user.id)
          .eq("key", key);
        if (error) throw new Error(error.message);
      }
    } catch (e) {
      console.error("[SettingsIntegrations] sync error:", e);
      setError(e.message || String(e));
    } finally {
      setSavingKey("");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 ml-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Integrations</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">Connect external services to streamline deployment, data, and analytics.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 flex items-center gap-3">
              <X className="w-5 h-5" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 animate-pulse h-40"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map((it) => {
                const Icon = it.icon || SettingsIcon;
                const connected = !!it.connected;
                return (
                  <div key={it.key} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{it.name}</h2>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{it.description}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${connected ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                        {connected ? <CheckCircle className="w-3 h-3" /> : null}
                        {connected ? "Connected" : "Disconnected"}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Last synced: {it.last_synced ? new Date(it.last_synced).toLocaleString("en-US") : "Never"}
                      </div>
                      <div className="flex gap-2">
                        <button
                          disabled={savingKey === it.key}
                          onClick={() => syncNow(it.key)}
                          className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
                        >
                          <RefreshCcw className="w-4 h-4" /> Sync
                        </button>
                        {connected ? (
                          <button
                            disabled={savingKey === it.key}
                            onClick={() => toggleIntegration(it.key, false)}
                            className="px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded"
                          >
                            Disconnect
                          </button>
                        ) : (
                          <button
                            disabled={savingKey === it.key}
                            onClick={() => toggleIntegration(it.key, true)}
                            className="px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded"
                          >
                            Connect
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
