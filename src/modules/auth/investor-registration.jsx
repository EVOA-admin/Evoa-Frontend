import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUpload, FiArrowLeft } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import SearchableSelect from "../../components/shared/SearchableSelect";
import { createInvestor } from "../../services/investorsService";
import { uploadFile } from "../../services/storageService";
import { updateUserProfile } from "../../services/usersService";

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
.reg-step-title { font-family:'Bebas Neue',sans-serif; font-size:22px; letter-spacing:.05em;
  color:#F4F0E8; margin-bottom:24px; padding-bottom:12px;
  border-bottom:1px solid rgba(244,240,232,.06); }
.reg-input { width:100%; padding:11px 14px; background:#060607; border:1px solid rgba(244,240,232,.12);
  color:#F4F0E8; font-family:'Cormorant Garamond',serif; font-size:15px; font-weight:300;
  outline:none; transition:border-color .2s; }
.reg-input::placeholder { color:rgba(244,240,232,.3); }
.reg-input:focus { border-color:#E8341A; }
.reg-label { font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.14em;
  text-transform:uppercase; color:rgba(244,240,232,.4); margin-bottom:6px; display:block; }
.reg-upload { border:1px dashed rgba(244,240,232,.15); padding:20px; text-align:center;
  cursor:pointer; transition:border-color .2s; font-family:'DM Mono',monospace;
  font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:rgba(244,240,232,.35); }
.reg-upload:hover { border-color:rgba(232,52,26,.4); color:#E8341A; }
.reg-upload.filled { border-color:rgba(232,52,26,.35); }
.reg-chip { display:inline-block; padding:5px 12px; border:1px solid rgba(244,240,232,.12);
  font-family:'DM Mono',monospace; font-size:9px; letter-spacing:.1em; text-transform:uppercase;
  color:rgba(244,240,232,.5); cursor:pointer; transition:all .2s; background:none; }
.reg-chip:hover { border-color:rgba(232,52,26,.35); color:#E8341A; }
.reg-chip.on { background:rgba(232,52,26,.1); border-color:#E8341A; color:#E8341A; }
.reg-check-label { display:flex; align-items:center; gap:10px; cursor:pointer;
  font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.1em; text-transform:uppercase;
  color:rgba(244,240,232,.5); padding:6px 0; }
.reg-check-label input { accent-color:#E8341A; width:14px; height:14px; }
.reg-nav { display:flex; justify-content:space-between; gap:16px; flex-shrink:0;
  animation:reg-fadeUp .4s .2s ease both; }
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
.reg-error { background:rgba(232,52,26,.08); border:1px solid rgba(232,52,26,.25); padding:12px 16px;
  font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.06em; color:rgba(232,52,26,.9);
  margin-top:16px; }
.reg-divider-section { border-top:1px solid rgba(244,240,232,.06); margin-top:20px; padding-top:20px; }
.reg-section-label { font-family:'DM Mono',monospace; font-size:9px; letter-spacing:.2em;
  text-transform:uppercase; color:rgba(244,240,232,.3); margin-bottom:16px; }
@media(max-width:640px){ .reg-inner{padding:20px 16px 32px;} .reg-card{padding:18px;} .reg-topbar{padding:0 16px;} }
`;

export default function InvestorRegistration() {
  const { theme } = useTheme();
  const isDark = true; // page shell is always dark — force dark styles throughout
  const navigate = useNavigate();
  const { completeRegistration } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    // Step 1 – Identity & Type
    fullName: '',
    profilePhoto: null,
    designation: '',
    investorType: '',
    // Step 2 – Investment Focus & Verification
    investmentRange: '',
    sectorFocus: [],
    verificationOption: '',
    sebiNumber: '',
    sebiCertificate: null,
    linkedinProfile: '',
    portfolioLink: '',
    panNumber: '',
    idProof: null,
    // Step 3 – Background & Preferences
    companyName: '',
    bio: '',
    website: '',
    city: '',
    state: '',
    country: 'India',
    startupStagePreference: [],
    engagementType: '',
  });

  const investorTypes = ['Angel Investor', 'Venture Capital Fund', 'Micro VC', 'Family Office', 'Corporate Investor', 'Institutional Investor', 'Syndicate Leader', 'Accelerator / Incubator Investor', 'Crowdfunding Platform'];
  const investmentRanges = ['₹0 – ₹10 Lakhs', '₹10L – ₹50L', '₹50L – ₹1 Cr', '₹1 Cr – ₹3 Cr', '₹3 Cr – ₹10 Cr', '₹10 Cr+'];
  const sectors = ['AI / ML', 'SaaS', 'FinTech', 'EdTech', 'HealthTech', 'D2C / E-commerce', 'Mobility', 'GreenTech / ClimateTech', 'Blockchain / Web3', 'Logistics / Supply Chain', 'DeepTech', 'Consumer Tech', 'Agritech', 'Others'];
  const startupStages = ['Idea', 'MVP', 'Early Revenue', 'Growth', 'Scaling', 'Series A+'];
  const engagementTypes = ['Passive Investor', 'Active Mentor + Investor', 'Lead Investor', 'Co-investor', 'Syndicate Member'];
  const states = ['Uttar Pradesh', 'Delhi NCR', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 'West Bengal', 'Telangana', 'Kerala', 'Haryana', 'Madhya Pradesh', 'Punjab', 'Bihar', 'Odisha', 'Others'];

  const parseInvestmentRange = (rangeStr) => {
    if (!rangeStr) return { min: 0, max: 0 };
    const parseValue = (val) => {
      val = val.replace('₹', '').trim();
      if (val.includes('Lakhs') || val.includes('L')) return parseFloat(val) * 100000;
      if (val.includes('Cr')) return parseFloat(val) * 10000000;
      return parseFloat(val) || 0;
    };
    const parts = rangeStr.split('–');
    const min = parseValue(parts[0]);
    const max = parts.length > 1 ? parseValue(parts[1]) : (rangeStr.includes('+') ? null : min);
    return { min, max };
  };

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
  const [panError, setPanError] = useState(''); // '' | 'invalid' | 'valid'

  // PAN regex: 5 uppercase letters, 4 digits, 1 uppercase letter
  const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

  const validatePan = (value) => {
    if (!value.trim()) { setPanError(''); return true; }
    const ok = PAN_REGEX.test(value.trim().toUpperCase());
    setPanError(ok ? 'valid' : 'invalid');
    return ok;
  };

  const validateStep = () => {
    setError('');
    switch (currentStep) {
      case 1:
        if (!formData.fullName.trim()) { setError('Full name is required.'); return false; }
        if (!formData.investorType) { setError('Please select your investor type.'); return false; }
        return true;
      case 2:
        if (!formData.investmentRange) { setError('Please select your investment range.'); return false; }
        if (formData.sectorFocus.length === 0) { setError('Please select at least one sector of focus.'); return false; }
        if (!formData.verificationOption) { setError('Please select a verification option.'); return false; }
        
        if (formData.verificationOption === 'SEBI') {
          if (!formData.sebiNumber.trim()) { setError('SEBI Registration Number is required.'); return false; }
        } else if (formData.verificationOption === 'Non-SEBI') {
          if (!formData.panNumber.trim()) { setError('PAN Number is required.'); return false; }
          if (!validatePan(formData.panNumber)) { setError('Invalid PAN format. Please check the entered number.'); return false; }
        }
        return true;
      case 3:
        if (!formData.companyName.trim()) { setError('Company / Fund Name is required.'); return false; }
        if (formData.startupStagePreference.length === 0) { setError('Please select at least one startup stage preference.'); return false; }
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

      const [profilePhotoUrl, sebiCertUrl, idProofUrl] = await Promise.all([
        uploadToStorage(formData.profilePhoto, 'investors/photos'),
        uploadToStorage(formData.sebiCertificate, 'investors/documents'),
        uploadToStorage(formData.idProof, 'investors/documents'),
      ]);

      const { min, max } = parseInvestmentRange(formData.investmentRange);

      const investorData = {
        name: formData.companyName || formData.fullName,
        type: formData.investorType || undefined,
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
      };

      Object.keys(investorData).forEach(k => { if (investorData[k] === undefined) delete investorData[k]; });

      await createInvestor(investorData);

      // Set the investor's uploaded photo as their profile picture (only if uploaded).
      // Falls back to Google profile photo when no photo is provided.
      if (profilePhotoUrl) {
        await updateUserProfile({ avatarUrl: profilePhotoUrl }).catch(() => {});
      }

      await completeRegistration();
      navigate('/investor');
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
              1. Identity &amp; Investor Type
            </h2>
            <input type="text" placeholder="Full Name *" value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} className={inputCls} />
            <label className={`block text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
              Profile Photo (Recommended)
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload('profilePhoto', e.target.files[0])} className="hidden" />
              <div className={`mt-2 border-2 border-dashed rounded-xl cursor-pointer text-center transition-all overflow-hidden ${isDark ? 'border-white/20 hover:border-[#E8341A]/50' : 'border-black/20 hover:border-[#E8341A]/50'}`}>
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
            <input type="text" placeholder="Designation / Role (e.g., Angel Investor, Partner)" value={formData.designation} onChange={(e) => handleInputChange('designation', e.target.value)} className={inputCls} />
            <SearchableSelect
              value={formData.investorType}
              onChange={(value) => handleInputChange('investorType', value)}
              options={investorTypes.map(type => ({ value: type, label: type }))}
              placeholder="Select Investor Type *"
              isDark={isDark}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-3 sm:space-y-4">
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>
              2. Investment Focus &amp; Verification
            </h2>
            <SearchableSelect
              value={formData.investmentRange}
              onChange={(value) => handleInputChange('investmentRange', value)}
              options={investmentRanges.map(range => ({ value: range, label: range }))}
              placeholder="Investment Range *"
              isDark={isDark}
            />
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Sector Focus * (Multi-Select)</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {sectors.map(sector => (
                  <label key={sector} className={`flex items-center gap-2 p-1.5 rounded cursor-pointer ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
                    <input type="checkbox" checked={formData.sectorFocus.includes(sector)} onChange={() => handleArrayChange('sectorFocus', sector)} className="w-4 h-4" />
                    <span className={`text-sm ${isDark ? 'text-white' : 'text-black'}`}>{sector}</span>
                  </label>
                ))}
              </div>
            </div>
            <SearchableSelect
              value={formData.verificationOption}
              onChange={(value) => handleInputChange('verificationOption', value)}
              options={[
                { value: 'SEBI', label: 'SEBI-Registered Investor' },
                { value: 'Non-SEBI', label: 'Non-SEBI Angel Investor' }
              ]}
              placeholder="Select Verification Type *"
              isDark={isDark}
            />
            {formData.verificationOption === 'SEBI' && (
              <div className="space-y-3">
                <input type="text" placeholder="SEBI Registration Number *" value={formData.sebiNumber} onChange={(e) => handleInputChange('sebiNumber', e.target.value)} className={inputCls} />
                <label className={`block text-xs sm:text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                  Upload SEBI Certificate (PDF)
                  <input type="file" accept=".pdf" onChange={(e) => handleFileUpload('sebiCertificate', e.target.files[0])} className="hidden" />
                  <div className={`mt-2 p-3 border-2 border-dashed rounded-xl cursor-pointer text-center ${isDark ? 'border-white/20 hover:border-[#E8341A]/50' : 'border-black/20 hover:border-[#E8341A]/50'} ${previews.sebiCertificate ? 'border-[#00B8A9]/40' : ''}`}>
                    {previews.sebiCertificate ? <><span className="text-[#00B8A9]">✔</span><span className="block text-xs mt-1 truncate px-2">{previews.sebiCertificate}</span></> : <><FiUpload className="mx-auto mb-1" size={18} /><span className="text-xs">Click to upload PDF</span></>}
                  </div>
                </label>
              </div>
            )}
            {formData.verificationOption === 'Non-SEBI' && (
              <div className="space-y-3">
                <input type="url" placeholder="LinkedIn Profile (Mandatory)" value={formData.linkedinProfile} onChange={(e) => handleInputChange('linkedinProfile', e.target.value)} className={inputCls} />
                <input type="url" placeholder="Portfolio / Past Deals Link" value={formData.portfolioLink} onChange={(e) => handleInputChange('portfolioLink', e.target.value)} className={inputCls} />
                <>
                  <input
                    type="text"
                    placeholder="PAN Number * (e.g. ABCDE1234F)"
                    value={formData.panNumber}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      handleInputChange('panNumber', val);
                      if (panError) validatePan(val);
                    }}
                    onBlur={(e) => validatePan(e.target.value.toUpperCase())}
                    className={inputCls}
                  />
                  {formData.panNumber.trim() && panError === 'invalid' && (
                    <p className="text-xs text-red-500 mt-1 px-1">Invalid format. Please check the entered number.</p>
                  )}
                  {formData.panNumber.trim() && panError === 'valid' && (
                    <p className="text-xs text-green-500 mt-1 px-1">✓ Valid PAN format</p>
                  )}
                </>
                <label className={`block text-xs sm:text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                  Upload ID Proof (Aadhaar/Passport/Driving License)
                  <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload('idProof', e.target.files[0])} className="hidden" />
                  <div className={`mt-2 p-3 border-2 border-dashed rounded-xl cursor-pointer text-center ${isDark ? 'border-white/20 hover:border-[#E8341A]/50' : 'border-black/20 hover:border-[#E8341A]/50'} ${previews.idProof ? 'border-[#00B8A9]/40' : ''}`}>
                    {previews.idProof
                      ? (typeof previews.idProof === 'string' && previews.idProof.startsWith('blob:')
                        ? <img src={previews.idProof} alt="ID" className="h-20 mx-auto object-contain rounded" />
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
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>
              3. Background &amp; Preferences
            </h2>
            <input type="text" placeholder="Company / Fund Name *" value={formData.companyName} onChange={(e) => handleInputChange('companyName', e.target.value)} className={inputCls} />
            <textarea placeholder="Short Bio / Investment Thesis" value={formData.bio} onChange={(e) => handleInputChange('bio', e.target.value)} rows={3} className={inputCls} />
            <input type="url" placeholder="Website / AngelList / Portfolio Site" value={formData.website} onChange={(e) => handleInputChange('website', e.target.value)} className={inputCls} />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="City" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} className={inputCls} />
              <SearchableSelect value={formData.state} onChange={(value) => handleInputChange('state', value)} options={states.map(s => ({ value: s, label: s }))} placeholder="Select State" isDark={isDark} />
            </div>
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Startup Stage Preference * (Multi-Select)</label>
              <div className="flex flex-wrap gap-2">
                {startupStages.map(stage => (
                  <button key={stage} type="button" onClick={() => handleArrayChange('startupStagePreference', stage)}
                    className={`px-3 py-1 text-xs rounded-full border transition-all ${formData.startupStagePreference.includes(stage) ? 'bg-[#E8341A] text-white border-[#00B8A9]' : isDark ? 'border-white/20 text-white/70 hover:border-[#E8341A]/50' : 'border-black/20 text-black/70 hover:border-[#E8341A]/50'}`}>
                    {stage}
                  </button>
                ))}
              </div>
            </div>
            <SearchableSelect value={formData.engagementType} onChange={(value) => handleInputChange('engagementType', value)} options={engagementTypes.map(type => ({ value: type, label: type }))} placeholder="Engagement Type" isDark={isDark} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="reg-root">
      <style>{REG_CSS}</style>

      {/* Top bar */}
      <div className="reg-topbar">
        <div className="reg-brand">EVO<span>-A</span></div>
        <button className="reg-back" onClick={() => navigate('/choice-role')}>
          <FiArrowLeft size={12} /> Back
        </button>
      </div>

      {/* Inner */}
      <div className="reg-inner">
        {/* Head */}
        <div className="reg-head">
          <div className="reg-step-label">Step {currentStep} / {TOTAL_STEPS} — Investor Registration</div>
          <div className="reg-title">
            {currentStep === 1 && 'Identity & Type'}
            {currentStep === 2 && 'Investment Focus'}
            {currentStep === 3 && 'Background & Preferences'}
          </div>
          <div className="reg-subtitle">Complete all required fields to continue</div>
        </div>

        {/* Progress dots */}
        <div className="reg-progress">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className={`reg-dot${i + 1 === currentStep ? ' active' : i + 1 < currentStep ? ' done' : ''}`} />
          ))}
        </div>

        {/* Card */}
        <div className="reg-card">
          {renderStep()}
        </div>

        {/* Error */}
        {error && <div className="reg-error">{error}</div>}

        {/* Nav */}
        <div className="reg-nav">
          <button className="reg-btn-ghost" onClick={prevStep} disabled={currentStep === 1}>
            ← Previous
          </button>
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
