import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle, FiCreditCard, FiUpload } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import SearchableSelect from "../../components/shared/SearchableSelect";
import { createInvestor, getMyInvestorProfile } from "../../services/investorsService";
import { uploadFile } from "../../services/storageService";
import { updateUserProfile } from "../../services/usersService";
import { openRazorpayCheckout } from "../../utils/razorpay";

const REG_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600&family=DM+Mono:wght@300;400&display=swap');
@keyframes reg-fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
.reg-root { min-height:100vh; background:#060607; color:#F4F0E8;
  font-family:'Cormorant Garamond',serif; display:flex; flex-direction:column; position:relative; overflow-x:hidden; }
.reg-root::before { content:''; position:fixed; inset:0; pointer-events:none;
  background-image:linear-gradient(rgba(244,240,232,.025) 1px,transparent 1px),
    linear-gradient(90deg,rgba(244,240,232,.025) 1px,transparent 1px);
  background-size:60px 60px; z-index:0; }
.reg-topbar { position:sticky; top:0; z-index:10; display:flex; align-items:center;
  justify-content:space-between; padding:0 24px; height:64px;
  background:rgba(6,6,7,.92); backdrop-filter:blur(16px);
  border-bottom:1px solid rgba(244,240,232,.06); flex-shrink:0; }
.reg-brand { font-family:'Bebas Neue',sans-serif; font-size:26px; letter-spacing:.1em; color:#F4F0E8; }
.reg-brand span { color:#E8341A; }
.reg-back { display:flex; align-items:center; gap:6px;
  font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.14em; text-transform:uppercase;
  color:rgba(244,240,232,.45); border:1px solid rgba(244,240,232,.1); padding:7px 14px;
  background:none; cursor:pointer; transition:color .2s,border-color .2s; }
.reg-back:hover { color:#E8341A; border-color:rgba(232,52,26,.35); }
.reg-inner { flex:1; display:flex; flex-direction:column; max-width:860px; width:100%;
  margin:0 auto; padding:36px 24px 40px; position:relative; z-index:1; }
.reg-head { margin-bottom:32px; animation:reg-fadeUp .4s ease both; }
.reg-step-label { font-family:'DM Mono',monospace; font-size:9px; letter-spacing:.22em;
  text-transform:uppercase; color:#E8341A; margin-bottom:8px; }
.reg-title { font-family:'Bebas Neue',sans-serif; font-size:clamp(28px,4vw,44px);
  letter-spacing:.04em; color:#F4F0E8; margin-bottom:6px; line-height:.95; }
.reg-subtitle { font-size:14px; font-weight:300; color:rgba(244,240,232,.4); font-style:italic; }
.reg-progress { display:flex; align-items:center; gap:8px; margin-bottom:32px; }
.reg-dot { width:32px; height:3px; background:rgba(244,240,232,.12); transition:background .3s,width .3s; }
.reg-dot.active { background:#E8341A; width:48px; }
.reg-dot.done { background:rgba(232,52,26,.4); }
.reg-card { background:#0a0a0f; border:1px solid rgba(244,240,232,.07); padding:28px;
  flex:1; overflow-y:auto; margin-bottom:24px; animation:reg-fadeUp .4s .1s ease both; }
.reg-input { width:100%; padding:11px 14px; background:#060607; border:1px solid rgba(244,240,232,.12);
  color:#F4F0E8; font-family:'Cormorant Garamond',serif; font-size:15px; font-weight:300;
  outline:none; transition:border-color .2s; }
.reg-input::placeholder { color:rgba(244,240,232,.3); }
.reg-input:focus { border-color:#E8341A; }
.reg-error, .reg-info { padding:12px 16px; font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.06em; margin-top:16px; }
.reg-error { background:rgba(232,52,26,.08); border:1px solid rgba(232,52,26,.25); color:rgba(232,52,26,.9); }
.reg-info { background:rgba(201,168,76,.08); border:1px solid rgba(201,168,76,.22); color:rgba(201,168,76,.92); }
.reg-nav { display:flex; justify-content:space-between; gap:16px; flex-shrink:0; animation:reg-fadeUp .4s .2s ease both; }
.reg-btn-ghost { font-family:'DM Mono',monospace; font-size:11px; letter-spacing:.18em;
  text-transform:uppercase; padding:13px 28px; border:1px solid rgba(244,240,232,.15);
  color:rgba(244,240,232,.4); background:none; cursor:pointer; transition:all .2s; }
.reg-btn-ghost:hover:not(:disabled) { border-color:rgba(244,240,232,.3); color:#F4F0E8; }
.reg-btn-ghost:disabled { opacity:.3; cursor:not-allowed; }
.reg-btn-primary { font-family:'DM Mono',monospace; font-size:11px; letter-spacing:.18em;
  text-transform:uppercase; padding:14px 36px; background:#E8341A; color:#060607;
  border:none; cursor:pointer; transition:background .2s,transform .15s;
  clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px)); }
.reg-btn-primary:hover:not(:disabled) { background:#C9230F; }
.reg-btn-primary:active { transform:scale(.97); }
.reg-btn-primary:disabled { background:rgba(244,240,232,.1); color:rgba(244,240,232,.3); cursor:not-allowed; clip-path:none; }
.reg-plan { display:grid; grid-template-columns:1.2fr .8fr; gap:22px; }
.reg-plan-card { border:1px solid rgba(244,240,232,.08); background:linear-gradient(180deg,rgba(18,18,24,.96),rgba(10,10,15,.96)); padding:22px; }
.reg-plan-kicker { font-family:'DM Mono',monospace; font-size:9px; letter-spacing:.18em; text-transform:uppercase; color:#E8341A; margin-bottom:12px; }
.reg-plan-title { font-family:'Bebas Neue',sans-serif; font-size:28px; letter-spacing:.04em; line-height:.95; margin-bottom:8px; }
.reg-plan-copy { font-size:15px; color:rgba(244,240,232,.58); line-height:1.7; margin-bottom:20px; }
.reg-plan-price { font-family:'Bebas Neue',sans-serif; font-size:44px; color:#C9A84C; line-height:1; margin-bottom:16px; }
.reg-feature-list { display:grid; gap:12px; }
.reg-feature-item { display:flex; gap:10px; align-items:flex-start; font-size:15px; color:rgba(244,240,232,.84); }
.reg-feature-item svg { color:#E8341A; margin-top:3px; flex-shrink:0; }
.reg-pay-meta { display:grid; gap:14px; border-left:1px solid rgba(244,240,232,.08); padding-left:22px; }
.reg-meta-chip { display:inline-flex; align-items:center; gap:8px; width:max-content; border:1px solid rgba(232,52,26,.22); background:rgba(232,52,26,.08); padding:8px 12px; font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.08em; text-transform:uppercase; color:#F4F0E8; }
.reg-helper { font-size:14px; color:rgba(244,240,232,.52); line-height:1.7; }
@media(max-width:900px){ .reg-plan{grid-template-columns:1fr;} .reg-pay-meta{border-left:none;border-top:1px solid rgba(244,240,232,.08);padding-left:0;padding-top:22px;} }
@media(max-width:640px){ .reg-inner{padding:20px 16px 32px;} .reg-card{padding:18px;} .reg-topbar{padding:0 16px;} .reg-nav{flex-direction:column-reverse;} .reg-btn-ghost,.reg-btn-primary{width:100%;} }
`;

const TOTAL_STEPS = 4;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const createInitialFormData = () => ({
  fullName: "",
  profilePhoto: null,
  designation: "",
  investorType: "",
  investmentRange: "",
  sectorFocus: [],
  verificationOption: "",
  sebiNumber: "",
  sebiCertificate: null,
  linkedinProfile: "",
  portfolioLink: "",
  panNumber: "",
  idProof: null,
  companyName: "",
  bio: "",
  website: "",
  city: "",
  state: "",
  country: "India",
  startupStagePreference: [],
  engagementType: "",
});

export default function InvestorRegistration() {
  const navigate = useNavigate();
  const { user, completeRegistration, refreshUserProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(createInitialFormData);
  const [previews, setPreviews] = useState({});
  const [panError, setPanError] = useState("");
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [profileReadyForPayment, setProfileReadyForPayment] = useState(false);
  const [checkingExistingProfile, setCheckingExistingProfile] = useState(true);

  const investorTypes = ["Angel Investor", "Venture Capital Fund", "Micro VC", "Family Office", "Corporate Investor", "Institutional Investor", "Syndicate Leader", "Accelerator / Incubator Investor", "Crowdfunding Platform"];
  const investmentRanges = ["₹0 – ₹10 Lakhs", "₹10L – ₹50L", "₹50L – ₹1 Cr", "₹1 Cr – ₹3 Cr", "₹3 Cr – ₹10 Cr", "₹10 Cr+"];
  const sectors = ["AI / ML", "SaaS", "FinTech", "EdTech", "HealthTech", "D2C / E-commerce", "Mobility", "GreenTech / ClimateTech", "Blockchain / Web3", "Logistics / Supply Chain", "DeepTech", "Consumer Tech", "Agritech", "Others"];
  const startupStages = ["Idea", "MVP", "Early Revenue", "Growth", "Scaling", "Series A+"];
  const engagementTypes = ["Passive Investor", "Active Mentor + Investor", "Lead Investor", "Co-investor", "Syndicate Member"];
  const states = ["Uttar Pradesh", "Delhi NCR", "Maharashtra", "Karnataka", "Tamil Nadu", "Gujarat", "Rajasthan", "West Bengal", "Telangana", "Kerala", "Haryana", "Madhya Pradesh", "Punjab", "Bihar", "Odisha", "Others"];

  useEffect(() => {
    let mounted = true;

    const hydrateExistingInvestor = async () => {
      if (!user) {
        if (mounted) setCheckingExistingProfile(false);
        return;
      }

      if (user?.isPremium && !user?.isPaymentPending) {
        navigate("/investor", { replace: true });
        return;
      }

      try {
        const response = await getMyInvestorProfile();
        const investorProfile = response?.data?.data || response?.data || null;

        if (!mounted) return;

        if (investorProfile) {
          setProfileReadyForPayment(true);
          setCurrentStep(4);
          setInfoMessage("Your investor profile is saved. Complete payment to activate full access.");
        }
      } catch (err) {
        if (err?.status !== 404) {
          console.error("Failed to fetch investor profile:", err);
        }
      } finally {
        if (mounted) {
          setCheckingExistingProfile(false);
        }
      }
    };

    hydrateExistingInvestor();

    return () => {
      mounted = false;
    };
  }, [navigate, user]);

  const parseInvestmentRange = (rangeStr) => {
    if (!rangeStr) return { min: 0, max: 0 };

    const parseValue = (value) => {
      const normalized = value.replace("₹", "").trim();
      if (normalized.includes("Lakhs") || normalized.includes("L")) return parseFloat(normalized) * 100000;
      if (normalized.includes("Cr")) return parseFloat(normalized) * 10000000;
      return parseFloat(normalized) || 0;
    };

    const parts = rangeStr.split("–");
    const min = parseValue(parts[0]);
    const max = parts.length > 1 ? parseValue(parts[1]) : rangeStr.includes("+") ? null : min;
    return { min, max };
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleFileUpload = (field, file) => {
    if (!file) return;

    setFormData((prev) => ({ ...prev, [field]: file }));

    if (file.type.startsWith("image/")) {
      setPreviews((prev) => ({ ...prev, [field]: URL.createObjectURL(file) }));
      return;
    }

    setPreviews((prev) => ({ ...prev, [field]: file.name }));
  };

  const validatePan = (value) => {
    if (!value.trim()) {
      setPanError("");
      return true;
    }

    const isValid = PAN_REGEX.test(value.trim().toUpperCase());
    setPanError(isValid ? "valid" : "invalid");
    return isValid;
  };

  const validateStep = (step = currentStep) => {
    setError("");

    switch (step) {
      case 1:
        if (!formData.fullName.trim()) {
          setError("Full name is required.");
          return false;
        }
        if (!formData.investorType) {
          setError("Please select your investor type.");
          return false;
        }
        return true;
      case 2:
        if (!formData.investmentRange) {
          setError("Please select your investment range.");
          return false;
        }
        if (formData.sectorFocus.length === 0) {
          setError("Please select at least one sector of focus.");
          return false;
        }
        if (!formData.verificationOption) {
          setError("Please select a verification option.");
          return false;
        }
        if (formData.verificationOption === "SEBI" && !formData.sebiNumber.trim()) {
          setError("SEBI Registration Number is required.");
          return false;
        }
        if (formData.verificationOption === "Non-SEBI") {
          if (!formData.panNumber.trim()) {
            setError("PAN Number is required.");
            return false;
          }
          if (!validatePan(formData.panNumber)) {
            setError("Invalid PAN format. Please check the entered number.");
            return false;
          }
        }
        return true;
      case 3:
        if (!formData.companyName.trim()) {
          setError("Company / Fund Name is required.");
          return false;
        }
        if (formData.startupStagePreference.length === 0) {
          setError("Please select at least one startup stage preference.");
          return false;
        }
        return true;
      case 4:
        if (!profileReadyForPayment) {
          setError("Please complete the profile step before continuing to payment.");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const uploadToStorage = async (file, folder) => {
    if (!file) return null;

    const extension = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${extension}`;

    try {
      return await uploadFile(file, "evoa-media", path);
    } catch {
      return await uploadFile(file, "public", path);
    }
  };

  const handleProfileSubmission = async () => {
    if (!validateStep(3)) return;

    try {
      setSubmittingProfile(true);
      setError("");
      setInfoMessage("");

      const [profilePhotoUrl, sebiCertUrl, idProofUrl] = await Promise.all([
        uploadToStorage(formData.profilePhoto, "investors/photos"),
        uploadToStorage(formData.sebiCertificate, "investors/documents"),
        uploadToStorage(formData.idProof, "investors/documents"),
      ]);

      const { min, max } = parseInvestmentRange(formData.investmentRange);
      const investorData = {
        name: formData.companyName || formData.fullName,
        type: formData.investorType || undefined,
        designation: formData.designation || undefined,
        companyName: formData.companyName || undefined,
        tagline: formData.designation || undefined,
        description: formData.bio || undefined,
        website: formData.website || undefined,
        logoUrl: profilePhotoUrl || undefined,
        sectors: formData.sectorFocus,
        stages: formData.startupStagePreference,
        minTicketSize: min || undefined,
        maxTicketSize: max || undefined,
        location: (formData.city || formData.state)
          ? { city: formData.city, state: formData.state, country: formData.country }
          : undefined,
        linkedin: formData.linkedinProfile || undefined,
        credentials: [
          formData.verificationOption === "SEBI" && formData.sebiNumber.trim() ? `SEBI: ${formData.sebiNumber.trim()}` : null,
          formData.verificationOption === "Non-SEBI" && formData.panNumber.trim() ? `PAN: ${formData.panNumber.trim().toUpperCase()}` : null,
          formData.portfolioLink.trim() ? `Portfolio: ${formData.portfolioLink.trim()}` : null,
          sebiCertUrl ? `SEBI Certificate: ${sebiCertUrl}` : null,
          idProofUrl ? `ID Proof: ${idProofUrl}` : null,
        ].filter(Boolean),
      };

      Object.keys(investorData).forEach((key) => {
        if (investorData[key] === undefined) {
          delete investorData[key];
        }
      });

      await createInvestor(investorData);

      if (profilePhotoUrl) {
        await updateUserProfile({ avatarUrl: profilePhotoUrl }).catch(() => {});
      }

      setProfileReadyForPayment(true);
      setCurrentStep(4);
      setInfoMessage("Profile saved. Your account will be activated right after successful payment.");
    } catch (err) {
      console.error("Investor registration save failed:", err);
      setError(err?.message || "Failed to save your investor profile. Please try again.");
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handlePayment = async () => {
    if (!validateStep(4)) return;

    try {
      setPaymentLoading(true);
      setError("");
      setInfoMessage("");

      await openRazorpayCheckout({
        planType: "investor_premium",
        user,
        description: "Investor Premium Activation",
        cancelMessage: "Payment was cancelled. Your registration is saved and you can retry anytime.",
        onSuccess: async () => {
          await completeRegistration();
          await refreshUserProfile();
          navigate("/investor", { replace: true });
        },
      });
    } catch (err) {
      console.error("Investor payment failed:", err);
      setError(err?.message || "Unable to complete payment. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const nextStep = () => {
    if (!validateStep()) return;
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setError("");
      setInfoMessage("");
      setCurrentStep((prev) => prev - 1);
    }
  };

  const renderStep = () => {
    const inputCls = "reg-input";

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-white">1. Identity &amp; Investor Type</h2>
            <input type="text" placeholder="Full Name *" value={formData.fullName} onChange={(e) => handleInputChange("fullName", e.target.value)} className={inputCls} />
            <label className="block text-sm text-white/60">
              Profile Photo (Recommended)
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload("profilePhoto", e.target.files?.[0])} className="hidden" />
              <div className="mt-2 border-2 border-dashed rounded-xl cursor-pointer text-center transition-all overflow-hidden border-white/20 hover:border-[#E8341A]/50">
                {previews.profilePhoto ? (
                  <div className="relative group">
                    <img src={previews.profilePhoto} alt="Profile preview" className="w-full h-32 object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">Click to change</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4"><FiUpload className="mx-auto mb-2" size={22} /><span className="text-xs">Click to upload</span></div>
                )}
              </div>
            </label>
            <input type="text" placeholder="Designation / Role (e.g., Angel Investor, Partner)" value={formData.designation} onChange={(e) => handleInputChange("designation", e.target.value)} className={inputCls} />
            <SearchableSelect
              value={formData.investorType}
              onChange={(value) => handleInputChange("investorType", value)}
              options={investorTypes.map((type) => ({ value: type, label: type }))}
              placeholder="Select Investor Type *"
              isDark
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-white">2. Investment Focus &amp; Verification</h2>
            <SearchableSelect
              value={formData.investmentRange}
              onChange={(value) => handleInputChange("investmentRange", value)}
              options={investmentRanges.map((range) => ({ value: range, label: range }))}
              placeholder="Investment Range *"
              isDark
            />
            <div>
              <label className="block text-sm font-semibold mb-2 text-white">Sector Focus * (Multi-Select)</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {sectors.map((sector) => (
                  <label key={sector} className="flex items-center gap-2 p-1.5 rounded cursor-pointer hover:bg-white/5">
                    <input type="checkbox" checked={formData.sectorFocus.includes(sector)} onChange={() => handleArrayChange("sectorFocus", sector)} className="w-4 h-4" />
                    <span className="text-sm text-white">{sector}</span>
                  </label>
                ))}
              </div>
            </div>
            <SearchableSelect
              value={formData.verificationOption}
              onChange={(value) => handleInputChange("verificationOption", value)}
              options={[
                { value: "SEBI", label: "SEBI-Registered Investor" },
                { value: "Non-SEBI", label: "Non-SEBI Angel Investor" },
              ]}
              placeholder="Select Verification Type *"
              isDark
            />
            {formData.verificationOption === "SEBI" && (
              <div className="space-y-3">
                <input type="text" placeholder="SEBI Registration Number *" value={formData.sebiNumber} onChange={(e) => handleInputChange("sebiNumber", e.target.value)} className={inputCls} />
                <label className="block text-xs sm:text-sm text-white/60">
                  Upload SEBI Certificate (PDF)
                  <input type="file" accept=".pdf" onChange={(e) => handleFileUpload("sebiCertificate", e.target.files?.[0])} className="hidden" />
                  <div className={`mt-2 p-3 border-2 border-dashed rounded-xl cursor-pointer text-center border-white/20 hover:border-[#E8341A]/50 ${previews.sebiCertificate ? "border-[#00B8A9]/40" : ""}`}>
                    {previews.sebiCertificate ? <><span className="text-[#00B8A9]">✔</span><span className="block text-xs mt-1 truncate px-2">{previews.sebiCertificate}</span></> : <><FiUpload className="mx-auto mb-1" size={18} /><span className="text-xs">Click to upload PDF</span></>}
                  </div>
                </label>
              </div>
            )}
            {formData.verificationOption === "Non-SEBI" && (
              <div className="space-y-3">
                <input type="url" placeholder="LinkedIn Profile (Mandatory)" value={formData.linkedinProfile} onChange={(e) => handleInputChange("linkedinProfile", e.target.value)} className={inputCls} />
                <input type="url" placeholder="Portfolio / Past Deals Link" value={formData.portfolioLink} onChange={(e) => handleInputChange("portfolioLink", e.target.value)} className={inputCls} />
                <div>
                  <input
                    type="text"
                    placeholder="PAN Number * (e.g. ABCDE1234F)"
                    value={formData.panNumber}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      handleInputChange("panNumber", value);
                      if (panError) validatePan(value);
                    }}
                    onBlur={(e) => validatePan(e.target.value.toUpperCase())}
                    className={inputCls}
                  />
                  {formData.panNumber.trim() && panError === "invalid" ? <p className="text-xs text-red-500 mt-1 px-1">Invalid format. Please check the entered number.</p> : null}
                  {formData.panNumber.trim() && panError === "valid" ? <p className="text-xs text-green-500 mt-1 px-1">Valid PAN format</p> : null}
                </div>
                <label className="block text-xs sm:text-sm text-white/60">
                  Upload ID Proof (Aadhaar/Passport/Driving License)
                  <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload("idProof", e.target.files?.[0])} className="hidden" />
                  <div className={`mt-2 p-3 border-2 border-dashed rounded-xl cursor-pointer text-center border-white/20 hover:border-[#E8341A]/50 ${previews.idProof ? "border-[#00B8A9]/40" : ""}`}>
                    {previews.idProof
                      ? (typeof previews.idProof === "string" && previews.idProof.startsWith("blob:")
                        ? <img src={previews.idProof} alt="ID proof preview" className="h-20 mx-auto object-contain rounded" />
                        : <><span className="text-[#00B8A9]">✔</span><span className="block text-xs mt-1 truncate px-2">{previews.idProof}</span></>)
                      : <><FiUpload className="mx-auto mb-1" size={18} /><span className="text-xs">Click to upload</span></>}
                  </div>
                </label>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-white">3. Background &amp; Preferences</h2>
            <input type="text" placeholder="Company / Fund Name *" value={formData.companyName} onChange={(e) => handleInputChange("companyName", e.target.value)} className={inputCls} />
            <textarea placeholder="Short Bio / Investment Thesis" value={formData.bio} onChange={(e) => handleInputChange("bio", e.target.value)} rows={3} className={inputCls} />
            <input type="url" placeholder="Website / AngelList / Portfolio Site" value={formData.website} onChange={(e) => handleInputChange("website", e.target.value)} className={inputCls} />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="City" value={formData.city} onChange={(e) => handleInputChange("city", e.target.value)} className={inputCls} />
              <SearchableSelect value={formData.state} onChange={(value) => handleInputChange("state", value)} options={states.map((state) => ({ value: state, label: state }))} placeholder="Select State" isDark />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-white">Startup Stage Preference * (Multi-Select)</label>
              <div className="flex flex-wrap gap-2">
                {startupStages.map((stage) => (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => handleArrayChange("startupStagePreference", stage)}
                    className={`px-3 py-1 text-xs rounded-full border transition-all ${formData.startupStagePreference.includes(stage) ? "bg-[#E8341A] text-white border-[#E8341A]" : "border-white/20 text-white/70 hover:border-[#E8341A]/50"}`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>
            <SearchableSelect value={formData.engagementType} onChange={(value) => handleInputChange("engagementType", value)} options={engagementTypes.map((type) => ({ value: type, label: type }))} placeholder="Engagement Type" isDark />
          </div>
        );
      case 4:
        return (
          <div className="space-y-5">
            <div>
              <div className="reg-plan-kicker">Step 4</div>
              <h2 className="reg-plan-title">Payment &amp; Activation 💼</h2>
              <p className="reg-plan-copy">Complete your payment to unlock full investor access on Evoa.</p>
            </div>

            <div className="reg-plan">
              <div className="reg-plan-card">
                <div className="reg-plan-kicker">Investor Premium</div>
                <div className="reg-plan-price">₹4999/month</div>
                <div className="reg-feature-list">
                  <div className="reg-feature-item"><FiCheckCircle size={16} /> <span>Access all startup insights</span></div>
                  <div className="reg-feature-item"><FiCheckCircle size={16} /> <span>Connect with founders</span></div>
                  <div className="reg-feature-item"><FiCheckCircle size={16} /> <span>Discover high-potential opportunities</span></div>
                </div>
              </div>

              <div className="reg-pay-meta">
                <div className="reg-meta-chip"><FiCreditCard size={14} /> Secure Razorpay checkout</div>
                <p className="reg-helper">Your profile details are already saved. We’ll only unlock the dashboard after Razorpay confirms the payment successfully.</p>
                <p className="reg-helper">If payment fails or you close checkout, your account stays pending and you can retry from this step anytime.</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderPrimaryAction = () => {
    if (currentStep < 3) {
      return <button className="reg-btn-primary" onClick={nextStep}>Next →</button>;
    }

    if (currentStep === 3) {
      return (
        <button className="reg-btn-primary" onClick={handleProfileSubmission} disabled={submittingProfile || checkingExistingProfile}>
          {submittingProfile ? "Saving..." : "Go to Payment →"}
        </button>
      );
    }

    return (
      <button className="reg-btn-primary" onClick={handlePayment} disabled={paymentLoading || !profileReadyForPayment || checkingExistingProfile}>
        {paymentLoading ? "Opening Payment..." : "Continue to Payment"}
      </button>
    );
  };

  return (
    <div className="reg-root">
      <style>{REG_CSS}</style>

      <div className="reg-topbar">
        <div className="reg-brand">EVO<span>-A</span></div>
        <button className="reg-back" onClick={() => navigate("/choice-role")}>
          <FiArrowLeft size={12} /> Back
        </button>
      </div>

      <div className="reg-inner">
        <div className="reg-head">
          <div className="reg-step-label">Step {currentStep} / {TOTAL_STEPS} — Investor Registration</div>
          <div className="reg-title">
            {currentStep === 1 && "Identity & Type"}
            {currentStep === 2 && "Investment Focus"}
            {currentStep === 3 && "Background & Preferences"}
            {currentStep === 4 && "Payment & Activation"}
          </div>
          <div className="reg-subtitle">Complete all required fields to continue</div>
        </div>

        <div className="reg-progress">
          {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
            <div key={index} className={`reg-dot${index + 1 === currentStep ? " active" : index + 1 < currentStep ? " done" : ""}`} />
          ))}
        </div>

        <div className="reg-card">
          {checkingExistingProfile ? <p className="text-sm text-white/60">Loading your registration progress...</p> : renderStep()}
        </div>

        {infoMessage ? <div className="reg-info">{infoMessage}</div> : null}
        {error ? <div className="reg-error">{error}</div> : null}

        <div className="reg-nav">
          <button className="reg-btn-ghost" onClick={prevStep} disabled={currentStep === 1 || paymentLoading || submittingProfile}>
            ← Previous
          </button>
          {renderPrimaryAction()}
        </div>
      </div>
    </div>
  );
}
