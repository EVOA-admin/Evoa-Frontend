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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=DM+Mono:wght@300;400&display=swap');
@keyframes reg-fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }

/* ── Root ── */
.reg-root {
  min-height:100vh; background:#F8FAFC; color:#0F172A;
  font-family:'Inter',sans-serif; display:flex; flex-direction:column;
  position:relative; overflow-x:hidden;
}
.reg-root::before {
  content:''; position:fixed; inset:0; pointer-events:none;
  background-image:radial-gradient(circle,#CBD5E1 1px,transparent 1px);
  background-size:28px 28px; opacity:.55; z-index:0;
}

/* ── Topbar ── */
.reg-topbar {
  position:sticky; top:0; z-index:10; display:flex; align-items:center;
  justify-content:space-between; padding:0 32px; height:64px;
  background:rgba(255,255,255,.95);
  backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
  border-bottom:1px solid #E2E8F0; flex-shrink:0;
  box-shadow:0 1px 3px rgba(15,23,42,.06);
}
.reg-brand { font-family:'Inter',sans-serif; font-size:22px; font-weight:800; letter-spacing:-.02em; color:#0F172A; }
.reg-brand span { color:#1565C0; }
.reg-back {
  display:flex; align-items:center; gap:6px;
  font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.14em; text-transform:uppercase;
  color:#64748B; border:1px solid #E2E8F0; padding:7px 16px; border-radius:6px;
  background:#fff; cursor:pointer; transition:all .2s;
}
.reg-back:hover { color:#1565C0; border-color:rgba(21,101,192,.4); background:#EEF5FF; }

/* ── Inner ── */
.reg-inner {
  flex:1; display:flex; flex-direction:column; max-width:860px; width:100%;
  margin:0 auto; padding:40px 24px 48px; position:relative; z-index:1;
}

/* ── Header ── */
.reg-head { margin-bottom:32px; animation:reg-fadeUp .45s ease both; }
.reg-step-label {
  font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.2em;
  text-transform:uppercase; color:#1565C0; margin-bottom:10px;
  display:flex; align-items:center; gap:8px;
}
.reg-step-label::before { content:''; width:18px; height:2px; background:#1565C0; flex-shrink:0; }
.reg-title {
  font-family:'Inter',sans-serif; font-size:clamp(26px,4vw,40px);
  font-weight:800; letter-spacing:-.025em; color:#0F172A; margin-bottom:8px; line-height:1.1;
}
.reg-subtitle { font-size:15px; font-weight:400; color:#64748B; line-height:1.6; }

/* ── Progress ── */
.reg-progress { display:flex; align-items:center; gap:6px; margin-bottom:32px; }
.reg-dot { width:32px; height:4px; border-radius:2px; background:#E2E8F0; transition:background .3s,width .3s; }
.reg-dot.active { background:#1565C0; width:52px; }
.reg-dot.done { background:rgba(21,101,192,.35); }

/* ── Card ── */
.reg-card {
  background:#FFFFFF; border:1px solid #E2E8F0; border-radius:16px; padding:32px;
  flex:1; overflow-y:auto; margin-bottom:24px;
  animation:reg-fadeUp .45s .1s ease both;
  box-shadow:0 4px 24px rgba(15,23,42,.06),0 1px 4px rgba(15,23,42,.04);
}
.reg-step-title {
  font-family:'Inter',sans-serif; font-size:18px; font-weight:700;
  letter-spacing:-.01em; color:#0F172A; margin-bottom:24px;
  padding-bottom:16px; border-bottom:1px solid #F1F5F9;
}

/* ── Inputs ── */
.reg-input {
  width:100%; padding:11px 14px;
  background:#FFFFFF; border:1.5px solid #E2E8F0; border-radius:8px;
  color:#0F172A; font-family:'Inter',sans-serif; font-size:14px; font-weight:400;
  outline:none; transition:border-color .2s,box-shadow .2s; box-sizing:border-box;
}
.reg-input::placeholder { color:#94A3B8; }
.reg-input:focus { border-color:#1565C0; box-shadow:0 0 0 3px rgba(21,101,192,.10); }
textarea.reg-input { resize:vertical; min-height:80px; }

.reg-label {
  font-family:'Inter',sans-serif; font-size:12px; font-weight:600;
  letter-spacing:.01em; text-transform:uppercase; color:#334155;
  margin-bottom:6px; display:block;
}

/* ── Upload box ── */
.reg-upload {
  border:1.5px dashed #CBD5E1; border-radius:8px; padding:20px; text-align:center;
  cursor:pointer; transition:border-color .2s,background .2s;
  font-family:'Inter',sans-serif; font-size:12px; font-weight:500; color:#94A3B8;
}
.reg-upload:hover { border-color:rgba(21,101,192,.5); color:#1565C0; background:#EEF5FF; }
.reg-upload.filled { border-color:rgba(21,101,192,.45); background:#F0F7FF; }

/* ── Chips ── */
.reg-chip {
  display:inline-block; padding:6px 14px; border-radius:6px;
  border:1.5px solid #E2E8F0; font-family:'Inter',sans-serif;
  font-size:12px; font-weight:500; color:#64748B;
  cursor:pointer; transition:all .18s; background:#fff;
}
.reg-chip:hover { border-color:rgba(21,101,192,.45); color:#1565C0; background:#EEF5FF; }
.reg-chip.on { background:#EEF5FF; border-color:#1565C0; color:#1565C0; font-weight:600; }

/* ── Checkbox label ── */
.reg-check-label {
  display:flex; align-items:center; gap:10px; cursor:pointer;
  font-family:'Inter',sans-serif; font-size:13px; font-weight:500;
  color:#334155; padding:6px 0;
}
.reg-check-label input { accent-color:#1565C0; width:15px; height:15px; }

/* ── Divider section ── */
.reg-divider-section { border-top:1px solid #F1F5F9; margin-top:24px; padding-top:24px; }
.reg-section-label {
  font-family:'Inter',sans-serif; font-size:11px; font-weight:600;
  letter-spacing:.06em; text-transform:uppercase; color:#94A3B8; margin-bottom:14px;
}

/* ── Nav ── */
.reg-nav { display:flex; justify-content:space-between; gap:16px; flex-shrink:0; animation:reg-fadeUp .45s .2s ease both; }

/* ── Buttons ── */
.reg-btn-ghost {
  font-family:'Inter',sans-serif; font-size:13px; font-weight:600;
  padding:12px 24px; border-radius:8px;
  border:1.5px solid #E2E8F0; color:#64748B; background:#fff;
  cursor:pointer; transition:all .2s;
}
.reg-btn-ghost:hover:not(:disabled) { border-color:#1565C0; color:#1565C0; background:#EEF5FF; }
.reg-btn-ghost:disabled { opacity:.4; cursor:not-allowed; }

.reg-btn-primary {
  font-family:'Inter',sans-serif; font-size:13px; font-weight:700;
  padding:13px 32px; border-radius:8px;
  background:#1565C0; color:#fff; border:none; cursor:pointer;
  transition:background .2s,transform .15s,box-shadow .2s;
  box-shadow:0 4px 16px rgba(21,101,192,.32); clip-path:none;
}
.reg-btn-primary:hover:not(:disabled) { background:#1976D2; transform:translateY(-1px); box-shadow:0 6px 24px rgba(21,101,192,.40); }
.reg-btn-primary:active { transform:scale(.97); }
.reg-btn-primary:disabled { background:#CBD5E1; color:#94A3B8; cursor:not-allowed; box-shadow:none; }

/* ── Error ── */
.reg-error {
  background:#FEF2F2; border:1px solid #FECACA; border-radius:8px;
  padding:12px 16px; font-family:'Inter',sans-serif; font-size:13px;
  color:#DC2626; margin-top:16px;
}

/* ── Responsive ── */
@media(max-width:640px) {
  .reg-inner{padding:24px 16px 36px;} .reg-card{padding:20px;border-radius:12px;}
  .reg-topbar{padding:0 16px;}
}
`;

export default function IncubatorRegistration() {
  const { theme } = useTheme();
  const isDark = false;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const MAX_DOC_SIZE = 5 * 1024 * 1024; // 5 MB
  const MAX_LOGO_SIZE = 5 * 1024 * 1024; // 5 MB

  const handleFileUpload = (field, file) => {
    if (!file) return;

    if (field === 'logo' && file.size > MAX_LOGO_SIZE) {
      setError('Logo must be under 5 MB.');
      return;
    }
    if (field === 'verificationDocument' && file.size > MAX_DOC_SIZE) {
      setError('Verification document must be under 5 MB.');
      return;
    }

    setError('');
    setFormData(prev => ({ ...prev, [field]: file }));
    if (file.type.startsWith('image/')) {
      setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
    } else {
      setPreviews(prev => ({ ...prev, [field]: file.name }));
    }
  };

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
        // ── Verification document (Bug Fix 1: was uploaded but URL never saved) ──
        verificationDocumentType: formData.verificationDocumentType || undefined,
        verificationDocumentUrl: verificationDocUrl || undefined,
        // ─────────────────────────────────────────────────────────────────────────
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
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-slate-800">
              1. Identity &amp; Location
            </h2>
            <input type="text" placeholder="Incubator Name *" value={formData.incubatorName} onChange={(e) => handleInputChange('incubatorName', e.target.value)} className={inputCls} />
            <label className="block text-sm text-slate-500">
              Logo Upload
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload('logo', e.target.files[0])} className="hidden" />
              <div className="mt-2 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl cursor-pointer text-center transition-all overflow-hidden text-slate-400">
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
              <SearchableSelect value={formData.state} onChange={(value) => handleInputChange('state', value)} options={states.map(s => ({ value: s, label: s }))} placeholder="Select State *" />
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
            <SearchableSelect value={formData.organizationType} onChange={(value) => handleInputChange('organizationType', value)} options={organizationTypes.map(t => ({ value: t, label: t }))} placeholder="Type of Organization *" />
            <SearchableSelect value={formData.affiliationType} onChange={(value) => handleInputChange('affiliationType', value)} options={affiliationTypes.map(t => ({ value: t, label: t }))} placeholder="Affiliation Type *" />
            <SearchableSelect value={formData.verificationDocumentType} onChange={(value) => handleInputChange('verificationDocumentType', value)} options={verificationDocTypes.map(t => ({ value: t, label: t }))} placeholder="Verification Document Type *" />
            {formData.verificationDocumentType && (
              <label className="block text-xs sm:text-sm text-slate-500">
                Upload Document (PDF/JPG/PNG)
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload('verificationDocument', e.target.files[0])} className="hidden" />
                <div className={`mt-2 p-3 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl cursor-pointer text-center transition-all text-slate-400 ${previews.verificationDocument ? 'border-blue-400' : ''}`}>
                  {previews.verificationDocument
                    ? (typeof previews.verificationDocument === 'string' && previews.verificationDocument.startsWith('blob:')
                      ? <img src={previews.verificationDocument} alt="Doc" className="h-20 mx-auto object-contain rounded" />
                      : <><span className="text-evoa">✔</span><span className="block text-xs mt-1 truncate px-2">{previews.verificationDocument}</span></>)
                    : <><FiUpload className="mx-auto mb-1" size={18} /><span className="text-xs">Click to upload</span></>}
                </div>
              </label>
            )}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide mb-3 text-slate-400">Program Details (Optional)</p>
              <div className="space-y-3">
                <SearchableSelect value={formData.programType} onChange={(value) => handleInputChange('programType', value)} options={programTypes.map(t => ({ value: t, label: t }))} placeholder="Program Type" />
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">Sector Focus (Multi-Select)</label>
                  <div className="flex flex-wrap gap-2">
                    {sectors.map(sector => (
                      <button key={sector} type="button" onClick={() => handleArrayChange('sectorFocus', sector)}
                        className={`px-2.5 py-1 text-xs rounded-full border transition-all ${formData.sectorFocus.includes(sector) ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600'}`}>
                        {sector}
                      </button>
                    ))}
                  </div>
                </div>
                <SearchableSelect value={formData.equityPolicy} onChange={(value) => handleInputChange('equityPolicy', value)} options={equityPolicies.map(p => ({ value: p, label: p }))} placeholder="Equity Policy" />
                {formData.equityPolicy === 'Custom Equity' && (
                  <input type="text" placeholder="Enter Custom Equity %" value={formData.customEquity} onChange={(e) => handleInputChange('customEquity', e.target.value)} className={inputCls} />
                )}
                <SearchableSelect value={formData.fundingSupport} onChange={(value) => handleInputChange('fundingSupport', value)} options={fundingSupports.map(s => ({ value: s, label: s }))} placeholder="Funding Support" />
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
              <label className="block text-sm font-semibold mb-2 text-slate-700">Facilities Offered</label>
              <div className="flex flex-wrap gap-2">
                {facilitiesList.map(facility => (
                  <button key={facility} type="button" onClick={() => handleArrayChange('facilities', facility)}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-all ${formData.facilities.includes(facility) ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600'}`}>
                    {facility}
                  </button>
                ))}
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide mb-3 text-slate-400">Social Proof (Optional)</p>
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
