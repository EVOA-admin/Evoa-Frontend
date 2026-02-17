import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUpload } from "react-icons/fi";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/logo.avif";

export default function InvestorRegistration() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  // Removed: showPassword, showConfirmPassword (Account Security section removed)

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
    engagementType: ''
    // Removed: Account Security fields (email, mobile, password, confirmPassword, emailOTP, phoneOTP)
  });

  const investorTypes = ['Angel Investor', 'Venture Capital Fund', 'Micro VC', 'Family Office', 'Corporate Investor', 'Institutional Investor', 'Syndicate Leader', 'Accelerator / Incubator Investor', 'Crowdfunding Platform'];
  const investmentRanges = ['₹0 – ₹10 Lakhs', '₹10L – ₹50L', '₹50L – ₹1 Cr', '₹1 Cr – ₹3 Cr', '₹3 Cr – ₹10 Cr', '₹10 Cr+'];
  const sectors = ['AI / ML', 'SaaS', 'FinTech', 'EdTech', 'HealthTech', 'D2C / E-commerce', 'Mobility', 'GreenTech / ClimateTech', 'Blockchain / Web3', 'Logistics / Supply Chain', 'DeepTech', 'Consumer Tech', 'Agritech', 'Others'];
  const startupStages = ['Idea', 'MVP', 'Early Revenue', 'Growth', 'Scaling', 'Series A+'];
  const engagementTypes = ['Passive Investor', 'Active Mentor + Investor', 'Lead Investor', 'Co-investor', 'Syndicate Member'];
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

  const handleFileUpload = (field, file) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const nextStep = () => {
    if (currentStep < 7) setCurrentStep(currentStep + 1); // Changed from 8 to 7
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    console.log('Form submitted:', formData);

    try {
      // Save metadata to Supabase user_metadata
      const { updateUserMetadata } = useAuth();
      await updateUserMetadata({
        role: 'INVESTOR',
        profile_complete: true
      });

      // TODO: Save registration data to backend database here

      // Navigate to dashboard
      navigate('/investor');
    } catch (error) {
      console.error('Failed to save metadata:', error);
      alert('Failed to complete registration. Please try again.');
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
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            />
            <label className={`block text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
              Profile Photo (Recommended)
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload('profilePhoto', e.target.files[0])}
                className="hidden"
              />
              <div className={`mt-2 p-4 border-2 border-dashed rounded-lg cursor-pointer text-center ${isDark ? 'border-white/20 hover:border-white/40' : 'border-black/20 hover:border-black/40'}`}>
                <FiUpload className="mx-auto mb-2" size={24} />
                <span className="text-xs">Click to upload</span>
              </div>
            </label>
            <input
              type="text"
              placeholder="Designation / Role (e.g., Angel Investor, Partner, Managing Director)"
              value={formData.designation}
              onChange={(e) => handleInputChange('designation', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              2. Investor Type
            </h2>
            <select
              value={formData.investorType}
              onChange={(e) => handleInputChange('investorType', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            >
              <option value="">Select Investor Type</option>
              {investorTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        );

      case 3:
        return (
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              3. Investment Focus & Ticket Size
            </h2>
            <select
              value={formData.investmentRange}
              onChange={(e) => handleInputChange('investmentRange', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            >
              <option value="">Investment Range</option>
              {investmentRanges.map(range => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                Sector Focus (Multi-Select)
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {sectors.map(sector => (
                  <label key={sector} className={`flex items-center gap-2 p-2 rounded cursor-pointer ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
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
            <select
              value={formData.verificationOption}
              onChange={(e) => handleInputChange('verificationOption', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            >
              <option value="">Select Verification Option</option>
              <option value="SEBI">SEBI-Registered Investor</option>
              <option value="Non-SEBI">Non-SEBI Angel Investors</option>
            </select>
            {formData.verificationOption === 'SEBI' && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="SEBI Registration Number (e.g., INZ000209921)"
                  value={formData.sebiNumber}
                  onChange={(e) => handleInputChange('sebiNumber', e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
                />
                <label className={`block text-xs sm:text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                  Upload SEBI Certificate (PDF)
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileUpload('sebiCertificate', e.target.files[0])}
                    className="hidden"
                  />
                  <div className={`mt-2 p-3 sm:p-4 border-2 border-dashed rounded-lg cursor-pointer text-center ${isDark ? 'border-white/20 hover:border-white/40' : 'border-black/20 hover:border-black/40'}`}>
                    <FiUpload className="mx-auto mb-1 sm:mb-2" size={20} />
                    <span className="text-xs">Click to upload</span>
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
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
                />
                <input
                  type="url"
                  placeholder="Portfolio / Past Deals Link"
                  value={formData.portfolioLink}
                  onChange={(e) => handleInputChange('portfolioLink', e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
                />
                <input
                  type="text"
                  placeholder="PAN Number (Optional but recommended)"
                  value={formData.panNumber}
                  onChange={(e) => handleInputChange('panNumber', e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
                />
                <label className={`block text-xs sm:text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                  Upload ID Proof (Aadhaar/Passport/Driving License)
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload('idProof', e.target.files[0])}
                    className="hidden"
                  />
                  <div className={`mt-2 p-3 sm:p-4 border-2 border-dashed rounded-lg cursor-pointer text-center ${isDark ? 'border-white/20 hover:border-white/40' : 'border-black/20 hover:border-black/40'}`}>
                    <FiUpload className="mx-auto mb-1 sm:mb-2" size={20} />
                    <span className="text-xs">Click to upload</span>
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
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            />
            <input
              type="email"
              placeholder="Company Email"
              value={formData.companyEmail}
              onChange={(e) => handleInputChange('companyEmail', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            />
            <input
              type="number"
              placeholder="Work Experience Years"
              value={formData.workExperience}
              onChange={(e) => handleInputChange('workExperience', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            />
            <textarea
              placeholder="Short Bio / Investment Thesis"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={4}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            />
            <input
              type="url"
              placeholder="Website / AngelList Link / Portfolio Site"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
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
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            />
            <select
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            >
              <option value="">Select State</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            <select
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            >
              <option value="India">India</option>
              <option value="Others">Others</option>
            </select>
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
                  <label key={stage} className={`flex items-center gap-2 p-2 rounded cursor-pointer ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
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
            <select
              value={formData.engagementType}
              onChange={(e) => handleInputChange('engagementType', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            >
              <option value="">Engagement Type</option>
              {engagementTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
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
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <img src={logo} alt="EVO-A Logo" className="h-8 w-8 sm:h-10 sm:w-10 object-contain" />
            <span className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>EVO-A</span>
          </div>
          <h1 className={`text-lg sm:text-2xl font-bold mb-1 sm:mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
            Investor Registration
          </h1>
          <p className={`text-xs sm:text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
            Step {currentStep} of 7
          </p>
        </div>

        <div className={`mb-4 sm:mb-6 h-1.5 sm:h-2 rounded-full shrink-0 ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
          <div
            className={`h-full rounded-full transition-all duration-300 ${isDark ? 'bg-white' : 'bg-black'}`}
            style={{ width: `${(currentStep / 7) * 100}%` }}
          />
        </div>

        <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 flex-1 overflow-y-auto ${isDark ? 'bg-black/50 border border-white/10' : 'bg-white border border-black/10'}`}>
          {renderStep()}
        </div>

        <div className="flex justify-between gap-2 sm:gap-4 shrink-0">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${currentStep === 1
              ? 'opacity-50 cursor-not-allowed'
              : isDark
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-black/10 text-black hover:bg-black/20'
              }`}
          >
            Previous
          </button>
          {currentStep < 7 ? (
            <button
              type="button"
              onClick={nextStep}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${isDark
                ? 'bg-white text-black hover:bg-white/90'
                : 'bg-black text-white hover:bg-black/90'
                }`}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${isDark
                ? 'bg-white text-black hover:bg-white/90'
                : 'bg-black text-white hover:bg-black/90'
                }`}
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

