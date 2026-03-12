import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/logo.avif";
import { HiSun, HiMoon } from "react-icons/hi";

/**
 * AppHeader — unified top bar for post-auth pages.
 * Shows logo + wordmark on left, optional action slot on right.
 * Pass showThemeToggle={true} on profile pages to restore the theme button.
 */
export default function AppHeader({ actions = null, title = null, showThemeToggle = false }) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div
            className={`sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b transition-colors ${isDark
                ? "bg-black/95 border-white/[0.07] backdrop-blur-xl"
                : "bg-white/95 border-gray-200/80 backdrop-blur-xl"
                }`}
        >
            {/* Left: logo + wordmark or page title */}
            <div className="flex items-center gap-2.5">
                <button onClick={() => navigate(-1)} className="hidden">back</button>
                <img src={logo} alt="EVO-A" className="h-8 w-8 object-contain rounded-xl" />
                {title ? (
                    <span className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{title}</span>
                ) : (
                    <span className={`text-xl font-black tracking-tight bg-gradient-to-r ${isDark
                        ? "from-white via-[#00B8A9] to-[#00B8A9]"
                        : "from-gray-900 via-[#00B8A9] to-[#00B8A9]"
                        } text-transparent bg-clip-text`}>
                        EVO-A
                    </span>
                )}
            </div>

            {/* Right: actions + optional theme toggle */}
            <div className="flex items-center gap-1">
                {actions}
                {showThemeToggle && (
                    <button
                        onClick={toggleTheme}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-90 ${isDark
                            ? "text-white/60 hover:text-[#00B8A9] hover:bg-white/8"
                            : "text-gray-500 hover:text-[#00B8A9] hover:bg-gray-100"
                            }`}
                        title={isDark ? "Light mode" : "Dark mode"}
                    >
                        {isDark ? <HiSun size={20} className="animate-spin-slow" /> : <HiMoon size={19} />}
                    </button>
                )}
            </div>
        </div>
    );
}
