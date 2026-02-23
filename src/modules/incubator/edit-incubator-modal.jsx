import React, { useState, useEffect } from "react";
import { IoClose, IoCheckmark, IoAdd, IoTrashOutline } from "react-icons/io5";
import { useTheme } from "../../contexts/ThemeContext";
import { updateIncubatorProfile } from "../../services/incubatorsService";

export default function EditIncubatorModal({ isOpen, onClose, profile, onSuccess }) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        tagline: "",
        officialEmail: "",
        description: "",
        website: "",
        cohortSize: 0,
        sectors: [],
        programTypes: [],
        facilities: [],
        location: { city: "", state: "", country: "India" },
        socialLinks: { linkedin: "", instagram: "", youtube: "", twitter: "" },
        organizationType: "",
        affiliationType: "",
        equityPolicy: "",
        fundingSupport: "",
        programDuration: "",
        numberOfMentors: 0,
        portfolioStartups: "",
        phoneNumber: "",
        fullAddress: ""
    });

    useEffect(() => {
        if (profile && isOpen) {
            setFormData({
                name: profile.name || "",
                tagline: profile.tagline || "",
                officialEmail: profile.officialEmail || "",
                description: profile.description || "",
                website: profile.website || "",
                cohortSize: profile.cohortSize || 0,
                sectors: profile.sectors || [],
                programTypes: profile.programTypes || [],
                facilities: profile.facilities || [],
                location: profile.location || { city: "", state: "", country: "India" },
                socialLinks: profile.socialLinks || { linkedin: "", instagram: "", youtube: "", twitter: "" },
                organizationType: profile.organizationType || "",
                affiliationType: profile.affiliationType || "",
                equityPolicy: profile.equityPolicy || "",
                fundingSupport: profile.fundingSupport || "",
                programDuration: profile.programDuration || "",
                numberOfMentors: profile.numberOfMentors || 0,
                portfolioStartups: profile.portfolioStartups || "",
                phoneNumber: profile.phoneNumber || "",
                fullAddress: profile.fullAddress || ""
            });
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

    const handleSave = async () => {
        setLoading(true);
        setError("");
        try {
            await updateIncubatorProfile(formData);
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

    const programTypesList = ['Pre-Incubation', 'Incubation', 'Acceleration', 'Virtual Program', 'Physical Program'];
    const facilitiesList = ['Co-working Space', 'Labs / Prototyping', 'Cloud Credits', 'Mentorship', 'Investor Network', 'Legal Support'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col ${isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? "border-white/10" : "border-gray-100"}`}>
                    <h2 className="text-xl font-bold">Edit Incubator Profile</h2>
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

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Identity & Contact</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="Incubator Name" value={formData.name} onChange={v => handleInputChange('name', v)} isDark={isDark} />
                            <InputField label="Official Email" value={formData.officialEmail} onChange={v => handleInputChange('officialEmail', v)} isDark={isDark} />
                            <InputField label="Phone Number" value={formData.phoneNumber} onChange={v => handleInputChange('phoneNumber', v)} isDark={isDark} />
                            <InputField label="Website" value={formData.website} placeholder="https://..." onChange={v => handleInputChange('website', v)} isDark={isDark} />
                        </div>
                        <InputField label="Tagline" value={formData.tagline} placeholder="Supporting startup growth..." onChange={v => handleInputChange('tagline', v)} isDark={isDark} />
                        <TextAreaField label="About Us" value={formData.description} onChange={v => handleInputChange('description', v)} isDark={isDark} />
                        <TextAreaField label="Full Address" value={formData.fullAddress} onChange={v => handleInputChange('fullAddress', v)} isDark={isDark} />
                    </div>

                    {/* Organization Details */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Organization</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="Organization Type" placeholder="e.g. University, Private" value={formData.organizationType} onChange={v => handleInputChange('organizationType', v)} isDark={isDark} />
                            <InputField label="Affiliation Type" placeholder="e.g. AICTE, DST" value={formData.affiliationType} onChange={v => handleInputChange('affiliationType', v)} isDark={isDark} />
                            <InputField label="Funding Support" value={formData.fundingSupport} onChange={v => handleInputChange('fundingSupport', v)} isDark={isDark} />
                            <InputField label="Equity Policy" value={formData.equityPolicy} onChange={v => handleInputChange('equityPolicy', v)} isDark={isDark} />
                        </div>
                    </div>

                    {/* Program Details */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Program Details</h3>
                        <div>
                            <label className="text-sm font-bold opacity-60 mb-2 block">Program Types</label>
                            <div className="flex flex-wrap gap-2">
                                {programTypesList.map(item => (
                                    <button
                                        key={item}
                                        onClick={() => handleArrayChange('programTypes', item)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${formData.programTypes.includes(item)
                                            ? "bg-[#00B8A9] border-[#00B8A9] text-white"
                                            : isDark ? "bg-white/5 border-white/10 text-white/60 hover:border-white/30" : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
                                            }`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <InputField label="Cohort Size" type="number" value={formData.cohortSize} onChange={v => handleInputChange('cohortSize', parseInt(v) || 0)} isDark={isDark} />
                            <InputField label="Mentors" type="number" value={formData.numberOfMentors} onChange={v => handleInputChange('numberOfMentors', parseInt(v) || 0)} isDark={isDark} />
                            <InputField label="Duration" placeholder="e.g. 12 Weeks" value={formData.programDuration} onChange={v => handleInputChange('programDuration', v)} isDark={isDark} />
                        </div>
                        <TextAreaField label="Portfolio Startups & Success Stories" value={formData.portfolioStartups} onChange={v => handleInputChange('portfolioStartups', v)} isDark={isDark} />
                    </div>

                    {/* Facilities */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Facilities & Support</h3>
                        <div className="flex flex-wrap gap-2">
                            {facilitiesList.map(item => (
                                <button
                                    key={item}
                                    onClick={() => handleArrayChange('facilities', item)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${formData.facilities.includes(item)
                                        ? "bg-blue-600 border-blue-600 text-white"
                                        : isDark ? "bg-white/5 border-white/10 text-white/60 hover:border-white/30" : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
                                        }`}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Social links */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Social Presence</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="LinkedIn" value={formData.socialLinks.linkedin} onChange={v => handleNestedChange('socialLinks', 'linkedin', v)} isDark={isDark} />
                            <InputField label="Instagram" value={formData.socialLinks.instagram} onChange={v => handleNestedChange('socialLinks', 'instagram', v)} isDark={isDark} />
                            <InputField label="YouTube" value={formData.socialLinks.youtube} onChange={v => handleNestedChange('socialLinks', 'youtube', v)} isDark={isDark} />
                            <InputField label="Twitter / X" value={formData.socialLinks.twitter} onChange={v => handleNestedChange('socialLinks', 'twitter', v)} isDark={isDark} />
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
