import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUpload, FiX, FiArrowLeft } from "react-icons/fi";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import SearchableSelect from "../../components/shared/SearchableSelect";
import logo from "../../assets/logo.avif";
import storageService from "../../services/storageService";
import startupsService from "../../services/startupsService";

export default function StartupRegistration() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { completeRegistration } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    // Step 1 – Founder(s) + Startup Basics
    founders: [{ name: '', email: '', mobile: '', role: '', photo: null }],
    startupName: '',
    startupUsername: '',
    startupLogo: null,
    companyEmail: '',
    city: '',
    state: '',
    country: 'India',
    // Step 2 – Industry, Stage & Verification
    industries: [],
    stage: '',
    entityType: '',
    verificationType: '',
    cin: '',
    gstin: '',
    udyamNumber: '',
    idProof: null,
    businessProof: null,
    // Step 3 – Pitch & Links
    shortDescription: '',
    pitchVideo: null,
    pitchDeck: null,
    amountRaising: '',
    equityGiving: '',
    preMoneyValuation: '',
    hashtags: '',
    websiteUrl: '',
    linkedin: '',
    instagram: '',
    youtube: '',
    playStore: '',
    productDemo: '',
    brochure: null,
  });

  const founderRoles = ['CEO', 'CTO', 'COO', 'CMO', 'CFO', 'Co-founder', 'Solo Founder'];
  const industries = ['AI / ML', 'SaaS', 'FinTech', 'EdTech', 'HealthTech', 'Mobility', 'D2C / E-commerce', 'FoodTech', 'DeepTech', 'Blockchain / Web3', 'Agritech', 'GreenTech / ClimateTech', 'Gaming', 'Cybersecurity', 'Manufacturing', 'Others'];
  const stages = ['Idea', 'Prototype', 'MVP', 'Early Revenue', 'Growth', 'Scaling', 'Series A+'];
  const entityTypes = ['Private Limited (Pvt Ltd)', 'LLP', 'Partnership', 'Sole Proprietorship', 'MSME Registered', 'Not Registered Yet'];
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

  const addFounder = () => setFormData(prev => ({
    ...prev,
    founders: [...prev.founders, { name: '', email: '', mobile: '', role: '', photo: null }]
  }));

  const removeFounder = (index) => setFormData(prev => ({
    ...prev,
    founders: prev.founders.filter((_, i) => i !== index)
  }));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filePreviews, setFilePreviews] = useState({});
  const [verificationError, setVerificationError] = useState(''); // '' | 'invalid' | 'valid'

  // ── Regex patterns for verification numbers ──────────────────────────────
  const VERIFICATION_REGEX = {
    CIN: /^[LU]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/,
    GST: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$/,
    Udyam: /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/,
  };

  const validateVerificationField = (type, value) => {
    if (!type || !value.trim()) { setVerificationError(''); return true; }
    const regex = VERIFICATION_REGEX[type];
    if (!regex) { setVerificationError(''); return true; }
    const ok = regex.test(value.trim().toUpperCase());
    setVerificationError(ok ? 'valid' : 'invalid');
    return ok;
  };

  const handleFileUpload = (field, file) => {
    if (!file) return;
    // Validate pitch video size (max 50MB)
    if (field === 'pitchVideo' && file.size > 50 * 1024 * 1024) {
      setError('Video size must be under 50 MB.');
      return;
    }
    setFormData(prev => ({ ...prev, [field]: file }));
    if (file.type.startsWith('image/')) {
      setFilePreviews(prev => ({ ...prev, [field]: { type: 'image', url: URL.createObjectURL(file) } }));
    } else if (file.type.startsWith('video/')) {
      setFilePreviews(prev => ({ ...prev, [field]: { type: 'video', url: URL.createObjectURL(file) } }));
    } else {
      setFilePreviews(prev => ({ ...prev, [field]: { type: 'file', name: file.name } }));
    }
  };

  const validateStep = () => {
    setError('');
    switch (currentStep) {
      case 1: {
        for (let i = 0; i < formData.founders.length; i++) {
          const f = formData.founders[i];
          if (!f.name.trim()) { setError(`Founder ${i + 1}: Full name is required.`); return false; }
          if (!f.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(f.email)) { setError(`Founder ${i + 1}: A valid email is required.`); return false; }
          if (!f.role) { setError(`Founder ${i + 1}: Please select a role.`); return false; }
        }
        if (!formData.startupName.trim()) { setError('Startup name is required.'); return false; }
        if (!formData.startupUsername.trim()) { setError('Startup username / handle is required.'); return false; }
        if (!formData.companyEmail.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(formData.companyEmail)) { setError('A valid company email is required.'); return false; }
        if (!formData.city.trim()) { setError('City is required.'); return false; }
        if (!formData.state) { setError('Please select your state.'); return false; }
        return true;
      }
      case 2: {
        if (formData.industries.length === 0) { setError('Please select at least one industry.'); return false; }
        if (!formData.stage) { setError('Please select the startup stage.'); return false; }
        if (!formData.entityType) { setError('Please select your entity type.'); return false; }
        if (formData.entityType !== 'Not Registered Yet') {
          // Verification type is mandatory for registered entities
          if (!formData.verificationType) { setError('Please select a verification type (CIN / GST / Udyam).'); return false; }
          const verVal = formData.verificationType === 'CIN' ? formData.cin
            : formData.verificationType === 'GST' ? formData.gstin
              : formData.verificationType === 'Udyam' ? formData.udyamNumber : '';
          if (!verVal.trim()) { setError('Please enter your verification number.'); return false; }
          if (!validateVerificationField(formData.verificationType, verVal)) {
            setError('Invalid verification number format. Please check the entered number.');
            return false;
          }
        } else {
          // Business proof is mandatory for unregistered entities
          if (!formData.businessProof) { setError('Please upload a business proof document.'); return false; }
        }
        return true;
      }
      case 3: {
        if (!formData.shortDescription.trim() || formData.shortDescription.trim().length < 20) {
          setError('Please enter a short description (at least 20 characters).');
          return false;
        }
        return true;
      }
      default:
        return true;
    }
  };

  const nextStep = () => { if (validateStep() && currentStep < 3) setCurrentStep(currentStep + 1); };
  const prevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const uploadToStorage = async (file, path) => {
    if (!file) return null;
    try {
      return await storageService.uploadFile(file, 'evoa-media', `startups/${Date.now()}_${path}_${file.name}`);
    } catch {
      return await storageService.uploadFile(file, 'public', `startups/${Date.now()}_${path}_${file.name}`);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    try {
      setLoading(true);
      setError('');

      const logoUrl = await uploadToStorage(formData.startupLogo, 'logo');
      const idProofUrl = await uploadToStorage(formData.idProof, 'id_proof');
      const businessProofUrl = await uploadToStorage(formData.businessProof, 'business_proof');

      // Upload pitch video directly (no compression)
      const pitchVideoUrl = await uploadToStorage(formData.pitchVideo, 'pitch_video');
      const pitchDeckUrl = await uploadToStorage(formData.pitchDeck, 'pitch_deck');
      const brochureUrl = await uploadToStorage(formData.brochure, 'brochure');

      const foundersWithPhotos = await Promise.all(formData.founders.map(async (founder, i) => ({
        ...founder,
        photoUrl: await uploadToStorage(founder.photo, `founder_${i}`),
      })));

      const payload = {
        name: formData.startupName,
        username: formData.startupUsername,
        companyEmail: formData.companyEmail,
        website: formData.websiteUrl,
        stage: formData.stage,
        industries: formData.industries,
        location: { city: formData.city, state: formData.state, country: formData.country },
        founders: foundersWithPhotos.map(f => ({ name: f.name, email: f.email, mobile: f.mobile, role: f.role, photoUrl: f.photoUrl })),
        verification: formData.entityType !== 'Not Registered Yet'
          ? {
            entityType: formData.entityType,
            type: formData.verificationType,
            value: formData.verificationType === 'CIN' ? formData.cin
              : formData.verificationType === 'GST' ? formData.gstin
                : formData.verificationType === 'Udyam' ? formData.udyamNumber : '',
            documentUrl: '',
          }
          : { entityType: 'Unregistered', type: 'Documents', value: 'Uploaded', documentUrl: idProofUrl },
        pitchVideoUrl,
        pitchDeckUrl,
        description: formData.shortDescription,
        socialLinks: {
          linkedin: formData.linkedin,
          instagram: formData.instagram,
          youtube: formData.youtube,
          playStore: formData.playStore,
          productDemo: formData.productDemo,
          website: formData.websiteUrl,
        },
        raisingAmount: Number(formData.amountRaising) || 0,
        equityPercentage: Number(formData.equityGiving) || 0,
        preMoneyValuation: Number(formData.preMoneyValuation) || 0,
        hashtags: formData.hashtags,
        teamMembers: [],
      };

      await startupsService.createStartup(payload);
      // NOTE: The backend's createStartup() automatically creates the pitch reel
      // from pitchVideoUrl. Do NOT call reelsService.createReel() here — doing so
      // creates a duplicate reel record in the database.

      await completeRegistration();
      navigate('/startup');
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#E8341A] focus:ring-[#E8341A]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#E8341A] focus:ring-[#E8341A]/30'}`;

  const FileUploadBox = ({ field, label, accept, previewHeight = 'h-28' }) => (
    <label className={`block text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
      {label}
      <input type="file" accept={accept} onChange={(e) => handleFileUpload(field, e.target.files[0])} className="hidden" />
      <div className={`mt-2 border-2 border-dashed rounded-xl cursor-pointer overflow-hidden transition-all ${isDark ? 'border-white/20 hover:border-[#E8341A]/50' : 'border-black/20 hover:border-[#E8341A]/50'}`}>
        {filePreviews[field]?.type === 'image' && <img src={filePreviews[field].url} alt="preview" className={`w-full ${previewHeight} object-cover`} />}
        {filePreviews[field]?.type === 'video' && <video src={filePreviews[field].url} controls className={`w-full max-h-40 object-cover`} />}
        {filePreviews[field]?.type === 'file' && (
          <div className={`p-3 flex items-center gap-2 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <span className="text-xl">📄</span>
            <span className={`text-xs truncate flex-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{filePreviews[field].name}</span>
            <span className="text-[#00B8A9] text-xs">✓</span>
          </div>
        )}
        {!filePreviews[field] && (
          <div className="p-4 text-center"><FiUpload className="mx-auto mb-2" size={22} /><span className="text-xs">Click to upload</span></div>
        )}
      </div>
    </label>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className={`text-lg sm:text-xl font-semibold ${isDark ? 'text-white' : 'text-black'}`}>1. Founder(s) &amp; Startup Basics</h2>

            {/* Founders */}
            <div className="space-y-3">
              {formData.founders.map((founder, index) => (
                <div key={index} className={`p-3 sm:p-4 rounded-xl border ${isDark ? 'bg-black/50 border-white/10' : 'bg-gray-50 border-black/10'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Founder {index + 1}</span>
                    {formData.founders.length > 1 && (
                      <button type="button" onClick={() => removeFounder(index)} className={`p-1 ${isDark ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'}`}>
                        <FiX size={16} />
                      </button>
                    )}
                  </div>
                  <div className="space-y-2.5">
                    <input type="text" placeholder="Founder Name *" value={founder.name}
                      onChange={(e) => { const f = [...formData.founders]; f[index].name = e.target.value; setFormData(p => ({ ...p, founders: f })); }}
                      className={inputCls} />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="email" placeholder="Founder Email *" value={founder.email}
                        onChange={(e) => { const f = [...formData.founders]; f[index].email = e.target.value; setFormData(p => ({ ...p, founders: f })); }}
                        className={inputCls} />
                      <input type="tel" placeholder="Mobile Number" value={founder.mobile}
                        onChange={(e) => { const f = [...formData.founders]; f[index].mobile = e.target.value; setFormData(p => ({ ...p, founders: f })); }}
                        className={inputCls} />
                    </div>
                    <SearchableSelect
                      value={founder.role}
                      onChange={(value) => { const f = [...formData.founders]; f[index].role = value; setFormData(p => ({ ...p, founders: f })); }}
                      options={founderRoles.map(r => ({ value: r, label: r }))}
                      placeholder="Select Founder Role *"
                      isDark={isDark}
                    />
                    <label className={`block text-xs ${isDark ? 'text-white/50' : 'text-black/50'}`}>
                      Founder Photo (Optional)
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files[0]; if (!file) return;
                        const f = [...formData.founders]; f[index].photo = file; setFormData(p => ({ ...p, founders: f }));
                        setFilePreviews(p => ({ ...p, [`founder_${index}`]: { type: 'image', url: URL.createObjectURL(file) } }));
                      }} />
                      <div className={`mt-1.5 border-2 border-dashed rounded-xl cursor-pointer overflow-hidden ${isDark ? 'border-white/20 hover:border-[#E8341A]/50' : 'border-black/20 hover:border-[#E8341A]/50'}`}>
                        {filePreviews[`founder_${index}`]?.type === 'image'
                          ? <img src={filePreviews[`founder_${index}`].url} alt="Founder" className="w-full h-20 object-cover" />
                          : <div className="p-3 text-center"><FiUpload className="mx-auto mb-1" size={18} /><span className="text-xs">Upload</span></div>}
                      </div>
                    </label>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addFounder} className={`w-full py-2 rounded-xl text-xs sm:text-sm font-semibold border ${isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-black/20 text-black hover:bg-black/10'}`}>
                + Add Another Founder
              </button>
            </div>

            {/* Startup Basics */}
            <div className={`border-t pt-4 ${isDark ? 'border-[rgba(244,240,232,.07)]' : 'border-[rgba(0,0,0,.08)]'}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isDark ? 'text-white/40' : 'text-black/40'}`}>Startup Details</p>
              <div className="space-y-2.5">
                <input type="text" placeholder="Startup Name *" value={formData.startupName} onChange={(e) => handleInputChange('startupName', e.target.value)} className={inputCls} />
                <input type="text" placeholder="Startup Username (@handle) *" value={formData.startupUsername} onChange={(e) => handleInputChange('startupUsername', e.target.value)} className={inputCls} />
                <FileUploadBox field="startupLogo" label="Startup Logo" accept="image/*" previewHeight="h-24" />
                <input type="email" placeholder="Company Email *" value={formData.companyEmail} onChange={(e) => handleInputChange('companyEmail', e.target.value)} className={inputCls} />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="City *" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} className={inputCls} />
                  <SearchableSelect value={formData.state} onChange={(value) => handleInputChange('state', value)} options={states.map(s => ({ value: s, label: s }))} placeholder="Select State *" isDark={isDark} />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className={`text-lg sm:text-xl font-semibold ${isDark ? 'text-white' : 'text-black'}`}>2. Industry, Stage &amp; Verification</h2>
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Industry * (Multi-Select)</label>
              <div className="flex flex-wrap gap-2">
                {industries.map(industry => (
                  <button key={industry} type="button" onClick={() => handleArrayChange('industries', industry)}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-all ${formData.industries.includes(industry) ? 'bg-[#E8341A] text-white border-[#00B8A9]' : isDark ? 'border-white/20 text-white/70 hover:border-[#E8341A]/50' : 'border-black/20 text-black/70 hover:border-[#E8341A]/50'}`}>
                    {industry}
                  </button>
                ))}
              </div>
            </div>
            <SearchableSelect value={formData.stage} onChange={(value) => handleInputChange('stage', value)} options={stages.map(s => ({ value: s, label: s }))} placeholder="Stage of Startup *" isDark={isDark} />

            <div className={`border-t pt-4 ${isDark ? 'border-[rgba(244,240,232,.07)]' : 'border-[rgba(0,0,0,.08)]'}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isDark ? 'text-white/40' : 'text-black/40'}`}>Business Verification</p>
              <div className="space-y-3">
                <SearchableSelect value={formData.entityType} onChange={(value) => handleInputChange('entityType', value)} options={entityTypes.map(t => ({ value: t, label: t }))} placeholder="Type of Entity *" isDark={isDark} />
                {formData.entityType && formData.entityType !== 'Not Registered Yet' && (
                  <div className="space-y-2.5">
                    <SearchableSelect
                      value={formData.verificationType}
                      onChange={(value) => handleInputChange('verificationType', value)}
                      options={[
                        { value: 'CIN', label: 'CIN (Company Identification Number)' },
                        { value: 'GST', label: 'GST Number' },
                        { value: 'Udyam', label: 'Udyam Registration Number' },
                      ]}
                      placeholder="Select Verification Type"
                      isDark={isDark}
                    />
                    {formData.verificationType === 'CIN' && (
                      <>
                        <input
                          type="text"
                          placeholder="Enter CIN (e.g. L17110MH1973PLC019786)"
                          value={formData.cin}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase();
                            handleInputChange('cin', val);
                            if (verificationError) validateVerificationField('CIN', val);
                          }}
                          onBlur={(e) => validateVerificationField('CIN', e.target.value.toUpperCase())}
                          className={inputCls}
                        />
                        {formData.cin.trim() && verificationError === 'invalid' && (
                          <p className="text-xs text-red-500 mt-1 px-1">Invalid format. Please check the entered number.</p>
                        )}
                        {formData.cin.trim() && verificationError === 'valid' && (
                          <p className="text-xs text-green-500 mt-1 px-1">✓ Format Valid (Verification Pending)</p>
                        )}
                      </>
                    )}
                    {formData.verificationType === 'GST' && (
                      <>
                        <input
                          type="text"
                          placeholder="Enter GSTIN (e.g. 22AAAAA0000A1Z5)"
                          value={formData.gstin}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase();
                            handleInputChange('gstin', val);
                            if (verificationError) validateVerificationField('GST', val);
                          }}
                          onBlur={(e) => validateVerificationField('GST', e.target.value.toUpperCase())}
                          className={inputCls}
                        />
                        {formData.gstin.trim() && verificationError === 'invalid' && (
                          <p className="text-xs text-red-500 mt-1 px-1">Invalid format. Please check the entered number.</p>
                        )}
                        {formData.gstin.trim() && verificationError === 'valid' && (
                          <p className="text-xs text-green-500 mt-1 px-1">✓ Format Valid (Verification Pending)</p>
                        )}
                      </>
                    )}
                    {formData.verificationType === 'Udyam' && (
                      <>
                        <input
                          type="text"
                          placeholder="Enter Udyam Number (e.g. UDYAM-MH-02-0012345)"
                          value={formData.udyamNumber}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase();
                            handleInputChange('udyamNumber', val);
                            if (verificationError) validateVerificationField('Udyam', val);
                          }}
                          onBlur={(e) => validateVerificationField('Udyam', e.target.value.toUpperCase())}
                          className={inputCls}
                        />
                        {formData.udyamNumber.trim() && verificationError === 'invalid' && (
                          <p className="text-xs text-red-500 mt-1 px-1">Invalid format. Please check the entered number.</p>
                        )}
                        {formData.udyamNumber.trim() && verificationError === 'valid' && (
                          <p className="text-xs text-green-500 mt-1 px-1">✓ Format Valid (Verification Pending)</p>
                        )}
                      </>
                    )}
                  </div>
                )}
                {formData.entityType === 'Not Registered Yet' && (
                  <div className="space-y-2.5">
                    <FileUploadBox field="idProof" label="Founder ID Proof (Aadhaar/Passport/License)" accept="image/*,.pdf" />
                    <FileUploadBox field="businessProof" label="Any Business Proof *" accept="image/*,.pdf" />
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-3 sm:space-y-4">
            <h2 className={`text-lg sm:text-xl font-semibold ${isDark ? 'text-white' : 'text-black'}`}>3. Pitch &amp; Links</h2>
            <textarea placeholder="Short Description * (min. 20 chars)" value={formData.shortDescription} onChange={(e) => handleInputChange('shortDescription', e.target.value)} maxLength={250} rows={3} className={inputCls} />
            <FileUploadBox field="pitchVideo" label="Pitch Video (90 sec – 3 min)" accept="video/*" previewHeight="h-32" />
            <FileUploadBox field="pitchDeck" label="Pitch Deck PDF" accept=".pdf" />
            <div className="grid grid-cols-3 gap-2">
              <input type="number" placeholder="Raising (₹)" value={formData.amountRaising} onChange={(e) => handleInputChange('amountRaising', e.target.value)} className={inputCls} />
              <input type="number" placeholder="Equity (%)" value={formData.equityGiving} onChange={(e) => handleInputChange('equityGiving', e.target.value)} className={inputCls} />
              <input type="number" placeholder="Pre-Money Val" value={formData.preMoneyValuation} onChange={(e) => handleInputChange('preMoneyValuation', e.target.value)} className={inputCls} />
            </div>
            <input type="text" placeholder="Hashtags (#Fintech #AI)" value={formData.hashtags} onChange={(e) => handleInputChange('hashtags', e.target.value)} className={inputCls} />

            <div className={`border-t pt-4 ${isDark ? 'border-[rgba(244,240,232,.07)]' : 'border-[rgba(0,0,0,.08)]'}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isDark ? 'text-white/40' : 'text-black/40'}`}>Links (Optional)</p>
              <div className="space-y-2.5">
                <input type="url" placeholder="Website URL" value={formData.websiteUrl} onChange={(e) => handleInputChange('websiteUrl', e.target.value)} className={inputCls} />
                <input type="url" placeholder="LinkedIn Page" value={formData.linkedin} onChange={(e) => handleInputChange('linkedin', e.target.value)} className={inputCls} />
                <input type="url" placeholder="Instagram" value={formData.instagram} onChange={(e) => handleInputChange('instagram', e.target.value)} className={inputCls} />
                <input type="url" placeholder="YouTube" value={formData.youtube} onChange={(e) => handleInputChange('youtube', e.target.value)} className={inputCls} />
                <input type="url" placeholder="Play Store / App Store" value={formData.playStore} onChange={(e) => handleInputChange('playStore', e.target.value)} className={inputCls} />
                <input type="url" placeholder="Product Demo Link" value={formData.productDemo} onChange={(e) => handleInputChange('productDemo', e.target.value)} className={inputCls} />
                <FileUploadBox field="brochure" label="Company Brochure PDF (Optional)" accept=".pdf" />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 overflow-hidden ${isDark ? 'bg-[#060607]' : 'bg-[#f5f2ef]'}`}>
      <div className="h-screen flex flex-col max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6 shrink-0">
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <img src={logo} alt="EVO-A Logo" className="h-8 w-8 sm:h-10 sm:w-10 object-contain" />
              <span className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>EVO-A</span>
            </div>
            <button type="button" onClick={() => navigate('/choice-role')} className={`flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-xl transition-all ${isDark ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-black/60 hover:text-black hover:bg-black/10'}`}>
              <FiArrowLeft size={15} /> Back
            </button>
          </div>
          <h1 className={`text-lg sm:text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-black'}`}>Startup Registration</h1>
          <p className={`text-xs sm:text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>Step {currentStep} of 3</p>
        </div>

        {/* Progress Bar */}
        <div className={`mb-4 sm:mb-6 h-1.5 sm:h-2 w-full shrink-0 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
          <div className="h-full rounded-full transition-all duration-300 bg-[#00B8A9]" style={{ width: `${(currentStep / 3) * 100}%` }} />
        </div>

        {/* Form content */}
        <div className={`rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 flex-1 overflow-y-auto ${isDark ? 'bg-[#0f0f10] border border-[rgba(244,240,232,.08)]' : 'bg-white border border-[rgba(0,0,0,.08)]'}`}>
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-2 sm:gap-4 shrink-0">
          <button type="button" onClick={prevStep} disabled={currentStep === 1}
            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/10 text-black hover:bg-black/20'}`}>
            Previous
          </button>
          {currentStep < 3 ? (
            <button type="button" onClick={nextStep} className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#E8341A] text-white hover:bg-[#C9230F] shadow-lg shadow-[#E8341A]/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
              Next
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={loading}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${loading ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-[#E8341A] text-white hover:bg-[#C9230F] shadow-lg shadow-[#E8341A]/30 hover:scale-[1.02] active:scale-[0.98]'}`}>
              {loading ? 'Uploading video…' : 'Submit'}
            </button>
          )}
        </div>
        {error && (
          <div className="mt-3 p-3 bg-red-100 border border-red-200 text-red-700 rounded-xl text-sm text-center">{error}</div>
        )}
      </div>
    </div>
  );
}
