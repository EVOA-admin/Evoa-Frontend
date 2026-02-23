import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiUpload, FiArrowLeft } from "react-icons/fi";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import SearchableSelect from "../../components/shared/SearchableSelect";
import logo from "../../assets/logo.avif";
import { createIncubator } from "../../services/incubatorsService";
import { uploadFile } from "../../services/storageService";
import { supabase } from "../../config/supabase";
export default function IncubatorRegistration() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { completeRegistration } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    // Identity
    incubatorName: '',
    logo: null,
    officialEmail: '',
    websiteUrl: '',
    // Location
    city: '',
    state: '',
    fullAddress: '',
    phoneNumber: '',
    // Verification
    organizationType: '',
    affiliationType: '',
    verificationDocumentType: '',
    verificationDocument: null,
    // Program Details
    programType: '',
    sectorFocus: [],
    equityPolicy: '',
    customEquity: '',
    fundingSupport: '',
    programDuration: '',
    cohortSize: '',
    numberOfMentors: '',
    // Facilities
    facilities: [],
    // Social Proof
    portfolioStartups: '',
    successStories: '',
    linkedinProfile: '',
    instagram: '',
    youtube: '',
    // Security
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',

  });

  const organizationTypes = ['Government Incubator', 'University Incubator', 'Corporate Incubator', 'Private Incubator'];
  const affiliationTypes = ['DST (Department of Science & Technology)', 'MeitY (Ministry of Electronics & IT)', 'AICTE', 'MSME', 'State Government', 'Private Registered Entity', 'University / Institute', 'Corporate Innovation Lab', 'Not Affiliated'];
  const verificationDocTypes = ['Government Registration Certificate', 'University Affiliation Letter', 'Private Company Incorporation Certificate (CIN)', 'MSME / Udyam Registration', 'DST / MeitY Recognition Letter', 'Trust / Society Registration Certificate', 'Corporate Legal Incorporation Certificate'];
  const programTypes = ['Pre-Incubation', 'Incubation', 'Acceleration', 'Virtual Program', 'Hybrid Program', 'Physical Program'];
  const sectors = ['Tech', 'DeepTech', 'AI/ML', 'FinTech', 'EdTech', 'HealthTech', 'D2C / FMCG', 'ClimateTech', 'Mobility', 'SaaS', 'Web3', 'AgriTech', 'Others'];
  const equityPolicies = ['0% Equity (Free Program)', '1–2% Equity', '2–5% Equity', 'Custom Equity'];
  const fundingSupports = ['No Funding', 'Grant Only', 'Seed Investment', 'Convertible Note', 'Hybrid Support'];
  const facilities = ['Co-working Space', 'Labs / Prototyping', 'Cloud Credits', 'Legal Support', 'Mentorship Programs', 'Government Scheme Support', 'Corporate Connect', 'Investor Network', 'Market Access'];
  const states = ['Uttar Pradesh', 'Delhi NCR', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 'West Bengal', 'Telangana', 'Kerala', 'Haryana', 'Madhya Pradesh', 'Punjab', 'Bihar', 'Odisha', 'Others'];

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

  const nextStep = () => {
    if (currentStep < 8) setCurrentStep(currentStep + 1);
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

      // Upload logo and verification doc in parallel
      const [logoUrl, verificationDocUrl] = await Promise.all([
        uploadToStorage(formData.logo, 'incubators/logos'),
        uploadToStorage(formData.verificationDocument, 'incubators/documents'),
      ]);

      // Create DTO — only include fields in CreateIncubatorDto
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
          ? {
            linkedin: formData.linkedinProfile || undefined,
            instagram: formData.instagram || undefined,
            youtube: formData.youtube || undefined,
          }
          : undefined,
      };

      // Strip undefined so ValidationPipe doesn't reject them
      Object.keys(incubatorData).forEach(k => {
        if (incubatorData[k] === undefined) delete incubatorData[k];
      });

      const response = await createIncubator(incubatorData);
      // createIncubator throws on backend error via apiClient

      await completeRegistration();
      navigate('/incubator');
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
              1. Incubator Identity
            </h2>
            <input
              type="text"
              placeholder="Incubator Name"
              value={formData.incubatorName}
              onChange={(e) => handleInputChange('incubatorName', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
            />
            <label className={`block text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
              Logo Upload
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload('logo', e.target.files[0])}
                className="hidden"
              />
              <div className={`mt-2 border-2 border-dashed rounded-xl cursor-pointer text-center transition-all overflow-hidden ${isDark ? 'border-white/20 hover:border-[#00B8A9]/50' : 'border-black/20 hover:border-[#00B8A9]/50'}`}>
                {previews.logo ? (
                  <div className="relative group">
                    <img src={previews.logo} alt="Logo preview" className="w-full h-40 object-cover" />
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
              type="email"
              placeholder="Official Email ID"
              value={formData.officialEmail}
              onChange={(e) => handleInputChange('officialEmail', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
            />
            <input
              type="url"
              placeholder="Website URL"
              value={formData.websiteUrl}
              onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              2. Location Details
            </h2>
            <SearchableSelect
              value={formData.state}
              onChange={(value) => handleInputChange('state', value)}
              options={states.map(state => ({ value: state, label: state }))}
              placeholder="Select State"
              isDark={isDark}
            />
            <input
              type="text"
              placeholder="City"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
            />
            <textarea
              placeholder="Full Address (Optional)"
              value={formData.fullAddress}
              onChange={(e) => handleInputChange('fullAddress', e.target.value)}
              rows={3}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              3. Verification & Authentication
            </h2>
            <SearchableSelect
              value={formData.organizationType}
              onChange={(value) => handleInputChange('organizationType', value)}
              options={organizationTypes.map(type => ({ value: type, label: type }))}
              placeholder="Type of Organization"
              isDark={isDark}
            />
            <SearchableSelect
              value={formData.affiliationType}
              onChange={(value) => handleInputChange('affiliationType', value)}
              options={affiliationTypes.map(type => ({ value: type, label: type }))}
              placeholder="Affiliation Type"
              isDark={isDark}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              4. Verified Document Section
            </h2>
            <SearchableSelect
              value={formData.verificationDocumentType}
              onChange={(value) => handleInputChange('verificationDocumentType', value)}
              options={verificationDocTypes.map(type => ({ value: type, label: type }))}
              placeholder="Choose Your Verification Document"
              isDark={isDark}
            />
            {formData.verificationDocumentType && (
              <label className={`block text-xs sm:text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                Upload Selected Document (PDF/JPG/PNG)
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload('verificationDocument', e.target.files[0])}
                  className="hidden"
                />
                <div className={`mt-2 p-3 sm:p-4 border-2 border-dashed rounded-xl cursor-pointer text-center transition-all ${isDark ? 'border-white/20 hover:border-[#00B8A9]/50' : 'border-black/20 hover:border-[#00B8A9]/50'} ${previews.verificationDocument ? (isDark ? 'border-[#00B8A9]/40 bg-[#00B8A9]/10' : 'border-[#00B8A9]/40 bg-[#00B8A9]/5') : ''}`}>
                  {previews.verificationDocument ? (
                    typeof previews.verificationDocument === 'string' && previews.verificationDocument.startsWith('blob:') ? (
                      <img src={previews.verificationDocument} alt="Document" className="h-24 mx-auto object-contain rounded" />
                    ) : (
                      <><span className="text-[#00B8A9] text-sm">✔</span><span className="block text-xs mt-1 truncate px-2">{previews.verificationDocument}</span></>
                    )
                  ) : (
                    <><FiUpload className="mx-auto mb-1 sm:mb-2" size={20} /><span className="text-xs">Click to upload</span></>
                  )}
                </div>
              </label>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              5. Program Details
            </h2>
            <SearchableSelect
              value={formData.programType}
              onChange={(value) => handleInputChange('programType', value)}
              options={programTypes.map(type => ({ value: type, label: type }))}
              placeholder="Program Type"
              isDark={isDark}
            />
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                Sector Focus (Multi-select)
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
            <SearchableSelect
              value={formData.equityPolicy}
              onChange={(value) => handleInputChange('equityPolicy', value)}
              options={equityPolicies.map(policy => ({ value: policy, label: policy }))}
              placeholder="Equity Policy"
              isDark={isDark}
            />
            {formData.equityPolicy === 'Custom Equity' && (
              <input
                type="text"
                placeholder="Enter Custom Equity"
                value={formData.customEquity}
                onChange={(e) => handleInputChange('customEquity', e.target.value)}
                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
              />
            )}
            <SearchableSelect
              value={formData.fundingSupport}
              onChange={(value) => handleInputChange('fundingSupport', value)}
              options={fundingSupports.map(support => ({ value: support, label: support }))}
              placeholder="Funding Support"
              isDark={isDark}
            />
            <input
              type="text"
              placeholder="Program Duration (Weeks/Months)"
              value={formData.programDuration}
              onChange={(e) => handleInputChange('programDuration', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
            />
            <input
              type="number"
              placeholder="Cohort Size"
              value={formData.cohortSize}
              onChange={(e) => handleInputChange('cohortSize', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
            />
            <input
              type="number"
              placeholder="Number of Mentors"
              value={formData.numberOfMentors}
              onChange={(e) => handleInputChange('numberOfMentors', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
            />
          </div>
        );

      case 6:
        return (
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              6. Facilities & Support
            </h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {facilities.map(facility => (
                <label key={facility} className={`flex items-center gap-2 p-2  cursor-pointer ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
                  <input
                    type="checkbox"
                    checked={formData.facilities.includes(facility)}
                    onChange={() => handleArrayChange('facilities', facility)}
                    className="w-4 h-4"
                  />
                  <span className={`text-sm ${isDark ? 'text-white' : 'text-black'}`}>{facility}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              7. Social Proof Section
            </h2>
            <textarea
              placeholder="Portfolio Startups (Input / Links)"
              value={formData.portfolioStartups}
              onChange={(e) => handleInputChange('portfolioStartups', e.target.value)}
              rows={3}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
            />
            <textarea
              placeholder="Top Startup Success Stories"
              value={formData.successStories}
              onChange={(e) => handleInputChange('successStories', e.target.value)}
              rows={3}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
            />
            <input
              type="url"
              placeholder="LinkedIn Profile"
              value={formData.linkedinProfile}
              onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
            />
            <input
              type="url"
              placeholder="Instagram (Optional)"
              value={formData.instagram}
              onChange={(e) => handleInputChange('instagram', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
            />
            <input
              type="url"
              placeholder="YouTube (Optional)"
              value={formData.youtube}
              onChange={(e) => handleInputChange('youtube', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
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
            Incubator Registration
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
          {currentStep < 8 ? (
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

