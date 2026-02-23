import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../config/supabase";
import { getMyInvestorProfile } from "../../services/investorsService";
import {
    IoArrowBack,
    IoSearchOutline,
    IoPencil,
    IoLogOutOutline,
    IoLocationOutline,
    IoLinkOutline,
    IoCheckmarkCircle,
    IoMailOutline,
    IoBriefcaseOutline,
    IoSchoolOutline,
    IoCheckmark,
    IoClose,
    IoCamera
} from "react-icons/io5";
import { FaLinkedin, FaTwitter, FaGlobe, FaStar } from "react-icons/fa";
import EditInvestorModal from "./edit-investor-modal";

export default function InvestorProfile() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const navigate = useNavigate();
    const { user: authUser } = useAuth();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);

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
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        navigate('/');
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
                <div className="w-10 h-10 border-4 border-[#00B8A9] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Default stats if none exist
    const stats = profile?.stats || {
        startupsBacked: 0,
        capitalDeployed: "₹0",
        exits: 0
    };

    return (
        <div className={`min-h-screen ${isDark ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
            {/* Header */}
            <header className={`sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b ${isDark ? "bg-gray-950/80 border-white/10" : "bg-white/80 border-gray-200"} backdrop-blur-md`}>
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                        <IoArrowBack size={22} />
                    </button>
                    <span className="text-xl font-bold tracking-tight">EVO-A</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-gray-50"}`}>
                        <IoSearchOutline size={16} className="opacity-50" />
                        <input type="text" placeholder="Search" className="bg-transparent border-none outline-none text-sm w-32" />
                    </div>
                    <button onClick={handleLogout} className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-colors" title="Log Out">
                        <IoLogOutOutline size={22} />
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
                {/* Hero Section */}
                <section className={`p-6 rounded-3xl border ${isDark ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"} shadow-sm relative`}>
                    <button
                        onClick={() => setEditOpen(true)}
                        className="absolute top-6 right-6 p-2.5 rounded-xl bg-[#00B8A9] text-white hover:bg-[#00A89A] transition-all shadow-lg shadow-[#00B8A9]/20"
                    >
                        <IoPencil size={18} />
                    </button>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative">
                            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden ring-4 ring-[#00B8A9]/20">
                                <img
                                    src={profile?.logoUrl || authUser?.avatarUrl || "https://i.pravatar.cc/150?u=investor"}
                                    alt={profile?.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-2 -right-2 p-1.5 bg-white dark:bg-gray-900 rounded-lg shadow-md">
                                <IoCheckmarkCircle className="text-[#00B8A9]" size={20} />
                            </div>
                        </div>
                        <div className="text-center sm:text-left space-y-2">
                            <h1 className="text-3xl font-extrabold flex items-center justify-center sm:justify-start gap-2">
                                {profile?.name || "Investor Name"}
                                <IoCheckmarkCircle className="text-blue-500" size={24} />
                            </h1>
                            <p className="text-lg opacity-70 font-medium">
                                {profile?.designation || "Investor"} {profile?.companyName ? `@ ${profile.companyName}` : ""}
                            </p>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
                                <button className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all">
                                    Connect
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section className={`p-6 rounded-3xl border ${isDark ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"} shadow-sm`}>
                    <h2 className="text-xl font-bold mb-4">About the Investor</h2>
                    <ul className="space-y-3">
                        <li className="flex gap-2">
                            <span className="text-[#00B8A9]">•</span>
                            <span className="opacity-80">{profile?.description || "High-growth investment opportunities focus."}</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-[#00B8A9]">•</span>
                            <span className="font-semibold">Preferred Sectors:</span>
                            <span className="opacity-80">{profile?.sectors?.join(", ") || "N/A"}</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-[#00B8A9]">•</span>
                            <span className="font-semibold">Ticket Size Range:</span>
                            <span className="opacity-80">{profile?.minTicketSize && profile?.maxTicketSize ? `₹${profile.minTicketSize} - ₹${profile.maxTicketSize}` : "N/A"}</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-[#00B8A9]">•</span>
                            <span className="font-semibold">Startup Stage Preference:</span>
                            <span className="opacity-80">{profile?.stages?.join(", ") || "N/A"}</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-[#00B8A9]">•</span>
                            <span className="font-semibold">Geographical Focus:</span>
                            <span className="opacity-80">{profile?.location ? `${profile.location.city}, ${profile.location.country}` : "India"}</span>
                        </li>
                    </ul>
                </section>

                {/* Track Record & Activity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className={`p-6 rounded-3xl border ${isDark ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"} shadow-sm flex flex-col justify-between`}>
                        <h2 className="text-xl font-bold mb-6">Track Record & Activity</h2>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="text-center">
                                <p className="text-2xl font-black text-[#00B8A9]">{stats.startupsBacked}</p>
                                <p className="text-[10px] uppercase tracking-wider font-bold opacity-50">Startups Backed</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-black text-[#00B8A9]">{stats.capitalDeployed}</p>
                                <p className="text-[10px] uppercase tracking-wider font-bold opacity-50">Capital Deployed</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-black text-[#00B8A9]">{stats.exits}</p>
                                <p className="text-[10px] uppercase tracking-wider font-bold opacity-50">Successful Exits</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {["Corner", "Portfolio", "India"].map(tag => (
                                <span key={tag} className={`px-3 py-1 rounded-lg border text-xs font-bold ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-gray-50 text-gray-600"}`}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </section>

                    <section className={`p-6 rounded-3xl border ${isDark ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"} shadow-sm flex items-center justify-center`}>
                        <div className="grid grid-cols-4 gap-4 opacity-70">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className={`w-10 h-10 rounded-lg ${isDark ? "bg-white/10" : "bg-gray-100"} flex items-center justify-center mb-2`}>
                                    <span className="text-[8px] font-bold">LOGO</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Social Proof & Networking */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className={`p-6 rounded-3xl border ${isDark ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"} shadow-sm`}>
                        <h2 className="text-xl font-bold mb-4">Social Proof & Network</h2>
                        <div className={`p-4 rounded-2xl border ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"} space-y-3`}>
                            <div className="flex items-center justify-between">
                                <div className="flex text-yellow-500 gap-0.5">
                                    {[1, 2, 3, 4, 5].map(i => <FaStar key={i} size={12} />)}
                                </div>
                                <span className="text-xs font-bold opacity-50">5.0</span>
                            </div>
                            <p className="italic text-sm opacity-80">
                                "A supportive and experienced investor who truly adds value beyond capital."
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
                                    <img src="https://i.pravatar.cc/80?u=lakshmi" alt="Founder" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold">Lakshmi K.</p>
                                    <p className="text-[10px] opacity-50">Founder, SwiftTech</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-900 bg-gray-400 overflow-hidden">
                                        <img src={`https://i.pravatar.cc/80?u=${i}`} alt="Co-investor" />
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-4 opacity-50">
                                <span className="font-bold text-xs italic tracking-tighter">Forbes</span>
                                <span className="font-bold text-xs italic tracking-tighter">Inc.</span>
                            </div>
                        </div>
                    </section>

                    <section className={`p-6 rounded-3xl border ${isDark ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"} shadow-sm space-y-4`}>
                        <h2 className="text-xl font-bold">Group Networking</h2>
                        <div>
                            <p className="font-bold flex items-center gap-2">B2B Growth Titans 🚀</p>
                            <p className="text-xs opacity-60">Criteria: SaaS Enterprise | Rev: ₹20L+</p>
                        </div>
                        <div className="flex gap-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center font-bold text-[8px]">BRAND</div>
                            ))}
                            <div className="w-10 h-10 rounded-xl border border-dashed border-[#00B8A9] flex items-center justify-center text-[8px] font-bold text-[#00B8A9]">OLIVO</div>
                        </div>
                        <p className="text-xs font-bold text-[#00B8A9]">Open Slots Left: 2</p>
                    </section>
                </div>

                {/* Bottom Zone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className={`p-6 rounded-3xl border ${isDark ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"} shadow-sm`}>
                        <h2 className="text-xl font-bold mb-4">Documents & Credentials</h2>
                        <ul className="space-y-2 text-sm font-medium opacity-80">
                            <li className="hover:text-[#00B8A9] cursor-pointer">• SEBI Accreditation 2024</li>
                            <li className="hover:text-[#00B8A9] cursor-pointer">• Indian Angel Network Member</li>
                            <li className="hover:text-[#00B8A9] cursor-pointer">• Investment Guidelines (PDF)</li>
                        </ul>
                    </section>

                    <section className="flex flex-col gap-3">
                        <button className="w-full py-3 rounded-2xl bg-blue-600 text-white font-extra-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                            Ask a Question
                        </button>
                        <button className="w-full py-3 rounded-2xl bg-blue-600 text-white font-extra-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                            Book Live AMA
                        </button>
                    </section>
                </div>
            </main>

            {/* Edit Modal */}
            <EditInvestorModal
                isOpen={editOpen}
                onClose={() => setEditOpen(false)}
                profile={profile}
                onSuccess={fetchInvestorProfile}
            />
        </div>
    );
}
