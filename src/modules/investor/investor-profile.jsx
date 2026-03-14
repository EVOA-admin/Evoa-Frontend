import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../config/supabase";
import { getMyInvestorProfile } from "../../services/investorsService";
import postsService from "../../services/postsService";
import {
    IoPencil,
    IoLogOutOutline,
    IoLocationOutline,
    IoLinkOutline,
    IoCheckmarkCircle,
    IoMailOutline,
    IoClose,
    IoCheckmark,
    IoEllipsisVertical,
    IoTrashOutline,
} from "react-icons/io5";
import { FaLinkedin, FaTwitter, FaGlobe } from "react-icons/fa";
import EditInvestorModal from "./edit-investor-modal";
import AppShell from "../../components/layout/AppShell";
import AppHeader from "../../components/layout/AppHeader";
import ensureUrl from "../../utils/ensureUrl";
import ProfileContentGrid from "../../components/shared/ProfileContentGrid";
import DeleteAccountDialog from "../../components/shared/DeleteAccountDialog";
import { HiSun, HiMoon } from "react-icons/hi";

export default function InvestorProfile() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";
    const navigate = useNavigate();
    const { user: authUser } = useAuth();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("posts");
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        fetchInvestorProfile();
    }, []);

    const fetchInvestorProfile = async () => {
        try {
            setLoading(true);
            const res = await getMyInvestorProfile();
            const data = res?.data?.data || res?.data || res;
            setProfile(data);
        } catch (err) {
            console.error("Failed to load investor profile:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        navigate("/");
    };

    const fmtMoney = (val) => {
        if (!val) return "—";
        const n = parseFloat(val);
        if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
        if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
        return `₹${n.toLocaleString()}`;
    };

    const stats = profile?.stats || {};
    const locationStr = profile?.location
        ? [profile.location.city, profile.location.country].filter(Boolean).join(", ")
        : "";

    const tabs = [
        { id: "posts", label: "Posts" },
        { id: "about", label: "About" },
        { id: "portfolio", label: "Portfolio" },
        { id: "credentials", label: "Docs" },
    ];

    const headerActions = (
        <div className="relative">
            <button
                onClick={() => setMenuOpen(o => !o)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-90 ${isDark ? "text-white/70 hover:bg-white/10" : "text-gray-600 hover:bg-gray-100"}`}
                title="Menu"
            >
                <IoEllipsisVertical size={22} />
            </button>
            {menuOpen && <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />}
            {menuOpen && (
                <div className={`absolute right-0 top-12 z-50 w-52 rounded-2xl shadow-xl overflow-hidden border ${isDark ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"
                    }`}>
                    <button
                        onClick={() => { setMenuOpen(false); setEditOpen(true); }}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors ${isDark ? "text-white/80 hover:bg-white/8" : "text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        <IoPencil size={16} className="text-[#00B8A9]" />
                        Edit Profile
                    </button>
                    <div className={`mx-4 h-px ${isDark ? "bg-white/8" : "bg-gray-100"}`} />
                    <button
                        onClick={() => {
                            setMenuOpen(false);
                            setTimeout(toggleTheme, 150);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium transition-colors ${isDark ? "text-white/80 hover:bg-white/8" : "text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            {isDark ? <HiSun size={18} className="text-gray-400" /> : <HiMoon size={18} className="text-gray-500" />}
                            Theme
                        </div>
                        <span className={`text-[10px] uppercase tracking-wider font-bold ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                            {isDark ? 'Dark' : 'Light'}
                        </span>
                    </button>
                    <div className={`mx-4 h-px ${isDark ? "bg-white/8" : "bg-gray-100"}`} />
                    <button
                        onClick={() => { setMenuOpen(false); setDeleteOpen(true); }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-red-400 hover:bg-red-500/8 transition-colors"
                    >
                        <IoTrashOutline size={16} />
                        Delete Account
                    </button>
                    <div className={`mx-4 h-px ${isDark ? "bg-white/8" : "bg-gray-100"}`} />
                    <button
                        onClick={() => { setMenuOpen(false); handleLogout(); }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-red-400 hover:bg-red-500/8 transition-colors"
                    >
                        <IoLogOutOutline size={16} />
                        Log Out
                    </button>
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <AppShell>
                <AppHeader title="My Profile" actions={headerActions} showThemeToggle={true} />
                <div className="flex items-center justify-center h-72">
                    <div className="w-10 h-10 border-4 border-[#00B8A9] border-t-transparent rounded-full animate-spin" />
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <AppHeader title="My Profile" actions={headerActions} />

            {/* Hero Section */}
            <div className={`${isDark ? "bg-gray-900" : "bg-white"} border-b ${isDark ? "border-white/10" : "border-gray-100"}`}>
                <div className="px-4 pt-5 pb-4">
                    <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className={`w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center ${isDark ? "bg-gray-800" : "bg-gray-100"} ring-2 ring-[#00B8A9]/30`}>
                            <img
                                src={profile?.logoUrl || authUser?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || "I")}&background=00B8A9&color=fff&size=128`}
                                alt={profile?.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <h1 className={`text-lg font-bold leading-tight truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                                    {profile?.name || "Investor"}
                                </h1>
                                <IoCheckmarkCircle className="text-blue-500 flex-shrink-0" size={16} />
                            </div>
                            {(profile?.designation || profile?.companyName) && (
                                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"} truncate`}>
                                    {[profile.designation, profile.companyName ? `@ ${profile.companyName}` : ""].filter(Boolean).join(" ")}
                                </p>
                            )}
                            <div className="flex flex-wrap gap-1 mt-2">
                                {profile?.sectors?.slice(0, 2).map(s => (
                                    <span key={s} className="text-[11px] px-2 py-0.5 bg-[#00B8A9]/15 text-[#00B8A9] rounded-full font-medium">{s}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    {(stats.startupsBacked > 0 || stats.capitalDeployed || stats.exits > 0) && (
                        <div className={`grid grid-cols-3 divide-x mt-4 pt-4 border-t ${isDark ? "divide-white/10 border-white/10" : "divide-gray-100 border-gray-100"}`}>
                            {stats.startupsBacked > 0 && (
                                <StatItem label="Backed" value={stats.startupsBacked} isDark={isDark} />
                            )}
                            {stats.capitalDeployed && (
                                <StatItem label="Deployed" value={stats.capitalDeployed} isDark={isDark} />
                            )}
                            {stats.exits > 0 && (
                                <StatItem label="Exits" value={stats.exits} isDark={isDark} />
                            )}
                        </div>
                    )}

                    {/* Meta info */}
                    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        {locationStr && (
                            <span className="flex items-center gap-1"><IoLocationOutline size={12} />{locationStr}</span>
                        )}
                        {profile?.officialEmail && (
                            <span className="flex items-center gap-1"><IoMailOutline size={12} />{profile.officialEmail}</span>
                        )}
                    </div>

                    {/* Action buttons */}
                    <button
                        onClick={() => setEditOpen(true)}
                        className={`mt-3.5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all ${isDark ? "border-white/20 text-white hover:bg-white/10" : "border-gray-200 text-gray-800 hover:bg-gray-50"}`}
                    >
                        <IoPencil size={14} />Edit Profile
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className={`sticky top-14 z-20 flex border-b ${isDark ? "bg-gray-950 border-white/10" : "bg-white border-gray-200"}`}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-3 text-sm font-medium relative transition-colors ${activeTab === tab.id
                            ? isDark ? "text-white" : "text-gray-900"
                            : isDark ? "text-gray-500" : "text-gray-400"
                            }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-[#00B8A9]" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="px-4 py-4 space-y-3 pb-10">

                {/* Posts Tab */}
                {activeTab === "posts" && (
                    <ProfileContentGrid
                        isDark={isDark}
                        isOwner={true}
                        fetchFn={postsService.getMyPosts}
                        role="investor"
                    />
                )}

                {/* About Tab */}
                {activeTab === "about" && (
                    <>
                        {profile?.description && (
                            <Section title="About the Investor" isDark={isDark}>
                                <p className={`text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>{profile.description}</p>
                            </Section>
                        )}


                        {profile?.sectors?.length > 0 && (
                            <Section title="Preferred Sectors" isDark={isDark}>
                                <div className="flex flex-wrap gap-1.5">
                                    {profile.sectors.map(s => (
                                        <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-[#00B8A9]/10 text-[#00B8A9] font-medium">{s}</span>
                                    ))}
                                </div>
                            </Section>
                        )}

                        {!profile?.description && !profile?.sectors?.length && (
                            <EmptyTabState message="No about info added yet" isDark={isDark} />
                        )}
                    </>
                )}

                {/* Portfolio Tab */}
                {activeTab === "portfolio" && (
                    <>
                        {(profile?.minTicketSize || profile?.maxTicketSize || profile?.stages?.length > 0) && (
                            <Section title="Investment Criteria" isDark={isDark}>
                                <div className="grid grid-cols-2 gap-2">
                                    {profile?.minTicketSize && (
                                        <FinancialCard label="Min Ticket" value={fmtMoney(profile.minTicketSize)} isDark={isDark} />
                                    )}
                                    {profile?.maxTicketSize && (
                                        <FinancialCard label="Max Ticket" value={fmtMoney(profile.maxTicketSize)} isDark={isDark} />
                                    )}
                                </div>
                                {profile?.stages?.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                        {profile.stages.map(s => (
                                            <span key={s} className={`text-xs px-2.5 py-1 rounded-full border ${isDark ? "border-white/15 text-gray-400" : "border-gray-200 text-gray-500"}`}>{s}</span>
                                        ))}
                                    </div>
                                )}
                            </Section>
                        )}

                        {profile?.socialProof?.length > 0 ? (
                            <Section title="Social Proof &amp; Network" isDark={isDark}>
                                <div className="space-y-3">
                                    {profile.socialProof.map((proof, idx) => (
                                        <div key={idx} className={`p-3 rounded-xl border ${isDark ? "border-white/10 bg-white/5" : "border-gray-100 bg-gray-50"}`}>
                                            <p className={`italic text-sm mb-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}>"{proof.quote}"</p>
                                            <p className={`text-xs font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{proof.author}</p>
                                            <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{proof.authorRole}</p>
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        ) : (
                            !profile?.minTicketSize && !profile?.maxTicketSize && !profile?.stages?.length && (
                                <EmptyTabState message="No portfolio data added yet" isDark={isDark} />
                            )
                        )}
                    </>
                )}

                {/* Credentials Tab */}
                {activeTab === "credentials" && (
                    <>
                        {profile?.credentials?.length > 0 ? (
                            <Section title="Documents & Credentials" isDark={isDark}>
                                <div className="space-y-2">
                                    {profile.credentials.map((cred, idx) => (
                                        <div key={idx} className={`flex items-center gap-2 p-3 rounded-xl ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
                                            <IoCheckmarkCircle className="text-[#00B8A9] flex-shrink-0" size={16} />
                                            <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>{cred}</span>
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        ) : (
                            <EmptyTabState message="No credentials added yet" isDark={isDark} />
                        )}

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all mt-2 ${isDark ? "border-red-500/30 text-red-400 hover:bg-red-500/10" : "border-red-200 text-red-500 hover:bg-red-50"}`}
                        >
                            <IoLogOutOutline size={15} />Log Out
                        </button>
                    </>
                )}
            </div>

            {/* Edit Modal */}
            <EditInvestorModal
                isOpen={editOpen}
                onClose={() => setEditOpen(false)}
                profile={profile}
                onSuccess={fetchInvestorProfile}
            />
        </AppShell>
    );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function Section({ title, children, isDark }) {
    return (
        <div className={`rounded-2xl p-4 ${isDark ? "bg-gray-900" : "bg-white"}`}>
            <h3 className={`text-sm font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>{title}</h3>
            {children}
        </div>
    );
}

function StatItem({ label, value, isDark }) {
    return (
        <div className="flex flex-col items-center py-1 px-2">
            <span className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{value}</span>
            <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{label}</span>
        </div>
    );
}

function FinancialCard({ label, value, isDark }) {
    return (
        <div className={`p-3 rounded-xl text-center ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
            <p className="text-sm font-bold text-[#00B8A9]">{value}</p>
            <p className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{label}</p>
        </div>
    );
}

function EmptyTabState({ message, isDark }) {
    return (
        <div className={`flex flex-col items-center justify-center py-16 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
            <div className="w-12 h-12 rounded-full bg-current/5 flex items-center justify-center mb-3 opacity-40">
                <IoCheckmarkCircle size={24} />
            </div>
            <p className="text-sm">{message}</p>
        </div>
    );
}
