import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUpload, FiArrowLeft } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import SearchableSelect from "../../components/shared/SearchableSelect";
import { createIncubator } from "../../services/incubatorsService";
import { uploadFile } from "../../services/storageService";
import { updateUserProfile } from "../../services/usersService";

const REG_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600&family=DM+Mono:wght@300;400&display=swap');
@keyframes reg-fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
.reg-root{min-height:100vh;background:#060607;color:#F4F0E8;font-family:'Cormorant Garamond',serif;display:flex;flex-direction:column;position:relative;overflow-x:hidden}
.reg-root::before{content:'';position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(244,240,232,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(244,240,232,.025) 1px,transparent 1px);background-size:60px 60px;z-index:0}
.reg-topbar{position:sticky;top:0;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:64px;background:rgba(6,6,7,.92);backdrop-filter:blur(16px);border-bottom:1px solid rgba(244,240,232,.06);flex-shrink:0}
.reg-brand{font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:.1em;color:#F4F0E8}
.reg-brand span{color:#E8341A}
.reg-back{display:flex;align-items:center;gap:6px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:rgba(244,240,232,.45);border:1px solid rgba(244,240,232,.1);padding:7px 14px;background:none;cursor:pointer;transition:color .2s,border-color .2s}
.reg-back:hover{color:#E8341A;border-color:rgba(232,52,26,.35)}
.reg-inner{flex:1;display:flex;flex-direction:column;max-width:860px;width:100%;margin:0 auto;padding:36px 24px 40px;position:relative;z-index:1}
.reg-head{margin-bottom:32px;animation:reg-fadeUp .4s ease both}
.reg-step-label{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:#E8341A;margin-bottom:8px}
.reg-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(28px,4vw,44px);letter-spacing:.04em;color:#F4F0E8;margin-bottom:6px;line-height:.95}
.reg-subtitle{font-size:14px;font-weight:300;color:rgba(244,240,232,.4);font-style:italic}
.reg-progress{display:flex;align-items:center;gap:8px;margin-bottom:32px}
.reg-dot{width:32px;height:3px;background:rgba(244,240,232,.12);transition:background .3s,width .3s}
.reg-dot.active{background:#E8341A;width:48px}
.reg-dot.done{background:rgba(232,52,26,.4)}
.reg-card{background:#0a0a0f;border:1px solid rgba(244,240,232,.07);padding:28px;flex:1;overflow-y:auto;margin-bottom:24px;animation:reg-fadeUp .4s .1s ease both}
.reg-step-title{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:.05em;color:#F4F0E8;margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid rgba(244,240,232,.06)}
.reg-input{width:100%;padding:11px 14px;background:#060607;border:1px solid rgba(244,240,232,.12);color:#F4F0E8;font-family:'Cormorant Garamond',serif;font-size:15px;font-weight:300;outline:none;transition:border-color .2s}
.reg-input::placeholder{color:rgba(244,240,232,.3)}
.reg-input:focus{border-color:#E8341A}
.reg-label{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:rgba(244,240,232,.4);margin-bottom:6px;display:block}
.reg-upload{border:1px dashed rgba(244,240,232,.15);padding:20px;text-align:center;cursor:pointer;transition:border-color .2s;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:rgba(244,240,232,.35)}
.reg-upload:hover{border-color:rgba(232,52,26,.4);color:#E8341A}
.reg-upload.filled{border-color:rgba(232,52,26,.35)}
.reg-chip{display:inline-block;padding:5px 12px;border:1px solid rgba(244,240,232,.12);font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:rgba(244,240,232,.5);cursor:pointer;transition:all .2s;background:none}
.reg-chip:hover{border-color:rgba(232,52,26,.35);color:#E8341A}
.reg-chip.on{background:rgba(232,52,26,.1);border-color:#E8341A;color:#E8341A}
.reg-check-label{display:flex;align-items:center;gap:10px;cursor:pointer;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:rgba(244,240,232,.5);padding:6px 0}
.reg-check-label input{accent-color:#E8341A;width:14px;height:14px}
.reg-nav{display:flex;justify-content:space-between;gap:16px;flex-shrink:0;animation:reg-fadeUp .4s .2s ease both}
.reg-btn-ghost{font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;padding:13px 28px;border:1px solid rgba(244,240,232,.15);color:rgba(244,240,232,.4);background:none;cursor:pointer;transition:all .2s}
.reg-btn-ghost:hover:not(:disabled){border-color:rgba(244,240,232,.3);color:#F4F0E8}
.reg-btn-ghost:disabled{opacity:.3;cursor:not-allowed}
.reg-btn-primary{font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;padding:14px 36px;background:#E8341A;color:#060607;border:none;cursor:pointer;transition:background .2s,transform .15s;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))}
.reg-btn-primary:hover:not(:disabled){background:#C9230F}
.reg-btn-primary:active{transform:scale(.97)}
.reg-btn-primary:disabled{background:rgba(244,240,232,.1);color:rgba(244,240,232,.3);cursor:not-allowed;clip-path:none}
.reg-error{background:rgba(232,52,26,.08);border:1px solid rgba(232,52,26,.25);padding:12px 16px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.06em;color:rgba(232,52,26,.9);margin-top:16px}
.reg-divider-section{border-top:1px solid rgba(244,240,232,.06);margin-top:20px;padding-top:20px}
.reg-section-label{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:rgba(244,240,232,.3);margin-bottom:16px}
@media(max-width:640px){.reg-inner{padding:20px 16px 32px}.reg-card{padding:18px}.reg-topbar{padding:0 16px}}
`;

export default function IncubatorRegistration() {
  const { theme } = useTheme();
  const isDark = true; // page shell is always dark — force dark styles throughout
  const navigate = useNavigate();
  const { completeRegistration } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    // Step 1 – Identity & Location
    incubatorName: '',
    logo: null,
    officialEmail: '',
    websiteUrl: '',
    phoneNumber: '',
    city: '',
    state: '',
    fullAddress: '',
    // Step 2 – Verification & Program
    organizationType: '',
    affiliationType: '',
    verificationDocumentType: '',
    verificationDocument: null,
    programType: '',
    sectorFocus: [],
    equityPolicy: '',
    customEquity: '',
    fundingSupport: '',
    programDuration: '',
    cohortSize: '',
    numberOfMentors: '',
    // Step 3 – Facilities & Social Proof
    facilities: [],
    portfolioStartups: '',
    successStories: '',
    linkedinProfile: '',
    instagram: '',
    youtube: '',
  });

  const organizationTypes = ['Government Incubator', 'University Incubator', 'Corporate Incubator', 'Private Incubator'];
  const affiliationTypes = ['DST (Department of Science & Technology)', 'MeitY (Ministry of Electronics & IT)', 'AICTE', 'MSME', 'State Government', 'Private Registered Entity', 'University / Institute', 'Corporate Innovation Lab', 'Not Affiliated'];
  const verificationDocTypes = ['Government Registration Certificate', 'University Affiliation Letter', 'Private Company Incorporation Certificate (CIN)', 'MSME / Udyam Registration', 'DST / MeitY Recognition Letter', 'Trust / Society Registration Certificate', 'Corporate Legal Incorporation Certificate'];
  const programTypes = ['Pre-Incubation', 'Incubation', 'Acceleration', 'Virtual Program', 'Hybrid Program', 'Physical Program'];
  const sectors = ['Tech', 'DeepTech', 'AI/ML', 'FinTech', 'EdTech', 'HealthTech', 'D2C / FMCG', 'ClimateTech', 'Mobility', 'SaaS', 'Web3', 'AgriTech', 'Others'];
  const equityPolicies = ['0% Equity (Free Program)', '1–2% Equity', '2–5% Equity', 'Custom Equity'];
  const fundingSupports = ['No Funding', 'Grant Only', 'Seed Investment', 'Convertible Note', 'Hybrid Support'];
  const facilitiesList = ['Co-working Space', 'Labs / Prototyping', 'Cloud Credits', 'Legal Support', 'Mentorship Programs', 'Government Scheme Support', 'Corporate Connect', 'Investor Network', 'Market Access'];
  const states = ['Uttar Pradesh', 'Delhi NCR', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 'West Bengal', 'Telangana', 'Kerala', 'Haryana', 'Madhya Pradesh', 'Punjab', 'Bihar', 'Odisha', 'Others'];

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleArrayChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const [previews, setPreviews] = useState({});
  const handleFileUpload = (field, file) => {
    if (!file) return;
    setFormData(prev => ({ ...prev, [field]: file }));
    if (file.type.startsWith('image/')) {
      setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
    } else {
      setPreviews(prev => ({ ...prev, [field]: file.name }));
    }
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateStep = () => {
    setError('');
    switch (currentStep) {
      case 1:
        if (!formData.incubatorName.trim()) { setError('Incubator name is required.'); return false; }
        if (!formData.officialEmail.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(formData.officialEmail)) { setError('A valid official email is required.'); return false; }
        if (!formData.state) { setError('Please select your state.'); return false; }
        if (!formData.city.trim()) { setError('City is required.'); return false; }
        return true;
      case 2:
        if (!formData.organizationType) { setError('Please select your organization type.'); return false; }
        if (!formData.affiliationType) { setError('Please select your affiliation type.'); return false; }
        if (!formData.verificationDocumentType) { setError('Please select a verification document type.'); return false; }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => { if (validateStep() && currentStep < 3) setCurrentStep(currentStep + 1); };
  const prevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const uploadToStorage = async (file, folder) => {
    if (!file) return null;
    const ext = file.name.split('.').pop();
    const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    try {
      return await uploadFile(file, 'evoa-media', path);
    } catch (err) {
      return await uploadFile(file, 'public', path);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const [logoUrl, verificationDocUrl] = await Promise.all([
        uploadToStorage(formData.logo, 'incubators/logos'),
        uploadToStorage(formData.verificationDocument, 'incubators/documents'),
      ]);

      const incubatorData = {
        name: formData.incubatorName,
        programTypes: formData.programType ? [formData.programType] : undefined,
        description: formData.successStories || undefined,
        website: formData.websiteUrl || undefined,
        logoUrl: logoUrl || undefined,
        sectors: formData.sectorFocus.length > 0 ? formData.sectorFocus : undefined,
        location: (formData.city || formData.state)
          ? { city: formData.city, state: formData.state, country: 'India' }
          : undefined,
        cohortSize: parseInt(formData.cohortSize) || undefined,
        facilities: formData.facilities.length > 0 ? formData.facilities : undefined,
        socialLinks: (formData.linkedinProfile || formData.instagram || formData.youtube)
          ? { linkedin: formData.linkedinProfile || undefined, instagram: formData.instagram || undefined, youtube: formData.youtube || undefined }
          : undefined,
        organizationType: formData.organizationType || undefined,
        affiliationType: formData.affiliationType || undefined,
        equityPolicy: formData.equityPolicy === 'Custom Equity' ? formData.customEquity : formData.equityPolicy || undefined,
        fundingSupport: formData.fundingSupport || undefined,
        programDuration: formData.programDuration || undefined,
        numberOfMentors: parseInt(formData.numberOfMentors) || undefined,
        portfolioStartups: formData.portfolioStartups || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        fullAddress: formData.fullAddress || undefined,
      };

      Object.keys(incubatorData).forEach(k => { if (incubatorData[k] === undefined) delete incubatorData[k]; });

      await createIncubator(incubatorData);

      // Set the incubator logo as the user's profile picture (only if uploaded).
      // Falls back to Google profile photo when no logo is provided.
      if (logoUrl) {
        await updateUserProfile({ avatarUrl: logoUrl }).catch(() => {});
      }

      await completeRegistration();
      navigate('/incubator');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const TOTAL_STEPS = 3;
  const inputCls = "reg-input";

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-3 sm:space-y-4">
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>
              1. Identity &amp; Location
            </h2>
            <input type="text" placeholder="Incubator Name *" value={formData.incubatorName} onChange={(e) => handleInputChange('incubatorName', e.target.value)} className={inputCls} />
            <label className={`block text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
              Logo Upload
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload('logo', e.target.files[0])} className="hidden" />
              <div className={`mt-2 border-2 border-dashed rounded-xl cursor-pointer text-center transition-all overflow-hidden ${isDark ? 'border-white/20 hover:border-[#E8341A]/50' : 'border-black/20 hover:border-[#E8341A]/50'}`}>
                {previews.logo ? (
                  <div className="relative group">
                    <img src={previews.logo} alt="Logo preview" className="w-full h-32 object-contain" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">Click to change</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4"><FiUpload className="mx-auto mb-2" size={22} /><span className="text-xs">Click to upload logo</span></div>
                )}
              </div>
            </label>
            <input type="email" placeholder="Official Email ID *" value={formData.officialEmail} onChange={(e) => handleInputChange('officialEmail', e.target.value)} className={inputCls} />
            <input type="url" placeholder="Website URL" value={formData.websiteUrl} onChange={(e) => handleInputChange('websiteUrl', e.target.value)} className={inputCls} />
            <input type="tel" placeholder="Phone Number" value={formData.phoneNumber} onChange={(e) => handleInputChange('phoneNumber', e.target.value)} className={inputCls} />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="City *" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} className={inputCls} />
              <SearchableSelect value={formData.state} onChange={(value) => handleInputChange('state', value)} options={states.map(s => ({ value: s, label: s }))} placeholder="Select State *" isDark={isDark} />
            </div>
            <textarea placeholder="Full Address (Optional)" value={formData.fullAddress} onChange={(e) => handleInputChange('fullAddress', e.target.value)} rows={2} className={inputCls} />
          </div>
        );

      case 2:
        return (
          <div className="space-y-3 sm:space-y-4">
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>
              2. Verification &amp; Program Details
            </h2>
            <SearchableSelect value={formData.organizationType} onChange={(value) => handleInputChange('organizationType', value)} options={organizationTypes.map(t => ({ value: t, label: t }))} placeholder="Type of Organization *" isDark={isDark} />
            <SearchableSelect value={formData.affiliationType} onChange={(value) => handleInputChange('affiliationType', value)} options={affiliationTypes.map(t => ({ value: t, label: t }))} placeholder="Affiliation Type *" isDark={isDark} />
            <SearchableSelect value={formData.verificationDocumentType} onChange={(value) => handleInputChange('verificationDocumentType', value)} options={verificationDocTypes.map(t => ({ value: t, label: t }))} placeholder="Verification Document Type *" isDark={isDark} />
            {formData.verificationDocumentType && (
              <label className={`block text-xs sm:text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                Upload Document (PDF/JPG/PNG)
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload('verificationDocument', e.target.files[0])} className="hidden" />
                <div className={`mt-2 p-3 border-2 border-dashed rounded-xl cursor-pointer text-center ${isDark ? 'border-white/20 hover:border-[#E8341A]/50' : 'border-black/20 hover:border-[#E8341A]/50'} ${previews.verificationDocument ? 'border-[#00B8A9]/40' : ''}`}>
                  {previews.verificationDocument
                    ? (typeof previews.verificationDocument === 'string' && previews.verificationDocument.startsWith('blob:')
                      ? <img src={previews.verificationDocument} alt="Doc" className="h-20 mx-auto object-contain rounded" />
                      : <><span className="text-[#00B8A9]">✔</span><span className="block text-xs mt-1 truncate px-2">{previews.verificationDocument}</span></>)
                    : <><FiUpload className="mx-auto mb-1" size={18} /><span className="text-xs">Click to upload</span></>}
                </div>
              </label>
            )}
            <div className={`border-t pt-4 ${isDark ? 'border-[rgba(244,240,232,.07)]' : 'border-[rgba(0,0,0,.08)]'}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isDark ? 'text-white/40' : 'text-black/40'}`}>Program Details (Optional)</p>
              <div className="space-y-3">
                <SearchableSelect value={formData.programType} onChange={(value) => handleInputChange('programType', value)} options={programTypes.map(t => ({ value: t, label: t }))} placeholder="Program Type" isDark={isDark} />
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Sector Focus (Multi-Select)</label>
                  <div className="flex flex-wrap gap-2">
                    {sectors.map(sector => (
                      <button key={sector} type="button" onClick={() => handleArrayChange('sectorFocus', sector)}
                        className={`px-2.5 py-1 text-xs rounded-full border transition-all ${formData.sectorFocus.includes(sector) ? 'bg-[#E8341A] text-white border-[#00B8A9]' : isDark ? 'border-white/20 text-white/70 hover:border-[#E8341A]/50' : 'border-black/20 text-black/70 hover:border-[#E8341A]/50'}`}>
                        {sector}
                      </button>
                    ))}
                  </div>
                </div>
                <SearchableSelect value={formData.equityPolicy} onChange={(value) => handleInputChange('equityPolicy', value)} options={equityPolicies.map(p => ({ value: p, label: p }))} placeholder="Equity Policy" isDark={isDark} />
                {formData.equityPolicy === 'Custom Equity' && (
                  <input type="text" placeholder="Enter Custom Equity %" value={formData.customEquity} onChange={(e) => handleInputChange('customEquity', e.target.value)} className={inputCls} />
                )}
                <SearchableSelect value={formData.fundingSupport} onChange={(value) => handleInputChange('fundingSupport', value)} options={fundingSupports.map(s => ({ value: s, label: s }))} placeholder="Funding Support" isDark={isDark} />
                <div className="grid grid-cols-3 gap-3">
                  <input type="text" placeholder="Duration" value={formData.programDuration} onChange={(e) => handleInputChange('programDuration', e.target.value)} className={inputCls} />
                  <input type="number" placeholder="Cohort Size" value={formData.cohortSize} onChange={(e) => handleInputChange('cohortSize', e.target.value)} className={inputCls} />
                  <input type="number" placeholder="# Mentors" value={formData.numberOfMentors} onChange={(e) => handleInputChange('numberOfMentors', e.target.value)} className={inputCls} />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-3 sm:space-y-4">
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>
              3. Facilities &amp; Social Proof
            </h2>
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Facilities Offered</label>
              <div className="flex flex-wrap gap-2">
                {facilitiesList.map(facility => (
                  <button key={facility} type="button" onClick={() => handleArrayChange('facilities', facility)}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-all ${formData.facilities.includes(facility) ? 'bg-[#E8341A] text-white border-[#00B8A9]' : isDark ? 'border-white/20 text-white/70 hover:border-[#E8341A]/50' : 'border-black/20 text-black/70 hover:border-[#E8341A]/50'}`}>
                    {facility}
                  </button>
                ))}
              </div>
            </div>
            <div className={`border-t pt-4 ${isDark ? 'border-[rgba(244,240,232,.07)]' : 'border-[rgba(0,0,0,.08)]'}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isDark ? 'text-white/40' : 'text-black/40'}`}>Social Proof (Optional)</p>
              <div className="space-y-3">
                <textarea placeholder="Portfolio Startups (names or links)" value={formData.portfolioStartups} onChange={(e) => handleInputChange('portfolioStartups', e.target.value)} rows={2} className={inputCls} />
                <textarea placeholder="Top Startup Success Stories" value={formData.successStories} onChange={(e) => handleInputChange('successStories', e.target.value)} rows={2} className={inputCls} />
                <input type="url" placeholder="LinkedIn Profile" value={formData.linkedinProfile} onChange={(e) => handleInputChange('linkedinProfile', e.target.value)} className={inputCls} />
                <input type="url" placeholder="Instagram (Optional)" value={formData.instagram} onChange={(e) => handleInputChange('instagram', e.target.value)} className={inputCls} />
                <input type="url" placeholder="YouTube (Optional)" value={formData.youtube} onChange={(e) => handleInputChange('youtube', e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="reg-root">
      <style>{REG_CSS}</style>
      <div className="reg-topbar">
        <div className="reg-brand">EVO<span>-A</span></div>
        <button className="reg-back" onClick={() => navigate('/choice-role')}>
          <FiArrowLeft size={12} /> Back
        </button>
      </div>
      <div className="reg-inner">
        <div className="reg-head">
          <div className="reg-step-label">Step {currentStep} / {TOTAL_STEPS} — Incubator Registration</div>
          <div className="reg-title">
            {currentStep === 1 && 'Identity & Location'}
            {currentStep === 2 && 'Verification & Program'}
            {currentStep === 3 && 'Facilities & Social Proof'}
          </div>
          <div className="reg-subtitle">Complete all required fields to continue</div>
        </div>
        <div className="reg-progress">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className={`reg-dot${i + 1 === currentStep ? ' active' : i + 1 < currentStep ? ' done' : ''}`} />
          ))}
        </div>
        <div className="reg-card">{renderStep()}</div>
        {error && <div className="reg-error">{error}</div>}
        <div className="reg-nav">
          <button className="reg-btn-ghost" onClick={prevStep} disabled={currentStep === 1}>← Previous</button>
          {currentStep < TOTAL_STEPS ? (
            <button className="reg-btn-primary" onClick={nextStep}>Next →</button>
          ) : (
            <button className="reg-btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting…' : 'Submit →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
