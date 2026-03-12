import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../config/supabase";
import { getCurrentUserProfile, updateUserProfile } from "../../services/usersService";
import storageService from "../../services/storageService";
import { getNotifications } from "../../services/notificationsService";
import ensureUrl from "../../utils/ensureUrl";
import {
    IoArrowBack,
    IoNotificationsOutline,
    IoPencil,
    IoCamera,
    IoCheckmark,
    IoClose,
    IoLocationOutline,
    IoLinkOutline,
    IoChatbubbleOutline,
    IoListOutline,
    IoGridOutline,
    IoLogOutOutline,
} from "react-icons/io5";
import { FiUser } from "react-icons/fi";
import AppShell from "../../components/layout/AppShell";
import AppHeader from "../../components/layout/AppHeader";

// Parse occupation from bio string (format: "Occupation: X\nInterests: Y")
function parseOccupation(bio) {
    if (!bio) return "";
    const match = bio.match(/Occupation:\s*([^\n]+)/);
    return match ? match[1].trim() : "";
}

function parseInterests(bio) {
    if (!bio) return [];
    const match = bio.match(/Interests:\s*(.+)$/s);
    return match ? match[1].split(",").map(s => s.trim()).filter(Boolean) : [];
}

export default function ViewerProfile() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const navigate = useNavigate();
    const { user: authUser, updateProfile } = useAuth();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        navigate('/');
    };

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("posts");
    const [unreadCount, setUnreadCount] = useState(0);

    // Edit modal
    const [editOpen, setEditOpen] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState("");
    const [editForm, setEditForm] = useState({});
    const [newAvatar, setNewAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const avatarInputRef = useRef();

    useEffect(() => {
        fetchProfile();
        fetchUnread();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await getCurrentUserProfile();
            const u = res?.data?.data || res?.data || res;
            setProfile(u);
        } catch (err) {
            console.error("Failed to load profile:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnread = async () => {
        try {
            const res = await getNotifications({ unreadOnly: true, limit: 1 });
            const items = res?.data?.data || res?.data || [];
            setUnreadCount(Array.isArray(items) ? items.length : 0);
        } catch (_) { }
    };

    const openEdit = () => {
        if (!profile) return;
        setEditForm({
            fullName: profile.fullName || "",
            occupation: parseOccupation(profile.bio),
            location: profile.location || "",
            website: profile.website || "",
            interests: parseInterests(profile.bio),
        });
        setNewAvatar(null);
        setAvatarPreview(null);
        setEditError("");
        setEditOpen(true);
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setNewAvatar(file);
        const reader = new FileReader();
        reader.onload = ev => setAvatarPreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleEditSave = async () => {
        setEditLoading(true);
        setEditError("");
        try {
            let avatarUrl = undefined;

            if (newAvatar) {
                try {
                    const fileName = `avatars/${Date.now()}_${newAvatar.name.replace(/\s+/g, "_")}`;
                    avatarUrl = await storageService.uploadFile(newAvatar, "avatars", fileName);
                } catch (uploadErr) {
                    console.warn("Avatar upload failed:", uploadErr.message);
                }
            }

            // Reconstruct bio from occupation + interests
            const bioParts = [];
            if (editForm.occupation) bioParts.push(`Occupation: ${editForm.occupation}`);
            if (editForm.interests?.length > 0) bioParts.push(`Interests: ${editForm.interests.join(", ")}`);

            const updates = {
                fullName: editForm.fullName || undefined,
                location: editForm.location || undefined,
                website: editForm.website
                    ? editForm.website.startsWith("http") ? editForm.website : `https://${editForm.website}`
                    : undefined,
                bio: bioParts.join("\n") || undefined,
            };
            if (avatarUrl) updates.avatarUrl = avatarUrl;

            // Remove empty values
            Object.keys(updates).forEach(k => { if (!updates[k]) delete updates[k]; });

            await updateUserProfile(updates);
            await fetchProfile(); // Refresh profile from backend
            setEditOpen(false);
        } catch (err) {
            console.error("Failed to save profile:", err);
            const msg = err?.data?.message || err?.message || "Failed to save changes.";
            setEditError(Array.isArray(msg) ? msg.join(". ") : msg);
        } finally {
            setEditLoading(false);
        }
    };

    const occupation = profile ? parseOccupation(profile.bio) : "";
    const interests = profile ? parseInterests(profile.bio) : [];
    const avatarUrl = profile?.avatarUrl;
    const displayName = profile?.fullName || authUser?.email?.split("@")[0] || "User";
    const followerCount = profile?.followersCount || 0;

    const tabs = [
        { id: "posts", label: "Posts" },
        { id: "replies", label: "Replies" },
        { id: "media", label: "Media" },
    ];

    // Interest-based "posts" as placeholder activity (no post entity on viewers)
    const activityItems = interests.slice(0, 4).map((interest, i) => ({
        id: i,
        text: `Interested in: ${interest}`,
        commentCount: 0,
    }));

    return (
        <AppShell>
            <AppHeader title="My Profile" showThemeToggle={true} />

            {/* Loading */}
            {loading ? (
                <div className="flex items-center justify-center h-72">
                    <div className="w-10 h-10 border-4 border-[#00B8A9] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {/* Profile Card */}
                    <div className="px-4 pt-6 pb-4 flex flex-col items-center text-center">
                        {/* Avatar */}
                        <div className="relative mb-4">
                            <div className={`w-24 h-24 rounded-full overflow-hidden flex items-center justify-center ${isDark ? "bg-gray-800" : "bg-gray-200"}`}>
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                                ) : (
                                    <FiUser size={40} className={isDark ? "text-gray-500" : "text-gray-400"} />
                                )}
                            </div>
                        </div>

                        {/* Name */}
                        <h1 className={`text-2xl font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                            {displayName}
                        </h1>

                        {/* Occupation */}
                        {occupation && (
                            <p className={`text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                {occupation}
                            </p>
                        )}

                        {/* Location */}
                        {profile?.location && (
                            <div className={`flex items-center gap-1 text-xs mb-3 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                <IoLocationOutline size={13} />
                                <span>{profile.location}</span>
                            </div>
                        )}

                        {/* Followers + Edit Button */}
                        <div className="flex items-center gap-5 mt-2">
                            <div className="flex items-center gap-1.5">
                                <span className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                                    {followerCount >= 1000
                                        ? `${(followerCount / 1000).toFixed(1)}`
                                        : followerCount}
                                    {followerCount >= 1000 && <span className={`font-normal text-xs ml-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>K</span>}
                                </span>
                                <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Followers</span>
                            </div>

                            <button
                                onClick={openEdit}
                                className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-full border transition-all ${isDark
                                    ? "border-white/30 text-white hover:bg-white/10"
                                    : "border-gray-300 text-gray-800 hover:bg-gray-100"}`}
                            >
                                <IoPencil size={13} />
                                Edit Profile
                            </button>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-full border transition-all ${isDark
                                    ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                                    : "border-red-200 text-red-500 hover:bg-red-50"
                                    }`}
                            >
                                <IoLogOutOutline size={14} />
                                Log Out
                            </button>
                        </div>

                        {/* Website */}
                        {profile?.website && (
                            <a
                                href={ensureUrl(profile.website)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 mt-3 text-xs text-[#00B8A9] hover:underline"
                            >
                                <IoLinkOutline size={13} />
                                {profile.website.replace(/^https?:\/\//, "")}
                            </a>
                        )}

                        {/* Interests pills */}
                        {interests.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                                {interests.slice(0, 5).map(tag => (
                                    <span
                                        key={tag}
                                        className={`text-xs px-2.5 py-1 rounded-full ${isDark ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-600"}`}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className={`sticky top-14 z-20 flex items-center border-b ${isDark ? "bg-gray-950 border-white/10" : "bg-white border-gray-200"}`}>
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
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-gray-900" style={{ backgroundColor: isDark ? "#fff" : "#111" }} />
                                )}
                            </button>
                        ))}
                        <button className={`px-4 py-3 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                            <IoListOutline size={18} />
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="px-3 py-3 space-y-3">
                        {activeTab === "posts" && (
                            <>
                                {activityItems.length > 0 ? (
                                    activityItems.map(item => (
                                        <PostCard key={item.id} item={item} isDark={isDark} />
                                    ))
                                ) : (
                                    <EmptyTabState message="No posts yet" isDark={isDark} />
                                )}
                            </>
                        )}
                        {activeTab === "replies" && (
                            <EmptyTabState message="No replies yet" isDark={isDark} />
                        )}
                        {activeTab === "media" && (
                            <EmptyTabState message="No media yet" isDark={isDark} />
                        )}
                    </div>
                </>
            )}

            {/* Edit Profile Modal */}
            {editOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditOpen(false)} />
                    <div className={`relative w-full sm:max-w-md mx-auto rounded-t-3xl sm:rounded-3xl overflow-hidden ${isDark ? "bg-gray-900" : "bg-white"}`}>
                        {/* Modal Header */}
                        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? "border-white/10" : "border-gray-100"}`}>
                            <button onClick={() => setEditOpen(false)} className={`p-1 rounded-full ${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>
                                <IoClose size={22} />
                            </button>
                            <span className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Edit Profile</span>
                            <button
                                onClick={handleEditSave}
                                disabled={editLoading}
                                className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-full bg-[#00B8A9] text-white hover:bg-[#00A89A] disabled:opacity-50 transition-all"
                            >
                                {editLoading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <><IoCheckmark size={15} />Save</>
                                )}
                            </button>
                        </div>

                        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                            {editError && (
                                <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-xl text-sm">
                                    {editError}
                                </div>
                            )}

                            {/* Avatar Picker */}
                            <div className="flex flex-col items-center pb-2">
                                <div
                                    className={`relative w-20 h-20 rounded-full overflow-hidden cursor-pointer group ${isDark ? "bg-gray-800" : "bg-gray-200"}`}
                                    onClick={() => avatarInputRef.current?.click()}
                                >
                                    {avatarPreview || avatarUrl ? (
                                        <img src={avatarPreview || avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <FiUser size={32} className={isDark ? "text-gray-500" : "text-gray-400"} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <IoCamera size={20} className="text-white" />
                                    </div>
                                </div>
                                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                <button
                                    onClick={() => avatarInputRef.current?.click()}
                                    className="mt-2 text-xs text-[#00B8A9] font-medium"
                                >
                                    Change Photo
                                </button>
                            </div>

                            {/* Fields */}
                            <EditField label="Full Name" value={editForm.fullName} onChange={v => setEditForm(f => ({ ...f, fullName: v }))} isDark={isDark} />
                            <EditField label="Occupation" value={editForm.occupation} placeholder="e.g. Student, Developer..." onChange={v => setEditForm(f => ({ ...f, occupation: v }))} isDark={isDark} />
                            <EditField label="Location" value={editForm.location} placeholder="City, State, Country" onChange={v => setEditForm(f => ({ ...f, location: v }))} isDark={isDark} />
                            <EditField label="Website / LinkedIn" value={editForm.website} placeholder="https://linkedin.com/in/you" onChange={v => setEditForm(f => ({ ...f, website: v }))} isDark={isDark} />
                        </div>
                    </div>
                </div>
            )}
        </AppShell>
    );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function PostCard({ item, isDark }) {
    return (
        <div className={`flex items-start gap-3 p-4 rounded-2xl shadow-sm ${isDark ? "bg-gray-900" : "bg-white"}`}>
            <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                <IoGridOutline size={20} className={isDark ? "text-gray-500" : "text-gray-400"} />
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm leading-relaxed ${isDark ? "text-gray-200" : "text-gray-800"}`}>{item.text}</p>
                <div className={`flex items-center gap-1 mt-2 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    <IoChatbubbleOutline size={13} />
                    <span>{item.commentCount}</span>
                </div>
            </div>
        </div>
    );
}

function EmptyTabState({ message, isDark }) {
    return (
        <div className={`flex flex-col items-center justify-center py-16 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
            <IoGridOutline size={36} className="mb-3 opacity-40" />
            <p className="text-sm">{message}</p>
        </div>
    );
}

function EditField({ label, value, onChange, placeholder, isDark }) {
    return (
        <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                {label}
            </label>
            <input
                type="text"
                value={value || ""}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder || label}
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none transition-all focus:border-[#00B8A9] focus:ring-1 focus:ring-[#00B8A9]/30 ${isDark
                    ? "bg-gray-800 border-white/10 text-white placeholder-gray-600"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"}`}
            />
        </div>
    );
}
