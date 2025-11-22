import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LibraryKnowledge() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = ["All", "Guides", "Tutorials", "FAQs", "Articles"];

  const sampleItems = [
    { id: 1, title: "Getting Started Guide", category: "Guides", description: "Overview and steps to get started quickly.", updated_at: new Date().toISOString() },
    { id: 2, title: "Deploy to Vercel", category: "Tutorials", description: "Step-by-step tutorial to deploy your app.", updated_at: new Date().toISOString() },
    { id: 3, title: "Supabase Storage Basics", category: "Articles", description: "Best practices for storing and serving files.", updated_at: new Date().toISOString() },
    { id: 4, title: "FAQ: Billing & Payments", category: "FAQs", description: "Common questions about billing and invoices.", updated_at: new Date().toISOString() },
    { id: 5, title: "Optimize Images", category: "Guides", description: "Improve performance with proper image handling.", updated_at: new Date().toISOString() },
    { id: 6, title: "Troubleshooting 400 Errors", category: "Articles", description: "How to debug storage and viewer issues.", updated_at: new Date().toISOString() },
  ];

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("knowledge_articles")
          .select("id, title, category, description, updated_at")
          .order("updated_at", { ascending: false });
        if (error) throw error;
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        console.warn("[LibraryKnowledge] Falling back to sample items:", e);
        if (!cancelled) setItems(sampleItems);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return (items || []).filter((it) => {
      const matchCat = category === "All" || it.category === category;
      const matchText = !s || `${it.title} ${it.description}`.toLowerCase().includes(s);
      return matchCat && matchText;
    });
  }, [items, search, category]);

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 ml-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Knowledge Library</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Guides, tutorials, FAQs, and articles to help you succeed</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 w-full sm:max-w-md">
                <input
                  type="text"
                  placeholder="Search knowledge..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`px-3 py-1.5 rounded-lg text-sm border ${category === c ? "bg-blue-600 text-white border-blue-600" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden animate-pulse">
                  <div className="h-32 bg-gray-300 dark:bg-gray-700" />
                  <div className="p-6 space-y-3">
                    <div className="h-6 w-2/3 bg-gray-300 dark:bg-gray-700 rounded" />
                    <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded" />
                    <div className="h-4 w-4/5 bg-gray-300 dark:bg-gray-700 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((it) => (
                <div key={it.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{it.title}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">{it.category}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{it.description}</p>
                    <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">Updated {new Date(it.updated_at).toLocaleDateString()}</div>
                    <div className="mt-4">
                      <button className="px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded">Read</button>
                    </div>
                  </div>
                </div>
              ))}
              {!filtered.length && (
                <div className="text-center py-8 col-span-full text-gray-600 dark:text-gray-400">No results found.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

