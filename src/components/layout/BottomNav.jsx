import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { FaHome, FaSearch, FaPlay, FaBell, FaUser } from "react-icons/fa";
import { getNotifications } from "../../services/notificationsService";

/**
 * BottomNav — fixed bottom tab bar for all post-auth pages.
 * Stays within the 430px phone column.
 */
const ROLE_HOME = {
    startup: "/startup",
    investor: "/investor",
    incubator: "/incubator",
    viewer: "/viewer",
};

const ROLE_PROFILE = {
    startup: "/startup/profile",
    investor: "/investor/profile",
    incubator: "/incubator/profile",
    viewer: "/viewer/profile",
};

export default function BottomNav() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const navigate = useNavigate();
    const location = useLocation();
    const { user, userRole } = useAuth();
    // Prefer the explicit userRole state (always up to date) over user.role object field
    const role = userRole || user?.role || "viewer";

    const [unread, setUnread] = useState(0);

    useEffect(() => {
        getNotifications()
            .then(res => {
                const data = res?.data?.data || res?.data || [];
                const list = Array.isArray(data) ? data : [];
                setUnread(list.filter(n => !n.isRead).length);
            })
            .catch(() => { });
    }, [location.pathname]);

    const home = ROLE_HOME[role] || "/viewer";
    const profile = ROLE_PROFILE[role] || "/viewer/profile";

    const tabs = [
        { key: "home", icon: FaHome, label: "Home", path: home },
        { key: "explore", icon: FaSearch, label: "Explore", path: "/explore" },
        { key: "pitch", icon: FaPlay, label: "Pitch", path: "/pitch/hashtag", center: true },
        { key: "notifications", icon: FaBell, label: "Alerts", path: "/notifications", badge: unread },
        { key: "profile", icon: FaUser, label: "Profile", path: profile },
    ];

    const isActive = (path) => {
        // Home tab: exact match only (prevent /investor/profile from matching /investor home)
        if (path === home) return location.pathname === path;
        // All other tabs: prefix match
        return location.pathname.startsWith(path);
    };

    return (
        <div
            className={`sticky bottom-0 z-40 border-t transition-colors ${isDark
                ? "bg-black/96 border-white/[0.07] backdrop-blur-xl"
                : "bg-white/96 border-gray-200/80 backdrop-blur-xl"
                }`}
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
            <div className="flex items-center justify-around px-2 py-1">
                {tabs.map(({ key, icon: Icon, label, path, center, badge }) => {
                    const active = isActive(path);
                    return (
                        <button
                            key={key}
                            onClick={() => navigate(path)}
                            className={`relative flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-2xl transition-all duration-200 active:scale-90 ${center
                                ? "bg-gradient-to-br from-[#00B8A9] to-[#007a73] shadow-lg shadow-[#00B8A9]/40 text-white -mt-3 w-12 h-12 !rounded-2xl !py-0 !gap-0 justify-center"
                                : active
                                    ? isDark ? "text-[#00B8A9]" : "text-[#00B8A9]"
                                    : isDark ? "text-white/40" : "text-gray-400"
                                }`}
                        >
                            <div className="relative">
                                <Icon size={center ? 18 : 20} />
                                {badge > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-[3px]">
                                        {badge > 9 ? "9+" : badge}
                                    </span>
                                )}
                            </div>
                            {!center && (
                                <span className="text-[9px] font-semibold tracking-wide leading-none">{label}</span>
                            )}
                            {/* Active dot */}
                            {active && !center && (
                                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#00B8A9]" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
