import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';
import { updatePassword } from '../../services/authService';
import logo from '../../assets/logo.avif';

export default function ResetPassword() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        // Validate password length
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            await updatePassword(formData.password);
            setSuccess(true);

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.message || 'Failed to update password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-black' : 'bg-white'}`}>
                <div className="text-center">
                    <div className="mb-4">
                        <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                    <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                        Password Updated!
                    </h2>
                    <p className={`${isDark ? 'text-white/60' : 'text-black/60'}`}>
                        Redirecting to login...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex items-center justify-center px-4 ${isDark ? 'bg-black' : 'bg-white'}`}>
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <img src={logo} alt="EVO-A Logo" className="h-12 w-12 object-contain" />
                        <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>EVO-A</span>
                    </div>
                    <h1 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                        Reset Password
                    </h1>
                    <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                        Enter your new password
                    </p>
                </div>

                {/* Form */}
                <div className={`rounded-3xl p-6 ${isDark
                        ? 'bg-black/50 border border-white/10 backdrop-blur-sm'
                        : 'bg-white/90 border border-black/10 backdrop-blur-sm'
                    }`}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Error Message */}
                        {error && (
                            <div className={`p-3 text-sm border rounded-xl ${isDark
                                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                    : 'bg-red-50 border-red-200 text-red-600'
                                }`}>
                                {error}
                            </div>
                        )}

                        {/* New Password */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter new password"
                                    required
                                    disabled={loading}
                                    className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all pr-12 disabled:opacity-50 ${isDark
                                            ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'
                                            : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'
                                        }`}
                                />
                                <button
                                    type="button"
                                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-white/50 hover:text-white' : 'text-black/50 hover:text-black'
                                        }`}
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm new password"
                                    required
                                    disabled={loading}
                                    className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all pr-12 disabled:opacity-50 ${isDark
                                            ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'
                                            : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'
                                        }`}
                                />
                                <button
                                    type="button"
                                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-white/50 hover:text-white' : 'text-black/50 hover:text-black'
                                        }`}
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 text-sm font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-[#00B8A9] text-white hover:bg-[#00A89A] shadow-lg shadow-[#00B8A9]/30 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? 'Updating Password...' : 'Update Password'}
                        </button>

                        {/* Back to Login */}
                        <div className="text-center">
                            <Link
                                to="/login"
                                className="text-sm text-[#00B8A9] hover:text-[#00A89A] transition-colors"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
