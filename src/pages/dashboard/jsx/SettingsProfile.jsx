import React, { useEffect, useState } from "react";
import { supabase, getUserSafe } from "@/lib/supabase";
import { User, Mail, Phone, MapPin, Building, FileText, Camera, Save, Shield, CreditCard } from "lucide-react";

export default function SettingsProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [form, setForm] = useState({
    first_name: "",
    second_name: "",
    email: "",
    phone: "",
    country: "",
    company_name: "",
    bio: "",
    avatar_url: "",
    role: "",
    status: "",
    website: "",
    updated_at: "",
    social_links: {
      twitter: "",
      linkedin: "",
      github: ""
    }
  });
  const [initialForm, setInitialForm] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const { data: auth, error: authErr } = await getUserSafe();
        if (authErr) throw new Error(authErr.message);
        if (!auth?.user) throw new Error("Please login to manage your profile.");
        const authUser = auth.user;
        if (!cancelled) setUser(authUser);

        const { data, error } = await supabase
          .from("client")
          .select("*")
          .eq("id", authUser.id)
          .maybeSingle();
        
        if (error) throw new Error(error.message);
        
        const base = {
          first_name: data?.first_name || "",
          second_name: data?.second_name || "",
          email: data?.email || authUser.email || "",
          phone: data?.phone || "",
          country: data?.country || "",
          company_name: data?.company_name || "",
          bio: data?.bio || "",
          avatar_url: data?.avatar_url || "",
          role: data?.role || "member",
          status: data?.status || "active",
          website: data?.website || "",
          updated_at: data?.updated_at || "",
          social_links: data?.social_links || {
            twitter: "",
            linkedin: "",
            github: ""
          }
        };
        if (!cancelled) {
          setForm(base);
          setInitialForm(base);
        }
      } catch (e) {
        console.error("[SettingsProfile] load error:", e);
        if (!cancelled) setError(e.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const updateField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const updateSocialLink = (platform, value) => {
    setForm((f) => ({
      ...f,
      social_links: {
        ...f.social_links,
        [platform]: value
      }
    }));
  };

  const save = async () => {
    if (!user) return;
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // Normalize website if provided
      let website = (form.website || "").trim();
      if (website && !/^https?:\/\//i.test(website)) {
        website = `https://${website}`;
      }

      // Compute changed fields only to avoid overwriting unchanged data
      const base = initialForm || {};
      const candidate = {
        first_name: form.first_name,
        second_name: form.second_name,
        phone: form.phone,
        country: form.country,
        company_name: form.company_name,
        bio: form.bio,
        avatar_url: form.avatar_url,
        website,
        // Keep social_links only if changed
        social_links: form.social_links,
      };

      const payload = Object.entries(candidate).reduce((acc, [key, val]) => {
        const prev = key === "social_links" ? JSON.stringify(base?.social_links || {}) : base?.[key];
        const curr = key === "social_links" ? JSON.stringify(val || {}) : val;
        if (prev !== curr) acc[key] = val;
        return acc;
      }, {});

      // Always update updated_at
      const nowIso = new Date().toISOString();
      payload.updated_at = nowIso;

      const { error } = await supabase
        .from("client")
        .update(payload)
        .eq("id", user.id);

      if (error) throw new Error(error.message);
      setSuccess("Profile updated successfully!");
      setInitialForm({ ...form, website, updated_at: nowIso });
      setForm((f) => ({ ...f, website, updated_at: nowIso }));
    } catch (e) {
      console.error("[SettingsProfile] save error:", e);
      setError(e.message || String(e));
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setSaving(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      updateField("avatar_url", publicUrl);
      setSuccess("Avatar updated successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Failed to upload image");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    const first = form.first_name?.[0] || '';
    const second = form.second_name?.[0] || '';
    return (first + second).toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 ml-10">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-6">
              {/* Header Skeleton */}
              <div className="h-8 w-64 bg-gray-200 rounded"></div>
              <div className="h-4 w-96 bg-gray-200 rounded"></div>
              
              {/* Tabs Skeleton */}
              <div className="flex gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 w-32 bg-gray-200 rounded"></div>
                ))}
              </div>

              {/* Form Skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>
                  ))}
                </div>
                <div className="space-y-4">
                  <div className="h-64 bg-gray-200 rounded-xl"></div>
                  <div className="h-32 bg-gray-200 rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 ml-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-gray-600 mt-2 text-lg">Manage your personal information and account preferences</p>
          </div>

          {/* Tabs removed by request */}

          {error && (
            <div className="mb-6 p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 flex items-center gap-3">
              <Shield className="w-5 h-5" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-2xl border border-green-200 bg-green-50 text-green-700 flex items-center gap-3">
              <Save className="w-5 h-5" />
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                    <p className="text-gray-600">Update your basic personal details</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={form.first_name}
                      onChange={(e) => updateField("first_name", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={form.second_name}
                      onChange={(e) => updateField("second_name", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                      placeholder="Enter your last name"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-2">Email address cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Country
                    </label>
                    <input
                      type="text"
                      value={form.country}
                      onChange={(e) => updateField("country", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                      placeholder="Your country"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Building className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Professional Information</h2>
                    <p className="text-gray-600">Your work and company details</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    <input
                      type="text"
                      value={form.company_name}
                      onChange={(e) => updateField("company_name", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                      placeholder="Your company name"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input
                      type="url"
                      value={form.website}
                      onChange={(e) => updateField("website", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Bio
                    </label>
                    <textarea
                      rows={4}
                      value={form.bio}
                      onChange={(e) => updateField("bio", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>
              </div>

              {/* Social Links Card removed by request */}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center">
                <div className="relative inline-block mb-4">
                  {form.avatar_url ? (
                    <img 
                      src={form.avatar_url} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
                      {getInitials()}
                    </div>
                  )}
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-gray-900 text-white p-2 rounded-full cursor-pointer hover:bg-gray-700 transition-colors">
                    <Camera className="w-4 h-4" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900">
                  {form.first_name} {form.second_name}
                </h3>
                <p className="text-gray-600 mb-2">{form.role || "Member"}</p>
                <p className="text-sm text-gray-500 mb-4">{form.company_name}</p>
                
                {/* Stats removed: followers/following/projects were placeholders */}

                <button
                  onClick={save}
                  disabled={saving}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-xl disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>

              {/* Account Status Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Account Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      {form.status || "Active"}
                    </span>
                  </div>
                  {user?.created_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Member since</span>
                      <span className="text-gray-900 font-medium">
                        {new Date(user.created_at).getFullYear()}
                      </span>
                    </div>
                  )}
                  {form?.updated_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Last updated</span>
                      <span className="text-gray-900 font-medium">
                        {new Date(form.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions Card removed by request */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
