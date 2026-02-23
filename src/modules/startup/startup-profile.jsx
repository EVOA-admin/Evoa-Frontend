import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../config/supabase";
import { getMyStartup, updateStartup } from "../../services/startupsService";
import storageService from "../../services/storageService";
import {
    IoArrowBack, IoNotificationsOutline, IoPencil, IoCamera, IoCheckmark, IoClose,
    IoLocationOutline, IoLinkOutline, IoLogoLinkedin, IoLogoInstagram, IoLogoYoutube,
    IoPeopleOutline, IoRocketOutline, IoDocumentTextOutline, IoPlayCircleOutline,
    IoAddCircleOutline, IoTrashOutline, IoLogOutOutline,
} from "react-icons/io5";
import { FiUser } from "react-icons/fi";
import { getNotifications } from "../../services/notificationsService";
import ensureUrl from "../../utils/ensureUrl";
import AppShell from "../../components/layout/AppShell";
import AppHeader from "../../components/layout/AppHeader";

export default function StartupProfile() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const navigate = useNavigate();
    const { user: authUser } = useAuth();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        navigate('/');
    };

    const [startup, setStartup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("about");
    const [unreadCount, setUnreadCount] = useState(0);

    // Edit modal
    const [editOpen, setEditOpen] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState("");
    const [editForm, setEditForm] = useState({});
    const [newLogo, setNewLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [newPitchDeck, setNewPitchDeck] = useState(null);
    const logoInputRef = useRef();
    const pitchDeckInputRef = useRef();

    useEffect(() => {
        fetchStartup();
        fetchUnread();
    }, []);

    const fetchStartup = async () => {
        try {
            setLoading(true);
            const res = await getMyStartup();
            const s = res?.data?.data || res?.data || res;
            setStartup(s);
        } catch (err) {
            console.error("Failed to load startup:", err);
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
        if (!startup) return;
        setEditForm({
            name: startup.name || "",
            tagline: startup.tagline || "",
            description: startup.description || "",
            stage: startup.stage || "",
            website: startup.website || "",
            industries: startup.industries || [],
            categoryTags: startup.categoryTags || [],
            raisingAmount: startup.raisingAmount || "",
            equityPercentage: startup.equityPercentage || "",
            socialLinks: startup.socialLinks || {},
            founders: startup.founders ? JSON.parse(JSON.stringify(startup.founders)) : [],
            teamMembers: startup.teamMembers ? JSON.parse(JSON.stringify(startup.teamMembers)) : [],
            pitchDeckUrl: startup.pitchDeckUrl || "",
        });
        setNewLogo(null);
        setLogoPreview(null);
        setNewPitchDeck(null);
        setEditError("");
        setEditOpen(true);
    };

    const handleLogoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setNewLogo(file);
        const reader = new FileReader();
        reader.onload = ev => setLogoPreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    const uploadToStorage = async (file, folder) => {
        if (!file) return undefined;
        const ext = file.name.split('.').pop() || '';
        const safeName = file.name.replace(/\s+/g, '_').replace(`.${ext}`, '');
        const path = `${folder}/${Date.now()}_${safeName}.${ext}`;
        try {
            return await storageService.uploadFile(file, 'evoa-media', path);
        } catch (err) {
            console.warn(`Upload to evoa-media failed for ${folder}, trying public:`, err.message);
            try {
                return await storageService.uploadFile(file, 'public', path);
            } catch (fallbackErr) {
                console.warn(`Fallback upload to public failed for ${folder}:`, fallbackErr.message);
                return undefined;
            }
        }
    };

    const handleEditSave = async () => {
        setEditLoading(true);
        setEditError("");
        try {
            let logoUrl = await uploadToStorage(newLogo, 'logos');
            let pitchDeckUrl = await uploadToStorage(newPitchDeck, 'pitch-decks');

            const updates = { ...editForm };
            if (logoUrl) updates.logoUrl = logoUrl;

            if (pitchDeckUrl) {
                updates.pitchDeckUrl = pitchDeckUrl;
            } else if (updates.pitchDeckUrl === "") {
                delete updates.pitchDeckUrl; // Don't overwrite existing URL with empty string
            }

            if (updates.raisingAmount) updates.raisingAmount = parseFloat(updates.raisingAmount) || null;
            if (updates.equityPercentage) updates.equityPercentage = parseFloat(updates.equityPercentage) || null;

            await updateStartup(startup.id, updates);
            await fetchStartup();
            setEditOpen(false);
        } catch (err) {
            const msg = err?.data?.message || err?.message || "Failed to save changes.";
            setEditError(Array.isArray(msg) ? msg.join(". ") : msg);
        } finally {
            setEditLoading(false);
        }
    };

    const formatMoney = (val) => {
        if (!val) return "—";
        const num = parseFloat(val);
        if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
        if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
        return `₹${num.toLocaleString()}`;
    };

    const tabs = [
        { id: "about", label: "About" },
        { id: "team", label: "Team" },
        { id: "pitch", label: "Pitch" },
        { id: "financials", label: "Financials" },
    ];

    const logoDisplay = logoPreview || startup?.logoUrl;
    const locationStr = startup?.location
        ? [startup.location.city, startup.location.state, startup.location.country].filter(Boolean).join(", ")
        : "";

    return (
        <AppShell>
            <AppHeader title="My Profile" />

            {loading ? (
                <div className="flex items-center justify-center h-72">
                    <div className="w-10 h-10 border-4 border-[#00B8A9] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : !startup ? (
                <div className="flex flex-col items-center justify-center h-72 gap-4">
                    <IoRocketOutline size={48} className={isDark ? "text-gray-700" : "text-gray-300"} />
                    <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>No startup profile found</p>
                    <button onClick={() => navigate("/register/startup")} className="px-5 py-2 bg-[#00B8A9] text-white text-sm rounded-full font-semibold">
                        Create Startup
                    </button>
                </div>
            ) : (
                <>
                    {/* Hero Section */}
                    <div className={`${isDark ? "bg-gray-900" : "bg-white"} border-b ${isDark ? "border-white/10" : "border-gray-100"}`}>
                        <div className="px-4 pt-6 pb-5">
                            <div className="flex items-start gap-4">
                                {/* Logo */}
                                <div className={`w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                                    {startup.logoUrl ? (
                                        <img src={startup.logoUrl} alt={startup.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <IoRocketOutline size={32} className={isDark ? "text-gray-500" : "text-gray-400"} />
                                    )}
                                </div>
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h1 className={`text-xl font-bold leading-tight ${isDark ? "text-white" : "text-gray-900"}`}>{startup.name}</h1>
                                    {startup.tagline && <p className={`text-sm mt-0.5 leading-snug ${isDark ? "text-gray-400" : "text-gray-500"}`}>{startup.tagline}</p>}
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {startup.stage && (
                                            <span className="text-[11px] px-2 py-0.5 bg-[#00B8A9]/15 text-[#00B8A9] rounded-full font-medium">{startup.stage}</span>
                                        )}
                                        {startup.industries?.slice(0, 2).map(ind => (
                                            <span key={ind} className={`text-[11px] px-2 py-0.5 rounded-full ${isDark ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-600"}`}>{ind}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Stats Row */}
                            <div className={`grid grid-cols-3 divide-x mt-5 ${isDark ? "divide-white/10" : "divide-gray-100"}`}>
                                <StatItem label="Followers" value={startup.followerCount?.toLocaleString() ?? 0} isDark={isDark} />
                                <StatItem label="Raising" value={formatMoney(startup.raisingAmount)} isDark={isDark} />
                                <StatItem label="Equity" value={startup.equityPercentage ? `${startup.equityPercentage}%` : "—"} isDark={isDark} />
                            </div>

                            {/* Meta */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4">
                                {locationStr && (
                                    <div className={`flex items-center gap-1 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                        <IoLocationOutline size={13} /><span>{locationStr}</span>
                                    </div>
                                )}
                                {startup.website && (
                                    <a href={ensureUrl(startup.website)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-[#00B8A9]">
                                        <IoLinkOutline size={13} /><span>{startup.website.replace(/^https?:\/\//, "")}</span>
                                    </a>
                                )}
                            </div>

                            {/* Category Tags */}
                            {startup.categoryTags?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                    {startup.categoryTags.map(tag => (
                                        <span key={tag} className={`text-xs px-2.5 py-1 rounded-full border ${isDark ? "border-white/15 text-gray-400" : "border-gray-200 text-gray-500"}`}>{tag}</span>
                                    ))}
                                </div>
                            )}

                            {/* Social Links */}
                            {startup.socialLinks && Object.values(startup.socialLinks).some(Boolean) && (
                                <div className="flex items-center gap-3 mt-4">
                                    {startup.socialLinks.linkedin && <a href={ensureUrl(startup.socialLinks.linkedin)} target="_blank" rel="noopener noreferrer" className="text-[#0077B5]"><IoLogoLinkedin size={22} /></a>}
                                    {startup.socialLinks.instagram && <a href={ensureUrl(startup.socialLinks.instagram)} target="_blank" rel="noopener noreferrer" className="text-pink-500"><IoLogoInstagram size={22} /></a>}
                                    {startup.socialLinks.youtube && <a href={ensureUrl(startup.socialLinks.youtube)} target="_blank" rel="noopener noreferrer" className="text-red-500"><IoLogoYoutube size={22} /></a>}
                                </div>
                            )}

                            {/* Edit Profile Button */}
                            <button
                                onClick={openEdit}
                                className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all ${isDark ? "border-white/20 text-white hover:bg-white/10" : "border-gray-200 text-gray-800 hover:bg-gray-50"}`}
                            >
                                <IoPencil size={15} />Edit Startup Profile
                            </button>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className={`mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all ${isDark
                                    ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                                    : "border-red-200 text-red-500 hover:bg-red-50"
                                    }`}
                            >
                                <IoLogOutOutline size={16} />Log Out
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className={`sticky top-14 z-20 flex border-b ${isDark ? "bg-gray-950 border-white/10" : "bg-white border-gray-200"}`}>
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-3 text-sm font-medium relative transition-colors ${activeTab === tab.id ? isDark ? "text-white" : "text-gray-900" : isDark ? "text-gray-500" : "text-gray-400"}`}>
                                {tab.label}
                                {activeTab === tab.id && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full" style={{ backgroundColor: "#00B8A9" }} />}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="px-4 py-4 space-y-4 pb-10">

                        {/* ── About Tab ── */}
                        {activeTab === "about" && (
                            <>
                                {startup.description && (
                                    <Section title="About the Startup" isDark={isDark}>
                                        <p className={`text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>{startup.description}</p>
                                    </Section>
                                )}
                                {startup.verification?.entityType && (
                                    <Section title="Business Entity" isDark={isDark}>
                                        <InfoRow label="Entity Type" value={startup.verification.entityType} isDark={isDark} />
                                        {startup.verification.type && <InfoRow label="Verification" value={startup.verification.type} isDark={isDark} />}
                                    </Section>
                                )}
                                {startup.socialLinks?.productDemo && (
                                    <Section title="Product Demo" isDark={isDark}>
                                        <a href={ensureUrl(startup.socialLinks.productDemo)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#00B8A9]">
                                            <IoPlayCircleOutline size={18} />View Product Demo
                                        </a>
                                    </Section>
                                )}
                            </>
                        )}

                        {/* ── Team Tab ── */}
                        {activeTab === "team" && (
                            <>
                                {startup.founders?.length > 0 && (
                                    <Section title="Founders" isDark={isDark}>
                                        <div className="space-y-3">
                                            {startup.founders.map((f, i) => (
                                                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
                                                    <div className={`w-11 h-11 rounded-full overflow-hidden flex-shrink-0 ${isDark ? "bg-gray-700" : "bg-gray-200"}`}>
                                                        {f.photoUrl ? <img src={f.photoUrl} alt={f.name} className="w-full h-full object-cover" />
                                                            : <div className="w-full h-full flex items-center justify-center"><FiUser size={18} className={isDark ? "text-gray-500" : "text-gray-400"} /></div>}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}>{f.name}</p>
                                                        <p className={`text-xs truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>{f.role}</p>
                                                        {f.mobile && <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{f.mobile}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Section>
                                )}
                                {startup.teamMembers?.length > 0 && (
                                    <Section title="Team Members" isDark={isDark}>
                                        <div className="space-y-3">
                                            {startup.teamMembers.map((m, i) => (
                                                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
                                                    <div className={`w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ${isDark ? "bg-gray-700" : "bg-gray-200"}`}>
                                                        {m.image ? <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
                                                            : <div className="w-full h-full flex items-center justify-center"><FiUser size={16} className={isDark ? "text-gray-500" : "text-gray-400"} /></div>}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-gray-900"}`}>{m.name}</p>
                                                        <p className={`text-xs truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>{m.role}</p>
                                                    </div>
                                                    {m.linkedin && <a href={ensureUrl(m.linkedin)} target="_blank" rel="noopener noreferrer" className="text-[#0077B5]"><IoLogoLinkedin size={18} /></a>}
                                                </div>
                                            ))}
                                        </div>
                                    </Section>
                                )}
                                {!startup.founders?.length && !startup.teamMembers?.length && (
                                    <EmptyTabState message="No team info added yet" isDark={isDark} />
                                )}
                            </>
                        )}

                        {/* ── Pitch Tab ── */}
                        {activeTab === "pitch" && (
                            <>
                                {startup.pitchVideoUrl && (
                                    <Section title="Pitch Video" isDark={isDark}>
                                        <video controls className="w-full rounded-xl mt-1 max-h-48 object-cover" src={startup.pitchVideoUrl}>
                                            Your browser does not support video.
                                        </video>
                                    </Section>
                                )}
                                {startup.pitchDeckUrl && (
                                    <Section title="Pitch Deck" isDark={isDark}>
                                        <a href={ensureUrl(startup.pitchDeckUrl)} target="_blank" rel="noopener noreferrer"
                                            className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium border ${isDark ? "border-white/10 text-[#00B8A9] hover:bg-white/5" : "border-gray-200 text-[#00B8A9] hover:bg-gray-50"}`}>
                                            <IoDocumentTextOutline size={18} />View Pitch Deck (PDF)
                                        </a>
                                    </Section>
                                )}
                                {!startup.pitchVideoUrl && !startup.pitchDeckUrl && (
                                    <EmptyTabState message="No pitch materials added yet" isDark={isDark} />
                                )}
                            </>
                        )}

                        {/* ── Financials Tab ── */}
                        {activeTab === "financials" && (
                            <Section title="Financial Overview" isDark={isDark}>
                                <div className="grid grid-cols-2 gap-3">
                                    <FinancialCard label="Amount Raising" value={formatMoney(startup.raisingAmount)} isDark={isDark} />
                                    <FinancialCard label="Equity Offered" value={startup.equityPercentage ? `${startup.equityPercentage}%` : "—"} isDark={isDark} />
                                    {startup.revenue && <FinancialCard label="Revenue" value={formatMoney(startup.revenue)} isDark={isDark} />}
                                </div>
                            </Section>
                        )}
                    </div>
                </>
            )}

            {/* Edit Modal */}
            {editOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditOpen(false)} />
                    <div className={`relative w-full sm:max-w-lg mx-auto rounded-t-3xl sm:rounded-3xl overflow-hidden ${isDark ? "bg-gray-900" : "bg-white"}`}>
                        {/* Modal Header */}
                        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? "border-white/10" : "border-gray-100"}`}>
                            <button onClick={() => setEditOpen(false)} className={`p-1 rounded-full ${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>
                                <IoClose size={22} />
                            </button>
                            <span className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Edit Startup Profile</span>
                            <button onClick={handleEditSave} disabled={editLoading}
                                className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-full bg-[#00B8A9] text-white hover:bg-[#00A89A] disabled:opacity-50">
                                {editLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><IoCheckmark size={15} />Save</>}
                            </button>
                        </div>

                        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
                            {editError && <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-xl text-sm">{editError}</div>}

                            {/* Logo Picker */}
                            <div className="flex flex-col items-center">
                                <div className={`relative w-20 h-20 rounded-2xl overflow-hidden cursor-pointer group ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
                                    onClick={() => logoInputRef.current?.click()}>
                                    {logoPreview || startup?.logoUrl
                                        ? <img src={logoPreview || startup.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center"><IoRocketOutline size={32} className={isDark ? "text-gray-500" : "text-gray-400"} /></div>}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <IoCamera size={20} className="text-white" />
                                    </div>
                                </div>
                                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                                <button onClick={() => logoInputRef.current?.click()} className="mt-2 text-xs text-[#00B8A9] font-medium">Change Logo</button>
                            </div>

                            {/* Basic Fields */}
                            <EditSection title="Basic Info" isDark={isDark}>
                                <EditField label="Startup Name" value={editForm.name} onChange={v => setEditForm(f => ({ ...f, name: v }))} isDark={isDark} />
                                <EditField label="Tagline" value={editForm.tagline} onChange={v => setEditForm(f => ({ ...f, tagline: v }))} placeholder="Short one-liner..." isDark={isDark} />
                                <EditField label="Description" value={editForm.description} onChange={v => setEditForm(f => ({ ...f, description: v }))} multiline isDark={isDark} />
                                <EditField label="Website" value={editForm.website} onChange={v => setEditForm(f => ({ ...f, website: v }))} isDark={isDark} />
                                <EditField label="Stage" value={editForm.stage} onChange={v => setEditForm(f => ({ ...f, stage: v }))} placeholder="e.g. MVP, Growth..." isDark={isDark} />
                            </EditSection>

                            {/* Fundraising */}
                            <EditSection title="Fundraising" isDark={isDark}>
                                <EditField label="Amount Raising (₹)" value={editForm.raisingAmount} onChange={v => setEditForm(f => ({ ...f, raisingAmount: v }))} placeholder="e.g. 2500000" isDark={isDark} />
                                <EditField label="Equity % Offering" value={editForm.equityPercentage} onChange={v => setEditForm(f => ({ ...f, equityPercentage: v }))} placeholder="e.g. 10" isDark={isDark} />
                            </EditSection>

                            {/* Pitch Files */}
                            <EditSection title="Pitch Files" isDark={isDark}>
                                <div className="space-y-4">
                                    <div>
                                        <p className={`text-sm mb-1 font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>Pitch Deck (PDF)</p>
                                        <div className="flex gap-2 items-center">
                                            <button
                                                onClick={() => pitchDeckInputRef.current?.click()}
                                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${isDark ? "border-white/20 text-white hover:bg-white/10" : "border-gray-300 text-gray-700 hover:bg-gray-100"}`}
                                            >
                                                Upload PDF
                                            </button>
                                            <input
                                                ref={pitchDeckInputRef}
                                                type="file"
                                                accept="application/pdf"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const f = e.target.files?.[0];
                                                    if (f) setNewPitchDeck(f);
                                                }}
                                            />
                                            {newPitchDeck ? (
                                                <span className={`text-xs ${isDark ? "text-[#00B8A9]" : "text-gray-600"}`}>{newPitchDeck.name}</span>
                                            ) : editForm.pitchDeckUrl ? (
                                                <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"} line-clamp-1`}>Existing PDF uploaded</span>
                                            ) : (
                                                <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>No file chosen</span>
                                            )}
                                        </div>
                                    </div>
                                    <EditField label="Pitch Video URL (YouTube/Vimeo)" value={editForm.pitchVideoUrl || ""} onChange={v => setEditForm(f => ({ ...f, pitchVideoUrl: v }))} isDark={isDark} />
                                </div>
                            </EditSection>

                            {/* Social Links */}
                            <EditSection title="Social Links" isDark={isDark}>
                                <EditField label="LinkedIn" value={editForm.socialLinks?.linkedin || ""} onChange={v => setEditForm(f => ({ ...f, socialLinks: { ...f.socialLinks, linkedin: v } }))} isDark={isDark} />
                                <EditField label="Instagram" value={editForm.socialLinks?.instagram || ""} onChange={v => setEditForm(f => ({ ...f, socialLinks: { ...f.socialLinks, instagram: v } }))} isDark={isDark} />
                                <EditField label="YouTube" value={editForm.socialLinks?.youtube || ""} onChange={v => setEditForm(f => ({ ...f, socialLinks: { ...f.socialLinks, youtube: v } }))} isDark={isDark} />
                                <EditField label="Play Store" value={editForm.socialLinks?.playStore || ""} onChange={v => setEditForm(f => ({ ...f, socialLinks: { ...f.socialLinks, playStore: v } }))} isDark={isDark} />
                                <EditField label="Product Demo URL" value={editForm.socialLinks?.productDemo || ""} onChange={v => setEditForm(f => ({ ...f, socialLinks: { ...f.socialLinks, productDemo: v } }))} isDark={isDark} />
                            </EditSection>
                        </div>
                    </div>
                </div>
            )}
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

function InfoRow({ label, value, isDark }) {
    return (
        <div className="flex justify-between items-center py-1.5">
            <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{label}</span>
            <span className={`text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}>{value}</span>
        </div>
    );
}

function FinancialCard({ label, value, isDark }) {
    return (
        <div className={`p-4 rounded-2xl text-center ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
            <p className={`text-lg font-bold ${isDark ? "text-[#00B8A9]" : "text-[#00B8A9]"}`}>{value}</p>
            <p className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{label}</p>
        </div>
    );
}

function EmptyTabState({ message, isDark }) {
    return (
        <div className={`flex flex-col items-center justify-center py-16 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
            <IoRocketOutline size={36} className="mb-3 opacity-40" />
            <p className="text-sm">{message}</p>
        </div>
    );
}

function EditSection({ title, children, isDark }) {
    return (
        <div>
            <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>{title}</p>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

function EditField({ label, value, onChange, placeholder, multiline, isDark }) {
    const cls = `w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none transition-all focus:border-[#00B8A9] focus:ring-1 focus:ring-[#00B8A9]/30 ${isDark ? "bg-gray-800 border-white/10 text-white placeholder-gray-600" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"}`;
    return (
        <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{label}</label>
            {multiline
                ? <textarea rows={3} value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder || label} className={`${cls} resize-none`} />
                : <input type="text" value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder || label} className={cls} />}
        </div>
    );
}
