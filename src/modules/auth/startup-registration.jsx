import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiUpload, FiX, FiArrowLeft } from "react-icons/fi";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import SearchableSelect from "../../components/shared/SearchableSelect";
import logo from "../../assets/logo.avif";
import storageService from "../../services/storageService";
import { createStartup } from "../../services/startupsService";
import startupsService from "../../services/startupsService";
import reelsService from "../../services/reelsService";

export default function StartupRegistration() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { completeRegistration } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);


  // Form state
  const [formData, setFormData] = useState({
    // Founders
    founders: [{ name: '', email: '', mobile: '', role: '', photo: null }],
    // Basic Details
    startupName: '',
    startupUsername: '',
    startupLogo: null,
    websiteUrl: '',
    companyEmail: '',
    city: '',
    state: '',
    country: 'India',
    // Industry & Stage
    industries: [],
    stage: '',
    // Business Verification
    entityType: '',
    verificationType: '',
    cin: '',
    gstin: '',
    udyamNumber: '',
    idProof: null,
    businessProof: null,
    // Pitch Details
    pitchVideo: null,
    pitchDeck: null,
    shortDescription: '',
    hashtags: '',
    amountRaising: '',
    equityGiving: '',
    preMoneyValuation: '',
    // Social Links
    linkedin: '',
    instagram: '',
    youtube: '',
    playStore: '',
    productDemo: '',
    brochure: null,
    // Team
    teamMembers: [],
    // Category Tags
    categoryTags: [],

  });

  const founderRoles = ['CEO', 'CTO', 'COO', 'CMO', 'CFO', 'Co-founder', 'Solo Founder'];
  const industries = ['AI / ML', 'SaaS', 'FinTech', 'EdTech', 'HealthTech', 'Mobility', 'D2C / E-commerce', 'FoodTech', 'DeepTech', 'Blockchain / Web3', 'Agritech', 'GreenTech / ClimateTech', 'Gaming', 'Cybersecurity', 'Manufacturing', 'Others'];
  const stages = ['Idea', 'Prototype', 'MVP', 'Early Revenue', 'Growth', 'Scaling', 'Series A+'];
  const entityTypes = ['Private Limited (Pvt Ltd)', 'LLP', 'Partnership', 'Sole Proprietorship', 'MSME Registered', 'Not Registered Yet'];
  const categoryTags = ['B2B', 'B2C', 'Marketplace', 'SaaS', 'Subscription', 'D2C', 'DeepTech', 'Hardware', 'Services', 'Digital Product'];
  const states = ['Uttar Pradesh', 'Delhi NCR', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 'West Bengal', 'Telangana', 'Kerala', 'Haryana', 'Madhya Pradesh', 'Punjab', 'Bihar', 'Odisha', 'Others'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, value, index = null) => {
    if (index !== null) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].map((item, i) => i === index ? value : item)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].includes(value)
          ? prev[field].filter(item => item !== value)
          : [...prev[field], value]
      }));
    }
  };

  const addFounder = () => {
    setFormData(prev => ({
      ...prev,
      founders: [...prev.founders, { name: '', email: '', mobile: '', role: '', photo: null }]
    }));
  };

  const removeFounder = (index) => {
    setFormData(prev => ({
      ...prev,
      founders: prev.founders.filter((_, i) => i !== index)
    }));
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filePreviews, setFilePreviews] = useState({}); // key -> preview URL/filename

  const handleFileUpload = (field, file, previewKey = null) => {
    if (!file) return;
    setFormData(prev => ({ ...prev, [field]: file }));
    // Generate preview
    const key = previewKey || field;
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setFilePreviews(prev => ({ ...prev, [key]: { type: 'image', url } }));
    } else if (file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setFilePreviews(prev => ({ ...prev, [key]: { type: 'video', url } }));
    } else {
      setFilePreviews(prev => ({ ...prev, [key]: { type: 'file', name: file.name } }));
    }
  };

  const nextStep = () => {
    if (currentStep < 8) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const uploadToStorage = async (file, path, required = false) => {
    if (!file) return null;
    try {
      // Try 'evoa-media' bucket first, then fallback to 'public'
      let url = null;
      try {
        url = await storageService.uploadFile(file, 'evoa-media', `startups/${Date.now()}_${path}_${file.name}`);
      } catch {
        url = await storageService.uploadFile(file, 'public', `startups/${Date.now()}_${path}_${file.name}`);
      }
      return url;
    } catch (err) {
      console.error(`Failed to upload ${path}:`, err);
      if (required) throw new Error(`Upload failed for ${path}: ${err.message}`);
      return null;
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Upload files
      const logoUrl = await uploadToStorage(formData.startupLogo, 'logo');
      const idProofUrl = await uploadToStorage(formData.idProof, 'id_proof');
      const businessProofUrl = await uploadToStorage(formData.businessProof, 'business_proof');
      const pitchVideoUrl = await uploadToStorage(formData.pitchVideo, 'pitch_video');
      const pitchDeckUrl = await uploadToStorage(formData.pitchDeck, 'pitch_deck');
      const brochureUrl = await uploadToStorage(formData.brochure, 'brochure');

      // Upload founder photos
      const foundersWithPhotos = await Promise.all(formData.founders.map(async (founder, index) => {
        const photoUrl = await uploadToStorage(founder.photo, `founder_${index}`);
        return {
          ...founder,
          photoUrl
        };
      }));

      // 2. Construct Payload
      const payload = {
        name: formData.startupName,
        username: formData.startupUsername,
        companyEmail: formData.companyEmail,
        website: formData.websiteUrl,
        stage: formData.stage,
        industries: formData.industries,
        location: {
          city: formData.city,
          state: formData.state,
          country: formData.country
        },
        founders: foundersWithPhotos.map(f => ({
          name: f.name,
          email: f.email,
          mobile: f.mobile,
          role: f.role,
          photoUrl: f.photoUrl
        })),
        verification: formData.entityType !== 'Not Registered Yet' ? {
          entityType: formData.entityType,
          type: formData.verificationType,
          value: formData.verificationType === 'CIN' ? formData.cin :
            formData.verificationType === 'GST' ? formData.gstin :
              formData.verificationType === 'Udyam' ? formData.udyamNumber : '',
          documentUrl: '' // Not uploading verification docs for registered entities in this form? Or use id/business proof?
        } : {
          entityType: 'Unregistered',
          type: 'Documents',
          value: 'Uploaded',
          documentUrl: idProofUrl // Using ID proof as verification doc
        },
        pitchVideoUrl,
        pitchDeckUrl,
        description: formData.shortDescription,
        socialLinks: {
          linkedin: formData.linkedin,
          instagram: formData.instagram,
          youtube: formData.youtube,
          playStore: formData.playStore,
          productDemo: formData.productDemo,
          website: formData.websiteUrl
        },
        raisingAmount: Number(formData.amountRaising) || 0,
        equityPercentage: Number(formData.equityGiving) || 0,
        preMoneyValuation: Number(formData.preMoneyValuation) || 0,
        hashtags: formData.hashtags,
        categoryTags: formData.categoryTags,
        teamMembers: [] // Optional
      };

      // 3. Call API
      await startupsService.createStartup(payload);

      // 4. Explicitly publish pitch video to reel feed (bulletproof fallback)
      //    Backend also auto-creates it, but this call ensures it's always visible.
      if (pitchVideoUrl) {
        try {
          await reelsService.createReel({
            videoUrl: pitchVideoUrl,
            title: formData.startupName,
            description: formData.shortDescription,
            hashtags: typeof formData.hashtags === 'string'
              ? formData.hashtags.split(/[\s,]+/).filter(Boolean).map(t => t.replace(/^#/, ''))
              : formData.hashtags || [],
          });
        } catch (reelErr) {
          // Non-critical: reel creation failure should not block registration
          console.warn('Reel auto-publish failed (non-critical):', reelErr);
        }
      }

      // 4. Mark registration complete + navigate
      await completeRegistration();
      navigate('/startup');
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
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
              1. Founders' Details
            </h2>
            {formData.founders.map((founder, index) => (
              <div key={index} className={`p-3 sm:p-4  border ${isDark ? 'bg-black/50 border-white/10' : 'bg-white border-black/10'}`}>
                <div className="flex justify-between items-center mb-2 sm:mb-3">
                  <h3 className={`text-sm sm:text-base font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                    Founder {index + 1}
                  </h3>
                  {formData.founders.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFounder(index)}
                      className={`p-1 ${isDark ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'}`}
                    >
                      <FiX size={18} />
                    </button>
                  )}
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <input
                    type="text"
                    placeholder="Founder Name"
                    value={founder.name}
                    onChange={(e) => {
                      const newFounders = [...formData.founders];
                      newFounders[index].name = e.target.value;
                      setFormData(prev => ({ ...prev, founders: newFounders }));
                    }}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
                  />
                  <input
                    type="email"
                    placeholder="Founder Email"
                    value={founder.email}
                    onChange={(e) => {
                      const newFounders = [...formData.founders];
                      newFounders[index].email = e.target.value;
                      setFormData(prev => ({ ...prev, founders: newFounders }));
                    }}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
                  />
                  <input
                    type="tel"
                    placeholder="Founder Mobile Number"
                    value={founder.mobile}
                    onChange={(e) => {
                      const newFounders = [...formData.founders];
                      newFounders[index].mobile = e.target.value;
                      setFormData(prev => ({ ...prev, founders: newFounders }));
                    }}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
                  />
                  <SearchableSelect
                    value={founder.role}
                    onChange={(value) => {
                      const newFounders = [...formData.founders];
                      newFounders[index].role = value;
                      setFormData(prev => ({ ...prev, founders: newFounders }));
                    }}
                    options={founderRoles.map(role => ({ value: role, label: role }))}
                    placeholder="Select Founder Role"
                    isDark={isDark}
                  />
                  <label className={`block text-xs sm:text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                    Profile Photo (Optional)
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        const newFounders = [...formData.founders];
                        newFounders[index].photo = file;
                        setFormData(prev => ({ ...prev, founders: newFounders }));
                        if (file) {
                          const url = URL.createObjectURL(file);
                          setFilePreviews(prev => ({ ...prev, [`founder_${index}`]: { type: 'image', url } }));
                        }
                      }}
                      className="hidden"
                    />
                    <div className={`mt-2 border-2 border-dashed rounded-xl cursor-pointer overflow-hidden transition-all ${isDark ? 'border-white/20 hover:border-[#00B8A9]/50' : 'border-black/20 hover:border-[#00B8A9]/50'}`}>
                      {filePreviews[`founder_${index}`]?.type === 'image' ? (
                        <div className="relative">
                          <img src={filePreviews[`founder_${index}`].url} alt="Preview" className="w-full h-28 object-cover" />
                          <div className={`absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity ${isDark ? 'bg-black/50' : 'bg-white/50'}`}>
                            <span className="text-xs font-medium">Click to change</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 text-center">
                          <FiUpload className="mx-auto mb-2" size={24} />
                          <span className="text-xs">Click to upload</span>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addFounder}
              className={`w-full py-2 sm:py-2.5  text-xs sm:text-sm font-semibold border ${isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-black/20 text-black hover:bg-black/10'}`}
            >
              + Add Another Founder
            </button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              2. Startup Basic Details
            </h2>
            <input
              type="text"
              placeholder="Startup Name"
              value={formData.startupName}
              onChange={(e) => handleInputChange('startupName', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            />
            <input
              type="text"
              placeholder="Startup Username (@handle)"
              value={formData.startupUsername}
              onChange={(e) => handleInputChange('startupUsername', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            />
            <label className={`block text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
              Startup Logo Upload
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload('startupLogo', e.target.files[0])}
                className="hidden"
              />
              <div className={`mt-2 border-2 border-dashed rounded-xl cursor-pointer overflow-hidden transition-all ${isDark ? 'border-white/20 hover:border-white/40' : 'border-black/20 hover:border-black/40'}`}>
                {filePreviews.startupLogo?.type === 'image' ? (
                  <div className="relative">
                    <img src={filePreviews.startupLogo.url} alt="Logo Preview" className="w-full h-32 object-contain bg-gray-50" />
                    <div className={`absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity ${isDark ? 'bg-black/50' : 'bg-white/50'}`}>
                      <span className="text-xs font-medium">Click to change</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <FiUpload className="mx-auto mb-2" size={24} />
                    <span className="text-xs">Click to upload logo</span>
                  </div>
                )}
              </div>
            </label>
            <input
              type="url"
              placeholder="Website URL"
              value={formData.websiteUrl}
              onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            />
            <input
              type="email"
              placeholder="Company Email"
              value={formData.companyEmail}
              onChange={(e) => handleInputChange('companyEmail', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            />
            <input
              type="text"
              placeholder="City"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
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

      case 3:
        return (
          <div className="space-y-4">
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              3. Industry & Stage
            </h2>
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                Industry (Multi-select)
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {industries.map(industry => (
                  <label key={industry} className={`flex items-center gap-2 p-2  cursor-pointer ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
                    <input
                      type="checkbox"
                      checked={formData.industries.includes(industry)}
                      onChange={() => handleArrayChange('industries', industry)}
                      className="w-4 h-4"
                    />
                    <span className={`text-sm ${isDark ? 'text-white' : 'text-black'}`}>{industry}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                Stage of Startup
              </label>
              <SearchableSelect
                value={formData.stage}
                onChange={(value) => handleInputChange('stage', value)}
                options={stages.map(stage => ({ value: stage, label: stage }))}
                placeholder="Select Stage"
                isDark={isDark}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              4. Business Verification
            </h2>
            <SearchableSelect
              value={formData.entityType}
              onChange={(value) => handleInputChange('entityType', value)}
              options={entityTypes.map(type => ({ value: type, label: type }))}
              placeholder="Type of Entity"
              isDark={isDark}
            />
            {formData.entityType && formData.entityType !== 'Not Registered Yet' && (
              <div className="space-y-3">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                    Verification Option
                  </label>
                  <SearchableSelect
                    value={formData.verificationType}
                    onChange={(value) => handleInputChange('verificationType', value)}
                    options={[
                      { value: 'CIN', label: 'CIN (Company Identification Number)' },
                      { value: 'GST', label: 'GST Number' },
                      { value: 'Udyam', label: 'Udyam Registration Number' }
                    ]}
                    placeholder="Select Verification Type"
                    isDark={isDark}
                  />
                </div>
                {formData.verificationType === 'CIN' && (
                  <input
                    type="text"
                    placeholder="Enter CIN"
                    value={formData.cin}
                    onChange={(e) => handleInputChange('cin', e.target.value)}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
                  />
                )}
                {formData.verificationType === 'GST' && (
                  <input
                    type="text"
                    placeholder="Enter GSTIN"
                    value={formData.gstin}
                    onChange={(e) => handleInputChange('gstin', e.target.value)}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
                  />
                )}
                {formData.verificationType === 'Udyam' && (
                  <input
                    type="text"
                    placeholder="Enter Udyam Registration Number"
                    value={formData.udyamNumber}
                    onChange={(e) => handleInputChange('udyamNumber', e.target.value)}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
                  />
                )}
              </div>
            )}
            {formData.entityType === 'Not Registered Yet' && (
              <div className="space-y-3">
                <label className={`block text-xs sm:text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                  Upload Founder ID Proof (Aadhaar/Driving License/Passport)
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload('idProof', e.target.files[0])}
                    className="hidden"
                  />
                  <div className={`mt-2 p-4 border-2 border-dashed rounded-xl cursor-pointer text-center ${isDark ? 'border-white/20 hover:border-white/40' : 'border-black/20 hover:border-black/40'}`}>
                    <FiUpload className="mx-auto mb-2" size={24} />
                    <span className="text-xs">Click to upload</span>
                  </div>
                </label>
                <label className={`block text-xs sm:text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                  Upload Any Business Proof (Optional)
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload('businessProof', e.target.files[0])}
                    className="hidden"
                  />
                  <div className={`mt-2 p-4 border-2 border-dashed rounded-xl cursor-pointer text-center ${isDark ? 'border-white/20 hover:border-white/40' : 'border-black/20 hover:border-black/40'}`}>
                    <FiUpload className="mx-auto mb-2" size={24} />
                    <span className="text-xs">Click to upload</span>
                  </div>
                </label>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              5. Pitch Details
            </h2>
            <label className={`block text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
              Pitch Video Upload (90 sec - 3 min)
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileUpload('pitchVideo', e.target.files[0])}
                className="hidden"
              />
              <div className={`mt-2 border-2 border-dashed rounded-xl cursor-pointer overflow-hidden transition-all ${isDark ? 'border-white/20 hover:border-white/40' : 'border-black/20 hover:border-black/40'}`}>
                {filePreviews.pitchVideo?.type === 'video' ? (
                  <div>
                    <video src={filePreviews.pitchVideo.url} controls className="w-full max-h-48 object-cover" />
                    <p className={`text-xs text-center py-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>✓ Video selected — click to change</p>
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <FiUpload className="mx-auto mb-2" size={24} />
                    <span className="text-xs">Click to upload video</span>
                  </div>
                )}
              </div>
            </label>
            <label className={`block text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
              Pitch Deck Upload (PDF)
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileUpload('pitchDeck', e.target.files[0])}
                className="hidden"
              />
              <div className={`mt-2 border-2 border-dashed rounded-xl cursor-pointer overflow-hidden transition-all ${isDark ? 'border-white/20 hover:border-white/40' : 'border-black/20 hover:border-black/40'}`}>
                {filePreviews.pitchDeck?.type === 'file' ? (
                  <div className={`p-3 flex items-center gap-2 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <span className="text-2xl">📄</span>
                    <span className={`text-xs truncate flex-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{filePreviews.pitchDeck.name}</span>
                    <span className={`text-xs ${isDark ? 'text-[#00B8A9]' : 'text-[#00B8A9]'}`}>✓</span>
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <FiUpload className="mx-auto mb-2" size={24} />
                    <span className="text-xs">Click to upload PDF</span>
                  </div>
                )}
              </div>
            </label>
            <textarea
              placeholder="Short Description (Max 200-250 chars)"
              value={formData.shortDescription}
              onChange={(e) => handleInputChange('shortDescription', e.target.value)}
              maxLength={250}
              rows={4}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            />
            <input
              type="text"
              placeholder="Hashtags (#Fintech #AI #D2C etc.)"
              value={formData.hashtags}
              onChange={(e) => handleInputChange('hashtags', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Amount Raising (₹)"
                value={formData.amountRaising}
                onChange={(e) => handleInputChange('amountRaising', e.target.value)}
                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
              />
              <input
                type="number"
                placeholder="Equity Giving (%)"
                value={formData.equityGiving}
                onChange={(e) => handleInputChange('equityGiving', e.target.value)}
                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
              />
            </div>
            <input
              type="number"
              placeholder="Pre-money Valuation (Auto-calculated option)"
              value={formData.preMoneyValuation}
              onChange={(e) => handleInputChange('preMoneyValuation', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            />
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              6. Social & Contact Links
            </h2>
            <input
              type="url"
              placeholder="LinkedIn Page"
              value={formData.linkedin}
              onChange={(e) => handleInputChange('linkedin', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            />
            <input
              type="url"
              placeholder="Instagram"
              value={formData.instagram}
              onChange={(e) => handleInputChange('instagram', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            />
            <input
              type="url"
              placeholder="YouTube"
              value={formData.youtube}
              onChange={(e) => handleInputChange('youtube', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            />
            <input
              type="url"
              placeholder="Play Store / App Store"
              value={formData.playStore}
              onChange={(e) => handleInputChange('playStore', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            />
            <input
              type="url"
              placeholder="Product Demo Link"
              value={formData.productDemo}
              onChange={(e) => handleInputChange('productDemo', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5  text-xs sm:text-sm border rounded-xl ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            />
            <label className={`block text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
              Company Brochure PDF (Optional)
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileUpload('brochure', e.target.files[0])}
                className="hidden"
              />
              <div className={`mt-2 p-3 sm:p-4 border-2 border-dashed  cursor-pointer text-center ${isDark ? 'border-white/20 hover:border-white/40' : 'border-black/20 hover:border-black/40'}`}>
                <FiUpload className="mx-auto mb-1 sm:mb-2" size={20} />
                <span className="text-xs">Click to upload</span>
              </div>
            </label>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              7. Team Details (Optional)
            </h2>
            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
              Add core team members with their roles, LinkedIn profiles, and experience summary.
            </p>
            <button
              type="button"
              className={`w-full py-2.5  text-sm font-semibold border ${isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-black/20 text-black hover:bg-black/10'}`}
            >
              + Add Team Member
            </button>
          </div>
        );

      case 8:
        return (
          <div className="space-y-4">
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              8. Startup Category Tags (Optional)
            </h2>
            <div className="space-y-2">
              {categoryTags.map(tag => (
                <label key={tag} className={`flex items-center gap-2 p-2  cursor-pointer ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
                  <input
                    type="checkbox"
                    checked={formData.categoryTags.includes(tag)}
                    onChange={() => handleArrayChange('categoryTags', tag)}
                    className="w-4 h-4"
                  />
                  <span className={`text-sm ${isDark ? 'text-white' : 'text-black'}`}>{tag}</span>
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 overflow-hidden ${isDark ? 'bg-black' : 'bg-white'}`}>
      <div className="h-screen flex flex-col max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Header - Fixed */}
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
            Startup Registration
          </h1>
          <p className={`text-xs sm:text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
            Step {currentStep} of 8
          </p>
        </div>

        {/* Progress Bar - Fixed */}
        <div className={`mb-4 sm:mb-6 h-1.5 sm:h-2 -full shrink-0 ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
          <div
            className="h-full -full transition-all duration-300 bg-[#00B8A9]"
            style={{ width: `${(currentStep / 8) * 100}%` }}
          />
        </div>

        {/* Form Container - Scrollable */}
        <div className={`-xl sm:-2xl p-4 sm:p-6 mb-4 sm:mb-6 flex-1 overflow-y-auto ${isDark ? 'bg-black/50 border border-white/10' : 'bg-white border border-black/10'}`}>
          {renderStep()}
        </div>

        {/* Navigation Buttons - Fixed */}
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
              className={`px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#00B8A9] text-white hover:bg-[#00A89A] shadow-lg shadow-[#00B8A9]/30 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-[#00B8A9]/40 active:scale-[0.98] cursor-pointer'}`}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-xl text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

