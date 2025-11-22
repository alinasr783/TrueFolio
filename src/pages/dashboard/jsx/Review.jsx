import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Review() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [articles, setArticles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isSubscriber, setIsSubscriber] = useState(true);
  const [user, setUser] = useState(null);

  const fallbackArticles = () => {
    const base = new Date();
    const monthStr = (d) => d.toISOString().slice(0, 10);
    const mk = (idx, title, summary, content_md, tags = ["Features", "Improvements"]) => ({
      id: `sample-${idx}`,
      title,
      month: monthStr(new Date(base.getFullYear(), base.getMonth() - idx, 1)),
      summary,
      content_md,
      author: "Team",
      published_at: new Date(base.getFullYear(), base.getMonth() - idx, 2).toISOString(),
      tags,
    });
    return [
      mk(
        0,
        "October Report",
        "Highlights of new features and updates this month",
        "- Faster dashboard performance\n- Added Knowledge Library page\n- Fixes for common upload issues"
      ),
      mk(
        1,
        "September Report",
        "Updates to conversion and review tools",
        "- Improved Text-to-Article engine\n- Simplified Reviews page\n- UX improvements"
      ),
      mk(
        2,
        "August Report",
        "Monthly Maintenance services launch and early trials",
        "- Launched Monthly Maintenance plan\n- Set up monthly reports structure\n- General performance improvements"
      ),
    ];
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const { data: userRes } = await supabase.auth.getUser();
        const authedUser = userRes?.user || null;
        if (!cancelled) setUser(authedUser);

        let subscriber = true;
        if (authedUser) {
          const { data: clientRow, error: clientErr } = await supabase
            .from("client")
            .select("maintenance_active, role")
            .eq("id", authedUser.id)
            .single();
          if (!clientErr && clientRow && typeof clientRow.maintenance_active === "boolean") {
            subscriber = clientRow.maintenance_active;
          }
        }
        if (!cancelled) setIsSubscriber(subscriber);

        if (!subscriber) {
          if (!cancelled) setArticles([]);
          return;
        }

        const { data, error } = await supabase
          .from("maintenance_reports")
          .select("id, title, month, summary, content_md, author, published_at, tags")
          .order("month", { ascending: false })
          .limit(12);
        if (error) throw error;
        const arr = Array.isArray(data) && data.length ? data : fallbackArticles();
        if (!cancelled) setArticles(arr);
      } catch (e) {
        console.warn("[Review] Falling back to sample articles:", e);
        if (!cancelled) setArticles(fallbackArticles());
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const formatMonth = (m) => {
    if (!m) return "";
    const d = new Date(m);
    if (Number.isNaN(d.getTime())) return m;
    return d.toLocaleString("en-US", { month: "long", year: "numeric" });
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 ml-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Maintenance Monthly Reports</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manually written articles for monthly maintenance subscribers detailing new features.</p>
          </div>

          {user === null && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200 rounded-xl p-4">
              Please log in to view subscriber reports.
            </div>
          )}

          {user && !isSubscriber && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200 rounded-xl p-4">
              These reports are for Monthly Maintenance subscribers. Contact us to activate your subscription.
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Latest Articles</h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div>
                {articles.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400">There are no reports currently.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {articles.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => setSelected(a)}
                        className="text-left bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl p-4 transition"
                      >
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatMonth(a.month)}</p>
                        <h3 className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{a.title}</h3>
                        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{a.summary}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {selected && (
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formatMonth(selected.month)}</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{selected.title}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Written by: {selected.author || "Team"}</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Back to list
                </button>
              </div>
              <div className="mt-4 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {selected.content_md || selected.summary}
              </div>
              {Array.isArray(selected.tags) && selected.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selected.tags.map((t, i) => (
                    <span key={i} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">{t}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
