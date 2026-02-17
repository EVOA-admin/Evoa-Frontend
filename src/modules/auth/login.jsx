import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";
import { login, googleAuth } from "../../services/authService";
import apiClient from "../../services/apiClient";
import logo from "../../assets/logo.avif";
import VideoReel from "../../components/shared/VideoReel";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const particlesRef = useRef([]);

  // Create floating particles
  useEffect(() => {
    const particles = [];
    const particleCount = 15;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 5,
      });
    }

    particlesRef.current = particles;
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Login with Supabase
      await login({
        email: formData.email,
        password: formData.password,
      });

      // Fetch user profile from backend to get role
      try {
        const profileResponse = await apiClient.get('/users/me');
        const user = profileResponse.data.data || profileResponse.data;

        // Navigate based on role
        if (!user.role || user.role === 'VIEWER') {
          // No role selected, go to choice-role
          navigate('/choice-role');
        } else {
          // Navigate based on role
          const role = user.role.toLowerCase();
          navigate(`/${role}`);
        }
      } catch (profileError) {
        console.error('Error fetching profile:', profileError);
        // If profile fetch fails, default to choice-role
        navigate('/choice-role');
      }
    } catch (err) {
      // Handle different error types with specific messages
      let errorMessage = 'An error occurred. Please try again.';

      console.error('Login error:', err);

      // Check for specific error messages
      if (err.message) {
        const msg = err.message.toLowerCase();

        if (msg.includes('email not confirmed') || msg.includes('confirm your email')) {
          errorMessage = '📧 Please verify your email before logging in. Check your inbox for the confirmation link.';
        } else if (msg.includes('invalid login credentials') || msg.includes('invalid email or password')) {
          errorMessage = '❌ Invalid email or password. Please check your credentials and try again.';
        } else if (msg.includes('email link is invalid') || msg.includes('token')) {
          errorMessage = '⏰ This login link has expired. Please request a new one.';
        } else if (msg.includes('too many requests')) {
          errorMessage = '⚠️ Too many login attempts. Please wait a few minutes and try again.';
        } else {
          errorMessage = err.message;
        }
      } else if (err.status === 400) {
        errorMessage = '❌ Invalid email or password format.';
      } else if (err.status === 401) {
        errorMessage = '❌ Invalid email or password. Please check your credentials.';
      } else if (err.status === 429) {
        errorMessage = '⚠️ Too many login attempts. Please wait a few minutes.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      // Trigger Google OAuth - this will redirect to Google
      await googleAuth();
      // User will be redirected to Google, then back to /auth/callback
    } catch (err) {
      setError(err.message || 'Google authentication failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-300 relative overflow-hidden ${isDark ? 'bg-black' : 'bg-white'
      }`}>
      {/* Floating Particles Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {particlesRef.current.map((particle) => (
          <div
            key={particle.id}
            className={`absolute rounded-full ${isDark ? 'bg-[#00B8A9]/20' : 'bg-[#00B8A9]/10'
              }`}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animation: `float ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Floating circles */}
        <div
          className={`absolute rounded-full blur-xl ${isDark ? 'bg-[#00B8A9]/10' : 'bg-[#00B8A9]/5'
            }`}
          style={{
            width: '300px',
            height: '300px',
            top: '10%',
            right: '5%',
            animation: 'floatSlow 20s ease-in-out infinite',
          }}
        />
        <div
          className={`absolute rounded-full blur-xl ${isDark ? 'bg-[#00B8A9]/10' : 'bg-[#00B8A9]/5'
            }`}
          style={{
            width: '200px',
            height: '200px',
            bottom: '15%',
            left: '10%',
            animation: 'floatSlow 25s ease-in-out infinite',
            animationDelay: '2s',
          }}
        />
      </div>

      {/* Left Side - Video Reel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black z-10">
        <VideoReel />
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-8 py-6 sm:py-8 lg:pl-1 lg:pr-4 xl:pl-2 xl:pr-8 2xl:pr-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo/Brand with Animation */}
          <div className="mb-6 sm:mb-8 text-center animate-fadeInUp">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <img
                  src={logo}
                  alt="EVO-A Logo"
                  className="h-10 w-10 sm:h-12 sm:w-12 object-contain animate-pulseGlow"
                />
                {/* Glow effect */}
                <div className={`absolute inset-0 rounded-full blur-md opacity-50 ${isDark ? 'bg-[#00B8A9]' : 'bg-[#00B8A9]/30'
                  } animate-pulseGlow`} style={{ zIndex: -1 }} />
              </div>
              <span className={`text-2xl sm:text-3xl font-bold tracking-wide animate-slideInRight ${isDark ? 'text-white' : 'text-black'
                }`}>EVO-A</span>
            </div>
            <h1 className={`text-xl sm:text-2xl font-semibold mb-1 animate-fadeInUp ${isDark ? 'text-white' : 'text-black'
              }`} style={{ animationDelay: '0.1s' }}>
              Hey, Login Now!
            </h1>
            <p className={`text-xs sm:text-sm animate-fadeInUp ${isDark ? 'text-white/60' : 'text-black/60'
              }`} style={{ animationDelay: '0.2s' }}>
              Sign in to continue to your account
            </p>
          </div>

          {/* Form Container with Animation */}
          <div className={`rounded-3xl p-5 sm:p-6 animate-fadeInUp ${isDark
            ? 'bg-black/50 border border-white/10 backdrop-blur-sm'
            : 'bg-white/90 border border-black/10 backdrop-blur-sm'
            }`} style={{ animationDelay: '0.3s' }}>
            <form
              className="space-y-3"
              onSubmit={handleSubmit}
            >
              {/* Error Message with Animation */}
              {error && (
                <div className={`p-3 text-sm border rounded-xl animate-shake ${isDark
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'bg-red-50 border-red-200 text-red-600'
                  }`}>
                  {error}
                </div>
              )}

              {/* Email Input with Animation */}
              <div className="animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  disabled={loading}
                  className={`w-full px-4 py-2.5 sm:py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] focus:scale-[1.02] ${isDark
                    ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'
                    : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'
                    }`}
                />
              </div>

              {/* Password Input with Animation */}
              <div className="animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                    disabled={loading}
                    className={`w-full px-4 py-2.5 sm:py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 pr-12 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] focus:scale-[1.02] ${isDark
                      ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'
                      : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'
                      }`}
                  />
                  <button
                    type="button"
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 p-1.5 hover:scale-110 ${isDark ? 'text-white/50 hover:text-white' : 'text-black/50 hover:text-black'
                      }`}
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              {/* Login Button with Enhanced Animation */}
              <div className="animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 sm:py-3 text-sm font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-[#00B8A9] text-white hover:bg-[#00A89A] shadow-lg shadow-[#00B8A9]/30 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-[#00B8A9]/40 active:scale-[0.98] relative overflow-hidden group"
                >
                  <span className="relative z-10">{loading ? 'Signing in...' : 'Sign in'}</span>
                  {/* Shimmer effect */}
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </button>
              </div>

              {/* Divider with Animation */}
              <div className="flex items-center my-4 animate-fadeInUp" style={{ animationDelay: '0.7s' }}>
                <div className={`flex-1 h-px transition-all duration-500 ${isDark ? 'bg-white/20' : 'bg-black/20'
                  }`}></div>
                <span className={`px-4 text-xs font-medium ${isDark ? 'text-white/60' : 'text-black/60'
                  }`}>OR</span>
                <div className={`flex-1 h-px transition-all duration-500 ${isDark ? 'bg-white/20' : 'bg-black/20'
                  }`}></div>
              </div>

              {/* Google Login with Enhanced Animation */}
              <div className="animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className={`w-full py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] group ${isDark
                    ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/30'
                    : 'bg-black/5 text-black border border-black/20 hover:bg-black/10 hover:border-black/30'
                    }`}
                >
                  <FaGoogle size={18} className="transition-transform duration-300 group-hover:rotate-12" />
                  {loading ? 'Authenticating...' : 'Login with Google'}
                </button>
              </div>

              {/* Forgot Password with Animation */}
              <div className="text-center mt-4 animate-fadeInUp" style={{ animationDelay: '0.9s' }}>
                <Link
                  to="/forget-password"
                  className="text-xs transition-all duration-300 text-[#00B8A9] hover:text-[#00A89A] font-medium inline-block transform hover:scale-105"
                >
                  Forgot password?
                </Link>
              </div>
            </form>
          </div>

          {/* Sign Up Link with Animation */}
          <div className={`mt-4 text-center py-4 rounded-3xl animate-fadeInUp ${isDark
            ? 'bg-black/50 border border-white/10 backdrop-blur-sm'
            : 'bg-white/90 border border-black/10 backdrop-blur-sm'
            }`} style={{ animationDelay: '1s' }}>
            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'
              }`}>
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold transition-all duration-300 text-[#00B8A9] hover:text-[#00A89A] inline-block transform hover:scale-105"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.3;
          }
          25% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-40px) translateX(-10px);
            opacity: 0.4;
          }
          75% {
            transform: translateY(-20px) translateX(5px);
            opacity: 0.5;
          }
        }

        @keyframes floatSlow {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
          33% {
            transform: translateY(-30px) translateX(20px) scale(1.1);
          }
          66% {
            transform: translateY(20px) translateX(-20px) scale(0.9);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-slideInRight {
          animation: slideInRight 0.6s ease-out forwards;
        }

        .animate-pulseGlow {
          animation: pulseGlow 3s ease-in-out infinite;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}