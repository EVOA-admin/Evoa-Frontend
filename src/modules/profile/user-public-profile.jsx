import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import {
    FaArrowLeft, FaSpinner, FaGlobe, FaLinkedin, FaInstagram,
    FaYoutube, FaMapMarkerAlt, FaBuilding, FaUser, FaHandshake,
    FaPlay, FaRocket, FaChartLine, FaUsers, FaTrophy, FaUserTie,
    FaStar, FaEnvelope, FaCheck, FaLink, FaTwitter, FaFilePdf,
} from "react-icons/fa";
import { HiLightningBolt } from "react-icons/hi";
import apiClient from "../../services/apiClient";
import startupService from "../../services/startupService";

const fmt = (n) => {
    if (!n) return "0";
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
};

const ROLE_COLORS = {
    investor: "from-blue-600 to-cyan-500",
    incubator: "from-purple-600 to-pink-500",
    startup: "from-[#00B8A9] to-[#007a73]",
    viewer: "from-gray-500 to-gray-400",
};

const Tag = ({ label, isDark }) => (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? "bg-white/10 text-white/80" : "bg-gray-100 text-gray-700"}`}>
        {label}
    </span>
);

const InfoRow = ({ icon: Icon, label, value, isDark, href }) => {
    if (!value) return null;
    return (
        <div className={`flex items-start gap-3 py-2.5 border-b ${isDark ? "border-white/8" : "border-gray-100"}`}>
            <Icon size={14} className="text-[#00B8A9] flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
                <p className={`text-[11px] uppercase tracking-wide font-semibold mb-0.5 ${isDark ? "text-white/40" : "text-gray-400"}`}>{label}</p>
                {href
                    ? <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-[#00B8A9] hover:underline break-all">{value}</a>
                    : <p className={`text-sm break-words ${isDark ? "text-white/85" : "text-gray-800"}`}>{value}</p>
                }
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────── STARTUP PROFILE
function StartupProfile({ profile, startup, isDark, currentUser, userRole, navigate }) {
    const isOwner = currentUser?.id === startup?.founderId || currentUser?.id === profile?.id;
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(true);
    const [followCount, setFollowCount] = useState(startup?.followerCount || 0);

    useEffect(() => {
        console.log("currentUser role:", currentUser?.role || userRole, "startup pitchDeckUrl:", startup?.pitchDeckUrl);
        if (!startup?.id || isOwner) { setFollowLoading(false); return; }
        startupService.getFollowStatus(startup.id)
            .then(res => {
                const data = res?.data?.data || res?.data || res;
                setIsFollowing(data?.isFollowing || false);
            })
            .catch(() => { })
            .finally(() => setFollowLoading(false));
    }, [startup?.id]);

    const toggleFollow = async () => {
        if (!startup?.id || followLoading) return;
        setFollowLoading(true);
        const was = isFollowing;
        setIsFollowing(!was);
        setFollowCount(n => was ? Math.max(0, n - 1) : n + 1);
        try {
            if (was) await startupService.unfollowStartup(startup.id);
            else await startupService.followStartup(startup.id);
        } catch (_) {
            setIsFollowing(was);
            setFollowCount(n => was ? n + 1 : Math.max(0, n - 1));
        } finally {
            setFollowLoading(false);
        }
    };

    const loc = startup?.location;
    const socialLinks = startup?.socialLinks || {};

    return (
        <div className="space-y-5">
            {/* Hero card */}
            <div className={`rounded-2xl p-5 ${isDark ? "bg-white/5 border border-white/10" : "bg-white border border-gray-200 shadow-sm"}`}>
                {/* Logo + name + Support btn */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-700">
                        {startup?.logoUrl
                            ? <img src={startup.logoUrl} alt={startup.name} className="w-full h-full object-cover" />
                            : <div className={`w-full h-full bg-gradient-to-br ${ROLE_COLORS.startup} flex items-center justify-center`}>
                                <FaRocket size={20} className="text-white" />
                            </div>
                        }
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-black"}`}>{startup?.name}</h2>
                        {startup?.tagline && <p className={`text-sm mt-0.5 ${isDark ? "text-white/60" : "text-gray-500"}`}>{startup.tagline}</p>}
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            {startup?.stage && <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#00B8A9]/20 text-[#00B8A9]">{startup.stage}</span>}
                            {startup?.industry && <span className={`text-xs ${isDark ? "text-white/50" : "text-gray-500"}`}>{startup.industry}</span>}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                        {!isOwner && (
                            <button
                                onClick={toggleFollow}
                                disabled={followLoading}
                                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isFollowing
                                    ? isDark ? "bg-white/10 text-white" : "bg-gray-100 text-gray-700"
                                    : "bg-[#00B8A9] text-white hover:bg-[#00a098] shadow-lg shadow-[#00B8A9]/30"
                                    }`}
                            >
                                {followLoading
                                    ? <FaSpinner size={12} className="animate-spin" />
                                    : isFollowing ? <><FaCheck size={12} /> Supported</> : <><FaHandshake size={12} /> Support</>
                                }
                            </button>
                        )}
                        {startup?.pitchDeckUrl && (isOwner || ["investor", "incubator"].includes(currentUser?.role || userRole)) && (
                            <a
                                href={startup.pitchDeckUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${isDark ? "border-white/20 text-white hover:bg-white/10" : "border-gray-300 text-gray-800 hover:bg-gray-50"}`}
                            >
                                <FaFilePdf size={12} className="text-red-500" /> Pitchdeck
                            </a>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className={`grid grid-cols-3 gap-2 py-3 border-t border-b ${isDark ? "border-white/10" : "border-gray-100"}`}>
                    {[
                        { label: "Supporters", value: followCount.toLocaleString() },
                        { label: "Raising", value: startup?.raisingAmount ? fmt(startup.raisingAmount) : "—" },
                        { label: "Equity", value: startup?.equityPercentage ? `${startup.equityPercentage}%` : "—" },
                    ].map(s => (
                        <div key={s.label} className="text-center">
                            <p className={`text-base font-bold ${isDark ? "text-white" : "text-black"}`}>{s.value}</p>
                            <p className={`text-[10px] uppercase tracking-wide ${isDark ? "text-white/40" : "text-gray-400"}`}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Description */}
                {startup?.description && (
                    <p className={`mt-3 text-sm leading-relaxed ${isDark ? "text-white/75" : "text-gray-700"}`}>{startup.description}</p>
                )}
            </div>

            {/* Deal / financials */}
            {(startup?.raisingAmount || startup?.equityPercentage || startup?.revenue) && (
                <div className={`rounded-2xl p-5 ${isDark ? "bg-white/5 border border-white/10" : "bg-white border border-gray-200 shadow-sm"}`}>
                    <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? "text-white/40" : "text-gray-400"}`}>Deal Info</p>
                    <div className="grid grid-cols-2 gap-4">
                        {startup?.raisingAmount && (
                            <div>
                                <p className={`text-xs ${isDark ? "text-white/50" : "text-gray-500"}`}>Raising</p>
                                <p className={`text-base font-bold ${isDark ? "text-white" : "text-black"}`}>{fmt(startup.raisingAmount)}</p>
                            </div>
                        )}
                        {startup?.equityPercentage && (
                            <div>
                                <p className={`text-xs ${isDark ? "text-white/50" : "text-gray-500"}`}>Equity</p>
                                <p className={`text-base font-bold ${isDark ? "text-white" : "text-black"}`}>{startup.equityPercentage}%</p>
                            </div>
                        )}
                        {startup?.revenue && (
                            <div>
                                <p className={`text-xs ${isDark ? "text-white/50" : "text-gray-500"}`}>Revenue</p>
                                <p className={`text-base font-bold ${isDark ? "text-white" : "text-black"}`}>{fmt(startup.revenue)}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Details */}
            <div className={`rounded-2xl px-5 py-3 ${isDark ? "bg-white/5 border border-white/10" : "bg-white border border-gray-200 shadow-sm"}`}>
                <InfoRow icon={FaMapMarkerAlt} label="Location" isDark={isDark} value={loc ? `${loc.city || ""}${loc.state ? ", " + loc.state : ""}${loc.country ? ", " + loc.country : ""}`.trim().replace(/^,/, "").trim() : null} />
                <InfoRow icon={FaGlobe} label="Website" isDark={isDark} value={startup?.website} href={startup?.website?.startsWith("http") ? startup.website : startup?.website ? `https://${startup.website}` : null} />
                {socialLinks.linkedin && <InfoRow icon={FaLinkedin} label="LinkedIn" isDark={isDark} value="View Profile" href={socialLinks.linkedin} />}
                {socialLinks.instagram && <InfoRow icon={FaInstagram} label="Instagram" isDark={isDark} value="@instagram" href={socialLinks.instagram} />}
                {socialLinks.youtube && <InfoRow icon={FaYoutube} label="YouTube" isDark={isDark} value="Channel" href={socialLinks.youtube} />}
            </div>

            {/* Industries / Category */}
            {(startup?.industries?.length > 0 || startup?.categoryTags?.length > 0) && (
                <div className={`rounded-2xl p-5 ${isDark ? "bg-white/5 border border-white/10" : "bg-white border border-gray-200 shadow-sm"}`}>
                    <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? "text-white/40" : "text-gray-400"}`}>Focus Areas</p>
                    <div className="flex flex-wrap gap-2">
                        {[...(startup?.industries || []), ...(startup?.categoryTags || [])].filter(Boolean).map((t, i) => (
                            <Tag key={i} label={t} isDark={isDark} />
                        ))}
                    </div>
                </div>
            )}

            {/* Founders */}
            {startup?.founders?.length > 0 && (
                <div className={`rounded-2xl p-5 ${isDark ? "bg-white/5 border border-white/10" : "bg-white border border-gray-200 shadow-sm"}`}>
                    <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? "text-white/40" : "text-gray-400"}`}>Founders</p>
                    <div className="space-y-3">
                        {startup.founders.map((f, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                                    {f.photoUrl
                                        ? <img src={f.photoUrl} alt={f.name} className="w-full h-full object-cover" />
                                        : <div className="w-full h-full bg-gradient-to-br from-[#00B8A9] to-[#007a73] flex items-center justify-center text-white text-sm font-bold">{f.name?.[0]}</div>
                                    }
                                </div>
                                <div>
                                    <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-black"}`}>{f.name}</p>
                                    {f.role && <p className={`text-xs ${isDark ? "text-white/50" : "text-gray-500"}`}>{f.role}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Team members */}
            {startup?.teamMembers?.length > 0 && (
                <div className={`rounded-2xl p-5 ${isDark ? "bg-white/5 border border-white/10" : "bg-white border border-gray-200 shadow-sm"}`}>
                    <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? "text-white/40" : "text-gray-400"}`}>Team</p>
                    <div className="grid grid-cols-2 gap-3">
                        {startup.teamMembers.map((m, i) => (
                            <div key={i} className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                                    {m.image
                                        ? <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
                                        : <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold">{m.name?.[0]}</div>
                                    }
                                </div>
                                <div className="min-w-0">
                                    <p className={`text-xs font-semibold truncate ${isDark ? "text-white" : "text-black"}`}>{m.name}</p>
                                    <p className={`text-[10px] truncate ${isDark ? "text-white/50" : "text-gray-500"}`}>{m.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Hashtags */}
            {startup?.hashtags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {startup.hashtags.map((h, i) => (
                        <button key={i} onClick={() => navigate(`/pitch/hashtag?hashtag=${encodeURIComponent(h)}`)}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-[#00B8A9]/15 text-[#00B8A9] hover:bg-[#00B8A9]/25 transition-colors">
                            #{h}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────── INVESTOR / INCUBATOR PROFILE
function InvestorIncubatorProfile({ profile, isDark, currentUser, navigate }) {
    const role = profile?.role;
    const data = role === "investor" ? profile?.investors?.[0] : profile?.incubators?.[0];
    const canConnect = ["investor", "incubator", "startup"].includes(currentUser?.role);
    const isOwnProfile = currentUser?.id === profile?.id;

    const loc = data?.location;
    const socialLinks = data?.socialLinks || {};

    const statsItems = role === "investor"
        ? [
            { label: "Startups Backed", value: data?.stats?.startupsBacked },
            { label: "Capital Deployed", value: data?.stats?.capitalDeployed },
            { label: "Exits", value: data?.stats?.exits },
        ]
        : [
            { label: "Startups Incubated", value: data?.stats?.startupsIncubated },
            { label: "Funds Raised", value: data?.stats?.fundsRaised },
            { label: "Mentors", value: data?.stats?.mentorsCount },
        ];

    return (
        <div className="space-y-5">
            {/* Hero card */}
            <div className={`rounded-2xl p-5 ${isDark ? "bg-white/5 border border-white/10" : "bg-white border border-gray-200 shadow-sm"}`}>
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-700">
                        {data?.logoUrl || profile?.avatarUrl
                            ? <img src={data?.logoUrl || profile.avatarUrl} alt={data?.name || profile?.fullName} className="w-full h-full object-cover" />
                            : <div className={`w-full h-full bg-gradient-to-br ${ROLE_COLORS[role]} flex items-center justify-center`}>
                                <span className="text-white text-2xl font-bold">{(data?.name || profile?.fullName)?.[0] || "?"}</span>
                            </div>
                        }
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-black"}`}>{data?.name || profile?.fullName}</h2>
                        {data?.designation && <p className={`text-sm ${isDark ? "text-white/60" : "text-gray-500"}`}>{data.designation}</p>}
                        {data?.companyName && <p className={`text-xs mt-0.5 ${isDark ? "text-white/40" : "text-gray-400"}`}>{data.companyName}</p>}
                        {data?.tagline && <p className={`text-xs mt-1 italic ${isDark ? "text-white/50" : "text-gray-400"}`}>{data.tagline}</p>}
                        {data?.verified && (
                            <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-400">
                                <FaCheck size={8} /> Verified
                            </span>
                        )}
                    </div>
                    {!isOwnProfile && canConnect && (
                        <button
                            onClick={() => {
                                apiClient.post(`/users/${profile.id}/connect-click`).catch(() => { });
                                const href = data?.linkedin || (data?.officialEmail ? `mailto:${data.officialEmail}` : null);
                                if (href) window.open(href, "_blank", "noopener,noreferrer");
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[#00B8A9] text-white hover:bg-[#00a098] shadow-lg shadow-[#00B8A9]/30 transition-all flex-shrink-0"
                        >
                            <FaHandshake size={12} /> Connect
                        </button>
                    )}
                </div>

                {/* Stats */}
                {statsItems.some(s => s.value) && (
                    <div className={`grid grid-cols-3 gap-2 py-3 border-t border-b ${isDark ? "border-white/10" : "border-gray-100"}`}>
                        {statsItems.map((s) => s.value ? (
                            <div key={s.label} className="text-center">
                                <p className={`text-base font-bold ${isDark ? "text-white" : "text-black"}`}>{s.value}</p>
                                <p className={`text-[10px] uppercase tracking-wide ${isDark ? "text-white/40" : "text-gray-400"}`}>{s.label}</p>
                            </div>
                        ) : null)}
                    </div>
                )}

                {data?.description && (
                    <p className={`mt-3 text-sm leading-relaxed ${isDark ? "text-white/75" : "text-gray-700"}`}>{data.description}</p>
                )}
            </div>

            {/* Investment / focus details */}
            <div className={`rounded-2xl p-5 ${isDark ? "bg-white/5 border border-white/10" : "bg-white border border-gray-200 shadow-sm"}`}>
                {role === "investor" && (
                    <>
                        {data?.minTicketSize && (
                            <div className={`flex justify-between items-center py-2.5 border-b ${isDark ? "border-white/8" : "border-gray-100"}`}>
                                <div className="flex items-center gap-2">
                                    <FaChartLine size={13} className="text-[#00B8A9]" />
                                    <span className={`text-sm ${isDark ? "text-white/70" : "text-gray-600"}`}>Ticket Size</span>
                                </div>
                                <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-black"}`}>
                                    {fmt(data.minTicketSize)}{data.maxTicketSize ? ` – ${fmt(data.maxTicketSize)}` : "+"}
                                </span>
                            </div>
                        )}
                        {data?.type && (
                            <div className={`flex justify-between items-center py-2.5 border-b ${isDark ? "border-white/8" : "border-gray-100"}`}>
                                <div className="flex items-center gap-2">
                                    <FaUserTie size={13} className="text-[#00B8A9]" />
                                    <span className={`text-sm ${isDark ? "text-white/70" : "text-gray-600"}`}>Investor Type</span>
                                </div>
                                <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-black"}`}>{data.type}</span>
                            </div>
                        )}
                    </>
                )}
                {role === "incubator" && (
                    <>
                        {data?.cohortSize && (
                            <div className={`flex justify-between items-center py-2.5 border-b ${isDark ? "border-white/8" : "border-gray-100"}`}>
                                <div className="flex items-center gap-2">
                                    <FaUsers size={13} className="text-[#00B8A9]" />
                                    <span className={`text-sm ${isDark ? "text-white/70" : "text-gray-600"}`}>Cohort Size</span>
                                </div>
                                <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-black"}`}>{data.cohortSize} startups</span>
                            </div>
                        )}
                        {data?.applicationDeadline && (
                            <div className={`flex justify-between items-center py-2.5 border-b ${isDark ? "border-white/8" : "border-gray-100"}`}>
                                <div className="flex items-center gap-2">
                                    <FaStar size={13} className="text-[#00B8A9]" />
                                    <span className={`text-sm ${isDark ? "text-white/70" : "text-gray-600"}`}>Deadline</span>
                                </div>
                                <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-black"}`}>{new Date(data.applicationDeadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                            </div>
                        )}
                    </>
                )}
                <InfoRow icon={FaMapMarkerAlt} label="Location" isDark={isDark} value={loc ? `${loc.city || ""}${loc.state ? ", " + loc.state : ""}${loc.country ? ", " + loc.country : ""}`.trim().replace(/^,/, "").trim() : null} />
                <InfoRow icon={FaGlobe} label="Website" isDark={isDark} value={data?.website} href={data?.website?.startsWith("http") ? data.website : data?.website ? `https://${data.website}` : null} />
                {data?.linkedin && <InfoRow icon={FaLinkedin} label="LinkedIn" isDark={isDark} value="View Profile" href={data.linkedin} />}
                {data?.officialEmail && <InfoRow icon={FaEnvelope} label="Email" isDark={isDark} value={data.officialEmail} href={`mailto:${data.officialEmail}`} />}
                {socialLinks.instagram && <InfoRow icon={FaInstagram} label="Instagram" isDark={isDark} value="@instagram" href={socialLinks.instagram} />}
                {socialLinks.twitter && <InfoRow icon={FaTwitter} label="Twitter" isDark={isDark} value="@twitter" href={socialLinks.twitter} />}
            </div>

            {/* Sectors & Stages */}
            {(data?.sectors?.length > 0 || data?.stages?.length > 0) && (
                <div className={`rounded-2xl p-5 ${isDark ? "bg-white/5 border border-white/10" : "bg-white border border-gray-200 shadow-sm"}`}>
                    {data?.sectors?.length > 0 && (
                        <>
                            <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? "text-white/40" : "text-gray-400"}`}>Sectors</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {data.sectors.map((s, i) => <Tag key={i} label={s} isDark={isDark} />)}
                            </div>
                        </>
                    )}
                    {data?.stages?.length > 0 && (
                        <>
                            <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? "text-white/40" : "text-gray-400"}`}>Stages</p>
                            <div className="flex flex-wrap gap-2">
                                {data.stages.map((s, i) => <Tag key={i} label={s} isDark={isDark} />)}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Incubator: Program Types & Facilities */}
            {role === "incubator" && (data?.programTypes?.length > 0 || data?.facilities?.length > 0) && (
                <div className={`rounded-2xl p-5 ${isDark ? "bg-white/5 border border-white/10" : "bg-white border border-gray-200 shadow-sm"}`}>
                    {data?.programTypes?.length > 0 && (
                        <>
                            <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? "text-white/40" : "text-gray-400"}`}>Programs</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {data.programTypes.map((p, i) => <Tag key={i} label={p} isDark={isDark} />)}
                            </div>
                        </>
                    )}
                    {data?.facilities?.length > 0 && (
                        <>
                            <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? "text-white/40" : "text-gray-400"}`}>Facilities</p>
                            <div className="flex flex-wrap gap-2">
                                {data.facilities.map((f, i) => <Tag key={i} label={f} isDark={isDark} />)}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Investor credentials */}
            {role === "investor" && data?.credentials?.length > 0 && (
                <div className={`rounded-2xl p-5 ${isDark ? "bg-white/5 border border-white/10" : "bg-white border border-gray-200 shadow-sm"}`}>
                    <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? "text-white/40" : "text-gray-400"}`}>Credentials</p>
                    <div className="space-y-2">
                        {data.credentials.map((c, i) => (
                            <div key={i} className="flex items-start gap-2">
                                <FaTrophy size={11} className="text-yellow-500 mt-1 flex-shrink-0" />
                                <p className={`text-sm ${isDark ? "text-white/75" : "text-gray-700"}`}>{typeof c === "string" ? c : JSON.stringify(c)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Gallery (incubator) */}
            {role === "incubator" && data?.gallery?.length > 0 && (
                <div>
                    <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? "text-white/40" : "text-gray-400"}`}>Gallery</p>
                    <div className="grid grid-cols-3 gap-2">
                        {data.gallery.map((url, i) => (
                            <div key={i} className="aspect-square rounded-xl overflow-hidden">
                                <img src={url} alt={`gallery-${i}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function UserPublicProfile() {
    const { userId } = useParams();
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const navigate = useNavigate();
    const { user: currentUser, userRole } = useAuth();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        apiClient.get(`/users/${userId}`)
            .then(res => setProfile(res?.data?.data || res?.data || res))
            .catch(() => setError("Could not load this profile."))
            .finally(() => setLoading(false));
    }, [userId]);

    const role = profile?.role;
    const startup = profile?.startups?.[0];

    return (
        <div className={`min-h-screen transition-colors ${isDark ? "bg-black" : "bg-gray-50"}`}>
            {/* Header */}
            <div className={`sticky top-0 z-20 flex items-center gap-3 px-4 py-3 border-b ${isDark ? "bg-black/95 border-white/10 backdrop-blur-lg" : "bg-white border-gray-200"}`}>
                <button onClick={() => navigate(-1)} className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isDark ? "text-white hover:bg-white/10" : "text-black hover:bg-gray-100"}`}>
                    <FaArrowLeft size={18} />
                </button>
                <h1 className={`text-base font-bold truncate ${isDark ? "text-white" : "text-black"}`}>
                    {loading ? "Profile" : (role === "startup" ? startup?.name : profile?.fullName) || "User Profile"}
                </h1>
            </div>

            <div className="max-w-lg mx-auto px-4 py-5">
                {loading ? (
                    <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-[#00B8A9]" size={32} /></div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                        <FaUser size={48} className="text-gray-400" />
                        <p className={`font-semibold ${isDark ? "text-white/70" : "text-gray-600"}`}>{error}</p>
                        <button onClick={() => navigate(-1)} className="text-sm text-[#00B8A9] hover:underline">Go back</button>
                    </div>
                ) : role === "startup" ? (
                    <StartupProfile profile={profile} startup={startup} isDark={isDark} currentUser={currentUser} userRole={userRole} navigate={navigate} />
                ) : (role === "investor" || role === "incubator") ? (
                    <InvestorIncubatorProfile profile={profile} isDark={isDark} currentUser={currentUser} navigate={navigate} />
                ) : (
                    /* Viewer profile — minimal */
                    <div className="flex flex-col items-center py-8 gap-3">
                        <div className={`w-24 h-24 rounded-full overflow-hidden ring-4 ${isDark ? "ring-white/20" : "ring-gray-200"}`}>
                            {profile?.avatarUrl
                                ? <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
                                : <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white text-3xl font-bold">{profile?.fullName?.[0] || "?"}</div>
                            }
                        </div>
                        <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-black"}`}>{profile?.fullName}</h2>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400">Viewer</span>
                        {profile?.bio && <p className={`text-sm text-center max-w-xs leading-relaxed mt-1 ${isDark ? "text-white/70" : "text-gray-600"}`}>{profile.bio}</p>}
                        {profile?.createdAt && (
                            <p className={`text-xs mt-2 ${isDark ? "text-white/30" : "text-gray-400"}`}>
                                Member since {new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
