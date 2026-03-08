import React, { useState, useEffect, useRef } from "react";
import { IoClose, IoCheckmark, IoAdd, IoTrashOutline, IoCamera } from "react-icons/io5";
import { useTheme } from "../../contexts/ThemeContext";
import { updateInvestorProfile } from "../../services/investorsService";
import storageService from "../../services/storageService";

export default function EditInvestorModal({ isOpen, onClose, profile, onSuccess }) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [newAvatar, setNewAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const avatarInputRef = useRef();

    const [formData, setFormData] = useState({
        name: "",
        designation: "",
        companyName: "",
        tagline: "",
        description: "",
        website: "",
        linkedin: "",
        sectors: [],
        stages: [],
        stats: {
            startupsBacked: 0,
            capitalDeployed: "",
            exits: 0
        },
        location: { city: "", state: "", country: "India" }
    });

    useEffect(() => {
        if (profile && isOpen) {
            setFormData({
                name: profile.name || "",
                designation: profile.designation || "",
                companyName: profile.companyName || "",
                tagline: profile.tagline || "",
                description: profile.description || "",
                website: profile.website || "",
                linkedin: profile.linkedin || "",
                sectors: profile.sectors || [],
                stages: profile.stages || [],
                stats: profile.stats || { startupsBacked: 0, capitalDeployed: "", exits: 0 },
                location: profile.location || { city: "", state: "", country: "India" }
            });
            setNewAvatar(null);
            setAvatarPreview(null);
        }
    }, [profile, isOpen]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNestedChange = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: value }
        }));
    };

    const handleArrayChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(t => t !== value)
                : [...prev[field], value]
        }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setNewAvatar(file);
        const reader = new FileReader();
        reader.onload = ev => setAvatarPreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        setLoading(true);
        setError("");
        try {
            let avatarUrl;
            if (newAvatar) {
                try {
                    const fileName = `avatars/${Date.now()}_${newAvatar.name.replace(/\s+/g, "_")}`;
                    avatarUrl = await storageService.uploadFile(newAvatar, "avatars", fileName);
                } catch (uploadErr) {
                    console.warn("Avatar upload failed:", uploadErr.message);
                }
            }
            await updateInvestorProfile({ ...formData, ...(avatarUrl ? { avatarUrl } : {}) });
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error("Failed to update profile:", err);
            setError(err?.data?.message || err?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const sectorsList = ['AI / ML', 'SaaS', 'FinTech', 'EdTech', 'HealthTech', 'D2C', 'GreenTech', 'Blockchain', 'DeepTech', 'Agritech'];
    const stagesList = ['Idea', 'MVP', 'Early Revenue', 'Growth', 'Scaling'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col ${isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? "border-white/10" : "border-gray-100"}`}>
                    <h2 className="text-xl font-bold">Edit Profile</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#00B8A9] text-white font-bold hover:bg-[#00A89A] disabled:opacity-50 transition-all"
                        >
                            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <IoCheckmark size={20} />}
                            Save
                        </button>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                            <IoClose size={24} />
                        </button>
                    </div>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {/* ── Profile Photo ── */}
                    <div className="flex flex-col items-center gap-3 pb-2">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                {avatarPreview || profile?.avatarUrl ? (
                                    <img src={avatarPreview || profile?.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className={`text-3xl font-bold ${isDark ? "text-white/40" : "text-gray-400"}`}>
                                        {(formData.name?.[0] || "?").toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => avatarInputRef.current?.click()}
                                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#00B8A9] text-white flex items-center justify-center shadow-lg hover:bg-[#00A89A] transition-colors"
                            >
                                <IoCamera size={15} />
                            </button>
                        </div>
                        <span className={`text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>Tap camera to change photo</span>
                        <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Basic Identity</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="Full Name" value={formData.name} onChange={v => handleInputChange('name', v)} isDark={isDark} />
                            <InputField label="Designation" value={formData.designation} placeholder="e.g. Partner, Angel..." onChange={v => handleInputChange('designation', v)} isDark={isDark} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="Company / Entity Name" value={formData.companyName} onChange={v => handleInputChange('companyName', v)} isDark={isDark} />
                            <InputField label="Tagline" value={formData.tagline} placeholder="Your investment focus in one line" onChange={v => handleInputChange('tagline', v)} isDark={isDark} />
                        </div>
                        <TextAreaField label="Description / About" value={formData.description} onChange={v => handleInputChange('description', v)} isDark={isDark} />
                    </div>

                    {/* Performance Stats */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Professional Stats</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <InputField
                                label="Startups Backed"
                                type="number"
                                value={formData.stats.startupsBacked}
                                onChange={v => handleNestedChange('stats', 'startupsBacked', parseInt(v) || 0)}
                                isDark={isDark}
                            />
                            <InputField
                                label="Capital Deployed"
                                placeholder="e.g. ₹25 Cr"
                                value={formData.stats.capitalDeployed}
                                onChange={v => handleNestedChange('stats', 'capitalDeployed', v)}
                                isDark={isDark}
                            />
                            <InputField
                                label="Successful Exits"
                                type="number"
                                value={formData.stats.exits}
                                onChange={v => handleNestedChange('stats', 'exits', parseInt(v) || 0)}
                                isDark={isDark}
                            />
                        </div>
                    </div>

                    {/* Focus Area */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Investment Focus</h3>
                        <div>
                            <label className="text-sm font-bold opacity-60 mb-2 block">Sectors</label>
                            <div className="flex flex-wrap gap-2">
                                {sectorsList.map(item => (
                                    <button
                                        key={item}
                                        onClick={() => handleArrayChange('sectors', item)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${formData.sectors.includes(item)
                                            ? "bg-[#00B8A9] border-[#00B8A9] text-white"
                                            : isDark ? "bg-white/5 border-white/10 text-white/60 hover:border-white/30" : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
                                            }`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-bold opacity-60 mb-2 block">Stages</label>
                            <div className="flex flex-wrap gap-2">
                                {stagesList.map(item => (
                                    <button
                                        key={item}
                                        onClick={() => handleArrayChange('stages', item)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${formData.stages.includes(item)
                                            ? "bg-[#00B8A9] border-[#00B8A9] text-white"
                                            : isDark ? "bg-white/5 border-white/10 text-white/60 hover:border-white/30" : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
                                            }`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Online Presence */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Online Presence</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="LinkedIn URL" value={formData.linkedin} placeholder="https://linkedin.com/in/..." onChange={v => handleInputChange('linkedin', v)} isDark={isDark} />
                            <InputField label="Website" value={formData.website} placeholder="https://..." onChange={v => handleInputChange('website', v)} isDark={isDark} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InputField({ label, value, onChange, placeholder, type = "text", isDark }) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-bold opacity-60">{label}</label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder || label}
                className={`w-full px-4 py-3 rounded-2xl border outline-none transition-all focus:border-[#00B8A9] focus:ring-4 focus:ring-[#00B8A9]/10 ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                    }`}
            />
        </div>
    );
}

function TextAreaField({ label, value, onChange, placeholder, isDark }) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-bold opacity-60">{label}</label>
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder || label}
                rows={4}
                className={`w-full px-4 py-3 rounded-2xl border outline-none transition-all focus:border-[#00B8A9] focus:ring-4 focus:ring-[#00B8A9]/10 resize-none ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                    }`}
            />
        </div>
    );
}
