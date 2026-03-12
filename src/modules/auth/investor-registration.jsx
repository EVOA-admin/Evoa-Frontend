import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiUpload, FiArrowLeft } from "react-icons/fi";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import SearchableSelect from "../../components/shared/SearchableSelect";
import logo from "../../assets/logo.avif";
import { createInvestor } from "../../services/investorsService";
import { uploadFile } from "../../services/storageService";
import { supabase } from "../../config/supabase";
export default function InvestorRegistration() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { completeRegistration } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);


  const [formData, setFormData] = useState({
    // Basic Identity
    fullName: '',
    profilePhoto: null,
    designation: '',
    // Investor Type
    investorType: '',
    // Investment Focus
    investmentRange: '',
    sectorFocus: [],
    // Verification
    verificationOption: '',
    sebiNumber: '',
    sebiCertificate: null,
    linkedinProfile: '',
    portfolioLink: '',
    panNumber: '',
    idProof: null,
    // Professional Background
    companyName: '',
    companyEmail: '',
    workExperience: '',
    bio: '',
    website: '',
    // Location
    city: '',
    state: '',
    country: 'India',
    // Deal Preferences
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
    // Example: '₹10L – ₹50L' -> 1000000, 5000000
    // '₹1 Cr – ₹3 Cr' -> 10000000, 30000000
    // '₹10 Cr+' -> 100000000, null

    const parseValue = (val) => {
      val = val.replace('₹', '').trim();
      if (val.includes('Lakhs') || val.includes('L')) {
        return parseFloat(val) * 100000;
      }
      if (val.includes('Cr')) {
        return parseFloat(val) * 10000000;
      }
      return parseFloat(val) || 0;
    };

    const parts = rangeStr.split('–');
    const min = parseValue(parts[0]);
    let max = parts.length > 1 ? parseValue(parts[1]) : (rangeStr.includes('+') ? null : min); // logical approximation

    return { min, max };
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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

  // ── Per-step validation ──────────────────────────────────────────────────────
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
        return true;
      case 3:
        if (!formData.verificationOption) { setError('Please select a verification option.'); return false; }
        return true;
      // Steps 4–7 are optional enrichment
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep() && currentStep < 7) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };


  const uploadToStorage = async (file, folder) => {
    if (!file) return null;
    const ext = file.name.split('.').pop();
    const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    try {
      return await uploadFile(file, 'evoa-media', path);
    } catch (err) {
      console.warn('Upload to evoa-media failed, trying public bucket:', err.message);
      return await uploadFile(file, 'public', path);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Upload all files in parallel
      const [profilePhotoUrl, sebiCertUrl, idProofUrl] = await Promise.all([
        uploadToStorage(formData.profilePhoto, 'investors/photos'),
        uploadToStorage(formData.sebiCertificate, 'investors/documents'),
        uploadToStorage(formData.idProof, 'investors/documents'),
      ]);

      // Map Investment Range
      const { min, max } = parseInvestmentRange(formData.investmentRange);

      // Create DTO — only include fields in CreateInvestorDto
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

      // Strip any undefined keys so validation pipe doesn't complain
      Object.keys(investorData).forEach(k => {
        if (investorData[k] === undefined) delete investorData[k];
      });

      const response = await createInvestor(investorData);
      // createInvestor throws on backend error via apiClient

      await completeRegistration();
      navigate('/investor');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              1. Basic Identity
            </h2>
            <input
              type="text"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
            />
            <label className={`block text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
              Profile Photo (Recommended)
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload('profilePhoto', e.target.files[0])}
                className="hidden"
              />
              <div className={`mt-2 border-2 border-dashed rounded-xl cursor-pointer text-center transition-all overflow-hidden ${isDark ? 'border-white/20 hover:border-[#00B8A9]/50' : 'border-black/20 hover:border-[#00B8A9]/50'}`}>
                {previews.profilePhoto ? (
                  <div className="relative group">
                    <img src={previews.profilePhoto} alt="Profile preview" className="w-full h-40 object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">Click to change</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <FiUpload className="mx-auto mb-2" size={24} />
                    <span className="text-xs">Click to upload</span>
                  </div>
                )}
              </div>
            </label>
            <input
              type="text"
              placeholder="Designation / Role (e.g., Angel Investor, Partner, Managing Director)"
              value={formData.designation}
              onChange={(e) => handleInputChange('designation', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              2. Investor Type
            </h2>
            <SearchableSelect
              value={formData.investorType}
              onChange={(value) => handleInputChange('investorType', value)}
              options={investorTypes.map(type => ({ value: type, label: type }))}
              placeholder="Select Investor Type"
              isDark={isDark}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              3. Investment Focus & Ticket Size
            </h2>
            <SearchableSelect
              value={formData.investmentRange}
              onChange={(value) => handleInputChange('investmentRange', value)}
              options={investmentRanges.map(range => ({ value: range, label: range }))}
              placeholder="Investment Range"
              isDark={isDark}
            />
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                Sector Focus (Multi-Select)
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {sectors.map(sector => (
                  <label key={sector} className={`flex items-center gap-2 p-2  cursor-pointer ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
                    <input
                      type="checkbox"
                      checked={formData.sectorFocus.includes(sector)}
                      onChange={() => handleArrayChange('sectorFocus', sector)}
                      className="w-4 h-4"
                    />
                    <span className={`text-sm ${isDark ? 'text-white' : 'text-black'}`}>{sector}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              4. Verification Section
            </h2>
            <SearchableSelect
              value={formData.verificationOption}
              onChange={(value) => handleInputChange('verificationOption', value)}
              options={[
                { value: 'SEBI', label: 'SEBI-Registered Investor' },
                { value: 'Non-SEBI', label: 'Non-SEBI Angel Investors' }
              ]}
              placeholder="Select Verification Option"
              isDark={isDark}
            />
            {formData.verificationOption === 'SEBI' && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="SEBI Registration Number (e.g., INZ000209921)"
                  value={formData.sebiNumber}
                  onChange={(e) => handleInputChange('sebiNumber', e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
                />
                <label className={`block text-xs sm:text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                  Upload SEBI Certificate (PDF)
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileUpload('sebiCertificate', e.target.files[0])}
                    className="hidden"
                  />
                  <div className={`mt-2 p-3 sm:p-4 border-2 border-dashed rounded-xl cursor-pointer text-center transition-all ${isDark ? 'border-white/20 hover:border-[#00B8A9]/50' : 'border-black/20 hover:border-[#00B8A9]/50'} ${previews.sebiCertificate ? (isDark ? 'border-[#00B8A9]/40 bg-[#00B8A9]/10' : 'border-[#00B8A9]/40 bg-[#00B8A9]/5') : ''}`}>
                    {previews.sebiCertificate ? (
                      <><span className="text-[#00B8A9] text-sm">✔</span><span className="block text-xs mt-1 truncate px-2">{previews.sebiCertificate}</span></>
                    ) : (
                      <><FiUpload className="mx-auto mb-1 sm:mb-2" size={20} /><span className="text-xs">Click to upload PDF</span></>
                    )}
                  </div>
                </label>
              </div>
            )}
            {formData.verificationOption === 'Non-SEBI' && (
              <div className="space-y-3">
                <input
                  type="url"
                  placeholder="LinkedIn Profile (Mandatory)"
                  value={formData.linkedinProfile}
                  onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
                />
                <input
                  type="url"
                  placeholder="Portfolio / Past Deals Link"
                  value={formData.portfolioLink}
                  onChange={(e) => handleInputChange('portfolioLink', e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
                />
                <input
                  type="text"
                  placeholder="PAN Number (Optional but recommended)"
                  value={formData.panNumber}
                  onChange={(e) => handleInputChange('panNumber', e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
                />
                <label className={`block text-xs sm:text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                  Upload ID Proof (Aadhaar/Passport/Driving License)
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload('idProof', e.target.files[0])}
                    className="hidden"
                  />
                  <div className={`mt-2 p-3 sm:p-4 border-2 border-dashed rounded-xl cursor-pointer text-center transition-all ${isDark ? 'border-white/20 hover:border-[#00B8A9]/50' : 'border-black/20 hover:border-[#00B8A9]/50'} ${previews.idProof ? (isDark ? 'border-[#00B8A9]/40 bg-[#00B8A9]/10' : 'border-[#00B8A9]/40 bg-[#00B8A9]/5') : ''}`}>
                    {previews.idProof ? (
                      typeof previews.idProof === 'string' && previews.idProof.startsWith('blob:') ? (
                        <img src={previews.idProof} alt="ID proof" className="h-24 mx-auto object-contain rounded" />
                      ) : (
                        <><span className="text-[#00B8A9] text-sm">✔</span><span className="block text-xs mt-1 truncate px-2">{previews.idProof}</span></>
                      )
                    ) : (
                      <><FiUpload className="mx-auto mb-1 sm:mb-2" size={20} /><span className="text-xs">Click to upload</span></>
                    )}
                  </div>
                </label>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              5. Professional Background
            </h2>
            <input
              type="text"
              placeholder="Company / Fund Name"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
            />
            <input
              type="email"
              placeholder="Company Email"
              value={formData.companyEmail}
              onChange={(e) => handleInputChange('companyEmail', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
            />
            <input
              type="number"
              placeholder="Work Experience Years"
              value={formData.workExperience}
              onChange={(e) => handleInputChange('workExperience', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
            />
            <textarea
              placeholder="Short Bio / Investment Thesis"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={4}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
            />
            <input
              type="url"
              placeholder="Website / AngelList Link / Portfolio Site"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
            />
          </div>
        );

      case 6:
        return (
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              6. Location Details
            </h2>
            <input
              type="text"
              placeholder="City"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
            />
            <SearchableSelect
              value={formData.state}
              onChange={(value) => handleInputChange('state', value)}
              options={states.map(state => ({ value: state, label: state }))}
              placeholder="Select State"
              isDark={isDark}
            />
            <SearchableSelect
              value={formData.country}
              onChange={(value) => handleInputChange('country', value)}
              options={[
                { value: 'India', label: 'India' },
                { value: 'Others', label: 'Others' }
              ]}
              placeholder="Select Country"
              isDark={isDark}
            />
          </div>
        );

      case 7:
        return (
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              7. Deal Preferences
            </h2>
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                Startup Stage Preference (Multi-Select)
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {startupStages.map(stage => (
                  <label key={stage} className={`flex items-center gap-2 p-2  cursor-pointer ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
                    <input
                      type="checkbox"
                      checked={formData.startupStagePreference.includes(stage)}
                      onChange={() => handleArrayChange('startupStagePreference', stage)}
                      className="w-4 h-4"
                    />
                    <span className={`text-sm ${isDark ? 'text-white' : 'text-black'}`}>{stage}</span>
                  </label>
                ))}
              </div>
            </div>
            <SearchableSelect
              value={formData.engagementType}
              onChange={(value) => handleInputChange('engagementType', value)}
              options={engagementTypes.map(type => ({ value: type, label: type }))}
              placeholder="Engagement Type"
              isDark={isDark}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 overflow-hidden ${isDark ? 'bg-black' : 'bg-white'}`}>
      <div className="h-screen flex flex-col max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="mb-4 sm:mb-6 shrink-0">
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <img src={logo} alt="EVO-A Logo" className="h-8 w-8 sm:h-10 sm:w-10 object-contain" />
              <span className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>EVO-A</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/choice-role')}
              className={`flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-xl transition-all ${isDark ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-black/60 hover:text-black hover:bg-black/10'
                }`}
            >
              <FiArrowLeft size={15} />
              Back
            </button>
          </div>
          <h1 className={`text-lg sm:text-2xl font-bold mb-1 sm:mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
            Investor Registration
          </h1>
          <p className={`text-xs sm:text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
            Step {currentStep} of 7
          </p>
        </div>

        <div className={`mb-4 sm:mb-6 h-1.5 sm:h-2 -full shrink-0 ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
          <div
            className="h-full -full transition-all duration-300 bg-[#00B8A9]"
            style={{ width: `${(currentStep / 7) * 100}%` }}
          />
        </div>

        <div className={`-xl sm:-2xl p-4 sm:p-6 mb-4 sm:mb-6 flex-1 overflow-y-auto ${isDark ? 'bg-black/50 border border-white/10' : 'bg-white border border-black/10'}`}>
          {renderStep()}
        </div>

        <div className="flex justify-between gap-2 sm:gap-4 shrink-0">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-4 sm:px-6 py-2 sm:py-2.5  text-xs sm:text-sm font-semibold transition-all ${currentStep === 1
              ? 'opacity-50 cursor-not-allowed'
              : isDark
                ? 'bg-white/10 text-white hover:bg-white/20 cursor-pointer'
                : 'bg-black/10 text-black hover:bg-black/20 cursor-pointer'
              }`}
          >
            Previous
          </button>
          {currentStep < 7 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all bg-[#00B8A9] text-white hover:bg-[#00A89A] shadow-lg shadow-[#00B8A9]/30 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-[#00B8A9]/40 active:scale-[0.98] cursor-pointer"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${loading
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-[#00B8A9] text-white hover:bg-[#00A89A] shadow-lg shadow-[#00B8A9]/30 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-[#00B8A9]/40 active:scale-[0.98] cursor-pointer'
                }`}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </div>
        {error && (
          <div className="mt-3 p-3 bg-red-100 border border-red-200 text-red-700 rounded-xl text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

