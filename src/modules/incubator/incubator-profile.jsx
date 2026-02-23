import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../config/supabase";
import { getMyIncubatorProfile } from "../../services/incubatorsService";
import {
    IoArrowBack,
    IoLocationOutline,
    IoLinkOutline,
    IoMailOutline,
    IoPencil,
    IoLogOutOutline,
    IoBulbOutline,
    IoPeopleOutline,
    IoLibraryOutline,
    IoShareSocialOutline,
    IoImageOutline,
    IoBriefcaseOutline
} from "react-icons/io5";
import EditIncubatorModal from "./edit-incubator-modal";
import ensureUrl from "../../utils/ensureUrl";

export default function IncubatorProfile() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const navigate = useNavigate();
    const { user: authUser } = useAuth();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);

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

    const locationStr = profile?.location
        ? `${profile.location.city}, ${profile.location.state}`
        : "City, State";

    const programItems = [
        { icon: <IoBulbOutline size={28} className="text-blue-500" />, label: "Startup Acceleration" },
        { icon: <IoPeopleOutline size={28} className="text-blue-500" />, label: "Mentorship" },
        { icon: <IoLibraryOutline size={28} className="text-blue-500" />, label: "Workshops" },
        { icon: <IoBriefcaseOutline size={28} className="text-blue-500" />, label: "Networking" }
    ];

    return (
        <div className={`min-h-screen ${isDark ? "bg-gray-950 text-white" : "bg-white text-gray-900"}`}>
            {/* Header / Top Nav */}
            <div className={`sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b ${isDark ? "bg-gray-950/80 border-white/10" : "bg-white/80 border-gray-100"} backdrop-blur-md`}>
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                    <IoArrowBack size={22} className={isDark ? "text-white" : "text-gray-800"} />
                </button>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setEditOpen(true)}
                        className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-full border transition-all ${isDark ? "border-white/20 text-white hover:bg-white/10" : "border-gray-200 text-gray-800 hover:bg-gray-100"}`}
                    >
                        <IoPencil size={14} />
                        Edit Profile
                    </button>
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-full border transition-all ${isDark ? "border-red-500/20 text-red-400 hover:bg-red-500/10" : "border-red-100 text-red-500 hover:bg-red-50"}`}
                    >
                        <IoLogOutOutline size={16} />
                        Logout
                    </button>
                </div>
            </div>

            <main className="max-w-2xl mx-auto px-6 py-10">
                {/* Hero / Identity */}
                <div className="text-center space-y-4 mb-12">
                    <div className="inline-block relative">
                        <div className={`w-36 h-36 rounded-full overflow-hidden flex items-center justify-center p-1 border-4 border-[#00B8A9]/20 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
                            <img
                                src={profile?.logoUrl || authUser?.avatarUrl || "https://i.pravatar.cc/150?u=incubator"}
                                alt={profile?.name}
                                className="w-full h-full object-cover rounded-full"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tight">{profile?.name || "Incubation Center"}</h1>
                        <p className="text-lg opacity-60 font-medium">{profile?.tagline || "Supporting startup growth"}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
                        <div className="flex items-center gap-2 opacity-70">
                            <IoLocationOutline size={18} className="text-[#00B8A9]" />
                            <span className="text-sm font-bold">{locationStr}</span>
                        </div>
                        {profile?.website && (
                            <a href={ensureUrl(profile.website)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#00B8A9] hover:underline">
                                <IoLinkOutline size={18} />
                                <span className="text-sm font-bold">{profile.website.replace(/^https?:\/\//, "")}</span>
                            </a>
                        )}
                        <div className="flex items-center gap-2 opacity-70">
                            <IoMailOutline size={18} className="text-blue-500" />
                            <span className="text-sm font-bold">{profile?.officialEmail || "info@incubation.com"}</span>
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <section className="space-y-4 mb-12">
                    <h2 className="text-2xl font-black">About Us</h2>
                    <p className="text-lg leading-relaxed opacity-80">
                        {profile?.description || "We provide resources, mentorship, and office space for early-stage startups. Our goal is to help entrepreneurs accelerate their business growth and succeed in the market."}
                    </p>
                </section>

                {/* Programs Grid */}
                <section className="space-y-4 mb-12">
                    <h2 className="text-2xl font-black">Programs</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {programItems.map((item, idx) => (
                            <div
                                key={idx}
                                className={`flex flex-col items-center justify-center p-6 rounded-2xl border text-center space-y-3 transition-all hover:scale-[1.02] ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100"}`}
                            >
                                <div className={`p-3 rounded-xl ${isDark ? "bg-white/5" : "bg-white"}`}>
                                    {item.icon}
                                </div>
                                <span className="text-xs font-black uppercase tracking-wider leading-tight">
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Gallery Grid */}
                <section className="space-y-4 mb-6">
                    <h2 className="text-2xl font-black">Gallery</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {profile?.gallery?.length > 0 ? (
                            profile.gallery.map((url, idx) => (
                                <div key={idx} className="aspect-square rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800">
                                    <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                </div>
                            ))
                        ) : (
                            [1, 2, 3, 4].map(idx => (
                                <div key={idx} className={`aspect-square rounded-2xl flex items-center justify-center ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
                                    <IoImageOutline size={32} className="opacity-20" />
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>

            {/* Edit Modal */}
            <EditIncubatorModal
                isOpen={editOpen}
                onClose={() => setEditOpen(false)}
                profile={profile}
                onSuccess={fetchIncubatorProfile}
            />
        </div>
    );
}
