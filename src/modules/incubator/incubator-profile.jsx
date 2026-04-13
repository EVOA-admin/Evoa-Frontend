import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../config/supabase";
import { getMyIncubatorProfile } from "../../services/incubatorsService";
import postsService from "../../services/postsService";
import {
    IoPencil,
    IoLogOutOutline,
    IoLocationOutline,
    IoLinkOutline,
    IoMailOutline,
    IoBulbOutline,
    IoImageOutline,
    IoEllipsisVertical,
    IoTrashOutline,
} from "react-icons/io5";
import { MdVerified } from "react-icons/md";
import EditIncubatorModal from "./edit-incubator-modal";
import ensureUrl from "../../utils/ensureUrl";
import AppShell from "../../components/layout/AppShell";
import AppHeader from "../../components/layout/AppHeader";
import ProfileContentGrid from "../../components/shared/ProfileContentGrid";
import DeleteAccountDialog from "../../components/shared/DeleteAccountDialog";
import { HiSun, HiMoon } from "react-icons/hi";

const AmbassadorDashboard = lazy(() => import("../ambassador/AmbassadorDashboard"));

export default function IncubatorProfile() {
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
    const [activeSection, setActiveSection] = useState("main"); // 'main' | 'ambassador'

    useEffect(() => {
        fetchIncubatorProfile();
    }, []);

    const fetchIncubatorProfile = async () => {
        try {
            setLoading(true);
            const res = await getMyIncubatorProfile();
            const data = res?.data?.data || res?.data || res;
            setProfile(data);
        } catch (err) {
            console.error("Failed to load incubator profile:", err);
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

    const locationStr = profile?.location
        ? [profile.location.city, profile.location.state].filter(Boolean).join(", ")
        : "";

    const tabs = [
        { id: "posts", label: "Posts" },
        { id: "about", label: "About" },
        { id: "programs", label: "Programs" },
        { id: "gallery", label: "Gallery" },
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
                    {/* Ambassador Program */}
                    <button
                        id="incubator-ambassador-btn"
                        onClick={() => { setMenuOpen(false); setActiveSection("ambassador"); }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors"
                        style={{ color: '#C9A84C' }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        Ambassador Program
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
        <>
            <AppShell>
                <AppHeader title="My Profile" actions={headerActions} />

                {activeSection === "ambassador" ? (
                    <Suspense fallback={<div style={{padding:32,textAlign:'center'}}><div style={{width:32,height:32,border:'3px solid rgba(201,168,76,.2)',borderTopColor:'#C9A84C',borderRadius:'50%',animation:'spin .8s linear infinite',margin:'0 auto'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>}>
                        <AmbassadorDashboard onBack={() => setActiveSection("main")} />
                    </Suspense>
                ) : (<>
                <div className={`${isDark ? "bg-gray-900" : "bg-white"} border-b ${isDark ? "border-white/10" : "border-gray-100"}`}>
                    <div className="px-4 pt-5 pb-4">
                        <div className="flex items-start gap-4">
                            {/* Logo */}
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
                                        {profile?.name || "Incubator"}
                                    </h1>
                                    <MdVerified className="text-[#00B8A9] flex-shrink-0" size={16} />
                                </div>
                                {profile?.tagline && (
                                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"} line-clamp-2 leading-snug`}>{profile.tagline}</p>
                                )}
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {profile?.organizationType && (
                                        <span className="text-[11px] px-2 py-0.5 bg-[#00B8A9]/15 text-[#00B8A9] rounded-full font-medium">{profile.organizationType}</span>
                                    )}
                                    {profile?.affiliationType && (
                                        <span className={`text-[11px] px-2 py-0.5 rounded-full ${isDark ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-600"}`}>{profile.affiliationType}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stats Row */}
                        {(profile?.numberOfMentors || profile?.cohortSize || profile?.programDuration) && (
                            <div className={`grid grid-cols-3 divide-x mt-4 pt-4 border-t ${isDark ? "divide-white/10 border-white/10" : "divide-gray-100 border-gray-100"}`}>
                                {profile?.numberOfMentors && (
                                    <StatItem label="Mentors" value={profile.numberOfMentors} isDark={isDark} />
                                )}
                                {profile?.cohortSize && (
                                    <StatItem label="Cohort" value={profile.cohortSize} isDark={isDark} />
                                )}
                                {profile?.programDuration && (
                                    <StatItem label="Duration" value={profile.programDuration} isDark={isDark} />
                                )}
                            </div>
                        )}

                        {/* Meta info */}
                        <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                            {locationStr && (
                                <span className="flex items-center gap-1"><IoLocationOutline size={12} />{locationStr}</span>
                            )}
                            {profile?.website && (
                                <a href={ensureUrl(profile.website)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#00B8A9]">
                                    <IoLinkOutline size={12} />{profile.website.replace(/^https?:\/\//, "").slice(0, 24)}
                                </a>
                            )}
                            {profile?.officialEmail && (
                                <span className="flex items-center gap-1"><IoMailOutline size={12} />{profile.officialEmail}</span>
                            )}
                        </div>

                        {/* Edit Profile Button */}
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
                            role="incubator"
                        />
                    )}

                    {/* About Tab */}
                    {activeTab === "about" && (
                        <>
                            {profile?.description && (
                                <Section title="About Us" isDark={isDark}>
                                    <p className={`text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>{profile.description}</p>
                                </Section>
                            )}

                            <Section title="Organization Details" isDark={isDark}>
                                <div className="grid grid-cols-2 gap-2">
                                    <DetailCard label="Type" value={profile?.organizationType || "—"} isDark={isDark} />
                                    <DetailCard label="Affiliation" value={profile?.affiliationType || "—"} isDark={isDark} />
                                    <DetailCard label="Equity Policy" value={profile?.equityPolicy || "—"} isDark={isDark} />
                                    <DetailCard label="Funding Support" value={profile?.fundingSupport || "—"} isDark={isDark} />
                                </div>
                            </Section>

                            {profile?.portfolioStartups && (
                                <Section title="Portfolio Startups" isDark={isDark}>
                                    <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? "text-gray-300" : "text-gray-700"}`}>{profile.portfolioStartups}</p>
                                </Section>
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

                    {/* Programs Tab */}
                    {activeTab === "programs" && (
                        <>
                            {profile?.programTypes?.length > 0 ? (
                                <Section title="Program Types" isDark={isDark}>
                                    <div className="grid grid-cols-2 gap-2">
                                        {profile.programTypes.map((prog, idx) => (
                                            <div
                                                key={idx}
                                                className={`flex items-center gap-2.5 p-3 rounded-xl border ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100"}`}
                                            >
                                                <div className={`p-1.5 rounded-lg ${isDark ? "bg-white/8" : "bg-white"}`}>
                                                    <IoBulbOutline size={16} className="text-[#00B8A9]" />
                                                </div>
                                                <span className={`text-xs font-semibold leading-tight ${isDark ? "text-gray-200" : "text-gray-700"}`}>{prog}</span>
                                            </div>
                                        ))}
                                    </div>
                                </Section>
                            ) : (
                                <EmptyTabState message="No programs added yet" isDark={isDark} />
                            )}
                        </>
                    )}

                    {/* Gallery Tab */}
                    {activeTab === "gallery" && (
                        <>
                            {profile?.gallery?.length > 0 ? (
                                <div className="grid grid-cols-2 gap-1.5">
                                    {profile.gallery.map((url, idx) => (
                                        <div key={idx} className="aspect-square rounded-xl overflow-hidden">
                                            <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyTabState message="No gallery images added yet" isDark={isDark} />
                            )}
                        </>
                    )}
                </div>

                {/* Edit Modal */}
                <EditIncubatorModal
                    isOpen={editOpen}
                    onClose={() => setEditOpen(false)}
                    profile={profile}
                    onSuccess={fetchIncubatorProfile}
                />
                </>)}
            </AppShell>
            <DeleteAccountDialog isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} />
        </>
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

function DetailCard({ label, value, isDark }) {
    return (
        <div className={`p-3 rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
            <p className={`text-[11px] uppercase tracking-wider font-bold mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>{label}</p>
            <p className={`text-sm font-semibold truncate ${isDark ? "text-gray-200" : "text-gray-800"}`}>{value}</p>
        </div>
    );
}

function EmptyTabState({ message, isDark }) {
    return (
        <div className={`flex flex-col items-center justify-center py-16 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
            <IoBulbOutline size={36} className="mb-3 opacity-40" />
            <p className="text-sm">{message}</p>
        </div>
    );
}
