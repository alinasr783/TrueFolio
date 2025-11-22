import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function ToolsPage() {
  const navigate = useNavigate();

  const defaultTools = [
    {
      id: "image-to-site",
      tool_id: "image-to-site",
      name: "Image to Site",
      description: "Upload multiple images and generate a simple stacked website.",
      price: 100,
      currency: "EGP",
      status: "Paid",
      image_url: "/vite.svg",
      route_path: "/dashboard/tools/image-to-site",
      is_active: true,
    },
  ];

  const [tools, setTools] = useState(defaultTools);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("tool_catalog")
          .select("id, tool_id, name, description, price, currency, status, image_url, route_path, is_active")
          .eq("is_active", true)
          .order("name", { ascending: true });
        if (error) throw error;
        const base = data?.length ? data : defaultTools;
        const normalized = base.map((t) => ({ ...t, price: 0, currency: "", status: "Free" }));
        if (!cancelled) setTools(normalized);
      } catch (e) {
        console.error("[Tools] fetch error:", e);
        const normalized = defaultTools.map((t) => ({ ...t, price: 0, currency: "", status: "Free" }));
        if (!cancelled) setTools(normalized);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const openTool = (tool) => {
    const path = tool?.route_path || `/dashboard/tools/${tool?.tool_id || tool?.id}`;
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 ml-10">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Tools & Services</h1>
          <p className="text-gray-600 text-lg">Powerful tools to help you build amazing projects</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300" />
                <div className="p-6 space-y-3">
                  <div className="h-6 w-2/3 bg-gray-300 rounded" />
                  <div className="h-4 w-full bg-gray-300 rounded" />
                  <div className="h-4 w-4/5 bg-gray-300 rounded" />
                  <div className="flex justify-between items-center pt-4">
                    <div className="h-5 w-1/3 bg-gray-300 rounded" />
                    <div className="h-9 w-20 bg-gray-300 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <div
                key={tool.tool_id || tool.id}
                className="group relative bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              >
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={tool.image_url || "/vite.svg"} 
                    alt={tool.name} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      tool.status === "Paid" 
                        ? "bg-green-100 text-green-800" 
                        : tool.status === "Free" 
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {tool.status}
                    </span>
                  </div>

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                    {tool.name}
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-4 line-clamp-2">
                    {tool.description}
                  </p>

                  {/* Price and Action */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {tool.price === 0 ? "Free" : tool.price}
                      </span>
                      <span className="text-gray-600 font-medium">
                        {tool.price === 0 ? "" : tool.currency}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => openTool(tool)}
                      disabled={tool.is_active === false}
                      className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                    >
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="opacity-90"
                      >
                        <path d="M7 7h10v10" />
                        <path d="M7 17 17 7" />
                      </svg>
                      {tool.is_active === false ? "Coming Soon" : "Get Started"}
                    </button>
                  </div>
                </div>

                {/* Hover border effect */}
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 ring-2 ring-gray-300/50 rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && tools.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tools Available</h3>
            <p className="text-gray-600">Check back later for new tools and services.</p>
          </div>
        )}
      </div>
    </div>
  );
}