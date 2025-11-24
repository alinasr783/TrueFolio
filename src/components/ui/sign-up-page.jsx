import { useState, useEffect } from "react";
import { Eye, EyeOff, ArrowLeft, User, Mail, CheckCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [referralData, setReferralData] = useState(null);
  const [checkingReferral, setCheckingReferral] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    referralCode: "",
    agreeToTerms: false,
  });

  useEffect(() => {
    const code = searchParams.get("ref");
    if (code && code !== formData.referralCode) {
      setFormData((prev) => ({ ...prev, referralCode: code }));
      checkReferralCode(code);
    }
  }, [searchParams]);
  // Function to validate referral code
  // Validate when referral code changes
  // Create auth account
  // Get referred_by if referral code is valid
  // Create user in client table
  // Create an automatic referral code for the new user
  // Redirect to email verification page
  const checkReferralCode = async (code) => {
    if (!code) {
      setReferralData(null);
      return;
    }

    setCheckingReferral(true);
    try {
      const { data, error } = await supabase
        .from("client")
        .select("first_name, second_name, email, avatar_url, referral_code")
        .eq("referral_code", code)
        .single();

      if (error || !data) {
        setReferralData(null);
        setError("Invalid referral code");
      } else {
        setReferralData(data);
        setError("");
      }
    } catch (error) {
      console.error("Error checking referral code:", error);
      setReferralData(null);
      setError("Error checking referral code");
    } finally {
      setCheckingReferral(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // إذا تم تغيير كود الإحالة، التحقق منه
    if (name === "referralCode") {
      if (value.trim() === "") {
        setReferralData(null);
        setError("");
      } else {
        checkReferralCode(value.trim());
      }
    } else if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // إنشاء حساب المصادقة
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // الحصول على referred_by إذا كان كود الإحالة صحيح
        let referredBy = null;
        if (referralData) {
          const { data: referrerData } = await supabase
            .from("client")
            .select("client_id")
            .eq("referral_code", formData.referralCode)
            .single();

          referredBy = referrerData?.client_id;
        }

        // إنشاء المستخدم في جدول client
        const { error: dbError } = await supabase.from("client").insert([
          {
            id: authData.user.id,
            first_name: formData.firstName,
            second_name: formData.lastName,
            email: formData.email,
            referred_by: referredBy,
            // إنشاء كود إحالة تلقائي للمستخدم الجديد
            referral_code: `${formData.firstName.toUpperCase()}${formData.lastName.toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`,
          },
        ]);

        if (dbError) throw dbError;

        console.log("User created successfully:", authData.user);

        // توجيه إلى صفحة التحقق من البريد الإلكتروني
        navigate("/verify-email", {
          state: {
            email: formData.email,
            referralUsed: !!referralData,
          },
        });
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setError(error.message || "An error occurred during signup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="flex flex-col md:flex-row w-full max-w-6xl h-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Left Panel */}
        <div className="flex-1 relative overflow-hidden md:block hidden">
          <div className="absolute top-6 left-6 z-10">
            <button
              onClick={() => navigate("/")}
              className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/30 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="absolute inset-0">
            <img
              src="https://i.ibb.co/dJxBbFks/brandasset.png"
              alt="Brand Asset"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 p-8 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create an Account
            </h1>
            <p className="text-gray-600">
              Already have an account?{" "}
              <button
                className="text-blue-600 hover:text-blue-700 font-medium"
                onClick={() => navigate("/login")}
              >
                Log in
              </button>
            </p>
          </div>

          {/* Error Message */}
          {error && !referralData && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          {/* Referral Info Card */}
          {referralData && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-800">
                  Referral Verified!
                </h3>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-100">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {referralData.first_name?.[0]}
                  {referralData.second_name?.[0]}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {referralData.first_name} {referralData.second_name}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {referralData.email}
                  </p>
                </div>
              </div>
              <p className="text-sm text-green-700 mt-2">
                You're signing up with {referralData.first_name}'s referral.
                You'll both receive benefits!
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email Address"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Referral Code Field */}
            <div>
              <label
                htmlFor="referralCode"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Referral Code (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="referralCode"
                  name="referralCode"
                  value={formData.referralCode}
                  onChange={handleInputChange}
                  placeholder="Enter referral code if you have one"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  disabled={loading}
                />
                {checkingReferral && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              {formData.referralCode && !referralData && !checkingReferral && (
                <p className="text-sm text-red-600 mt-1">
                  Please enter a valid referral code
                </p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                required
                disabled={loading}
              />
              <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
                I agree to the{" "}
                <button
                  type="button"
                  className="text-black font-medium hover:underline"
                >
                  Terms & Conditions
                </button>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                loading ||
                !formData.agreeToTerms ||
                (formData.referralCode && !referralData)
              }
              className="w-full bg-black text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Benefits Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">
              Referral Program Benefits
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • <strong>For you:</strong> Get special welcome bonuses
              </li>
              <li>
                • <strong>For your friend:</strong> Earns 5% commission from
                your transactions
              </li>
              <li>
                • <strong>Win-win:</strong> Both enjoy platform benefits
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
