import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import BottomNav from "./BottomNav";

/**
 * AppShell — wraps all post-auth pages in a 430px phone-column
 * centered on desktop. Desktop shows subtle branded gutters.
 */
export default function AppShell({ children }) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <div className={`min-h-screen flex justify-center ${isDark ? "bg-[#0d0d0d]" : "bg-[#e8e8e8]"}`}>
            {/* Desktop left gutter branding — hidden on mobile */}
            <div className="hidden lg:flex flex-col justify-center items-end pr-8 flex-1 max-w-xs sticky top-0 h-screen">
                <div className="text-right space-y-3">
                    <div className={`text-2xl font-black tracking-tight bg-gradient-to-r ${isDark ? "from-white via-[#00B8A9] to-[#00C4B4]" : "from-gray-900 via-[#00B8A9] to-[#00C4B4]"} text-transparent bg-clip-text`}>
                        EVO-A
                    </div>
                    <p className={`text-xs font-medium max-w-[140px] text-right leading-relaxed ${isDark ? "text-white/30" : "text-black/30"}`}>
                        Startup discovery & pitch platform
                    </p>
                </div>
            </div>

            {/* Phone column */}
            <div
                className={`relative w-full flex flex-col`}
                style={{ maxWidth: "430px", minHeight: "100vh" }}
            >
                {/* Subtle left/right borders on desktop to define the column */}
                <div className={`absolute inset-y-0 left-0 w-px hidden sm:block ${isDark ? "bg-white/5" : "bg-black/10"}`} />
                <div className={`absolute inset-y-0 right-0 w-px hidden sm:block ${isDark ? "bg-white/5" : "bg-black/10"}`} />

                {/* Page content */}
                <div className={`flex-1 ${isDark ? "bg-black" : "bg-[#f7f9fa]"}`}>
                    {children}
                </div>

                {/* Bottom nav lives here so it's always scoped to the phone column */}
                <BottomNav />
            </div>

            {/* Desktop right gutter — just balance */}
            <div className="hidden lg:flex flex-1 max-w-xs" />
        </div>
    );
}
