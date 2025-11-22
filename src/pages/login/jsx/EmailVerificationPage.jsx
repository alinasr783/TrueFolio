import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import { ArrowLeft, Mail, Loader2 } from 'lucide-react'

export default function EmailVerificationPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Try to get current session
        // If session exists and email is verified → redirect immediately
        // Watch for changes in authentication state
        const { data: { session } } = await supabase.auth.getSession()

        // لو السيشن موجودة والايميل متأكد → حول مباشرة
        if (session?.user?.email_confirmed_at) {
          setVerified(true)
          setTimeout(() => navigate('/dashboard'), 1000)
          return
        }

        // راقب أي تغيير في حالة الأوثنتيكيشن
        const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user?.email_confirmed_at) {
            setVerified(true)
            setTimeout(() => navigate('/dashboard'), 1000)
          }
        })

        return () => {
          listener.subscription.unsubscribe()
        }
      } catch (error) {
        console.error('Error checking verification:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [navigate])

  // ======= Loading =======
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-400" />
      </div>
    )
  }

  // ======= Verified =======
  if (verified) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center text-white">
        <div className="text-center">
          <Mail className="w-10 h-10 mb-4 text-green-400" />
          <h1 className="text-2xl font-semibold">Email verified successfully!</h1>
          <p className="text-gray-400">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  // ======= Default =======
  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Left */}
        <div className="flex-1 hidden md:block relative">
          <div className="absolute top-6 left-6 z-10">
            <button
              onClick={() => navigate('/')}
              className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/30 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          </div>
          <img
            src="https://i.ibb.co/dJxBbFks/brandasset.png"
            alt="Brand Asset"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right */}
        <div className="flex-1 p-8 flex flex-col justify-center items-center text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <Mail className="w-10 h-10 text-blue-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">Check Your Email</h1>
          <p className="text-gray-600 mb-2">We've sent a confirmation link to your email.</p>

          <p className="text-gray-500 text-sm mb-8">
            If you don't see the email, check your spam folder or resend below.
          </p>

          <button
            onClick={() => supabase.auth.resend({ type: 'signup' })}
            className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors max-w-xs"
          >
            Resend Verification Email
          </button>
        </div>
      </div>
    </div>
  )
}
