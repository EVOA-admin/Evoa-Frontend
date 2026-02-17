import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUpload } from "react-icons/fi";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/logo.avif";

export default function IncubatorRegistration() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  // Removed: showPassword, showConfirmPassword (Account Security section removed)

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
    youtube: ''
    // Removed: Account Security fields (email, phone, password, confirmPassword, emailOTP, phoneOTP)
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
        role: 'INCUBATOR',
        profile_complete: true
      });

      // TODO: Save registration data to backend database here

      // Navigate to dashboard
      navigate('/incubator');
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
              1. Incubator Identity
            </h2>
            <input
              type="text"
              placeholder="Incubator Name"
              value={formData.incubatorName}
              onChange={(e) => handleInputChange('incubatorName', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            />
            <label className={`block text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
              Logo Upload
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload('logo', e.target.files[0])}
                className="hidden"
              />
              <div className={`mt-2 p-4 border-2 border-dashed rounded-lg cursor-pointer text-center ${isDark ? 'border-white/20 hover:border-white/40' : 'border-black/20 hover:border-black/40'}`}>
                <FiUpload className="mx-auto mb-2" size={24} />
                <span className="text-xs">Click to upload</span>
              </div>
            </label>
            <input
              type="email"
              placeholder="Official Email ID"
              value={formData.officialEmail}
              onChange={(e) => handleInputChange('officialEmail', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            />
            <input
              type="url"
              placeholder="Website URL"
              value={formData.websiteUrl}
              onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              2. Location Details
            </h2>
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
            <input
              type="text"
              placeholder="City"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            />
            <textarea
              placeholder="Full Address (Optional)"
              value={formData.fullAddress}
              onChange={(e) => handleInputChange('fullAddress', e.target.value)}
              rows={3}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              3. Verification & Authentication
            </h2>
            <select
              value={formData.organizationType}
              onChange={(e) => handleInputChange('organizationType', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            >
              <option value="">Type of Organization</option>
              {organizationTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={formData.affiliationType}
              onChange={(e) => handleInputChange('affiliationType', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            >
              <option value="">Affiliation Type</option>
              {affiliationTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        );

      case 4:
        return (
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              4. Verified Document Section
            </h2>
            <select
              value={formData.verificationDocumentType}
              onChange={(e) => handleInputChange('verificationDocumentType', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            >
              <option value="">Choose Your Verification Document</option>
              {verificationDocTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {formData.verificationDocumentType && (
              <label className={`block text-xs sm:text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                Upload Selected Document (PDF/JPG/PNG)
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload('verificationDocument', e.target.files[0])}
                  className="hidden"
                />
                <div className={`mt-2 p-3 sm:p-4 border-2 border-dashed rounded-lg cursor-pointer text-center ${isDark ? 'border-white/20 hover:border-white/40' : 'border-black/20 hover:border-black/40'}`}>
                  <FiUpload className="mx-auto mb-1 sm:mb-2" size={20} />
                  <span className="text-xs">Click to upload</span>
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
            <select
              value={formData.programType}
              onChange={(e) => handleInputChange('programType', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            >
              <option value="">Program Type</option>
              {programTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                Sector Focus (Multi-select)
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
            <select
              value={formData.equityPolicy}
              onChange={(e) => handleInputChange('equityPolicy', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            >
              <option value="">Equity Policy</option>
              {equityPolicies.map(policy => (
                <option key={policy} value={policy}>{policy}</option>
              ))}
            </select>
            {formData.equityPolicy === 'Custom Equity' && (
              <input
                type="text"
                placeholder="Enter Custom Equity"
                value={formData.customEquity}
                onChange={(e) => handleInputChange('customEquity', e.target.value)}
                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
              />
            )}
            <select
              value={formData.fundingSupport}
              onChange={(e) => handleInputChange('fundingSupport', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            >
              <option value="">Funding Support</option>
              {fundingSupports.map(support => (
                <option key={support} value={support}>{support}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Program Duration (Weeks/Months)"
              value={formData.programDuration}
              onChange={(e) => handleInputChange('programDuration', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            />
            <input
              type="number"
              placeholder="Cohort Size"
              value={formData.cohortSize}
              onChange={(e) => handleInputChange('cohortSize', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            />
            <input
              type="number"
              placeholder="Number of Mentors"
              value={formData.numberOfMentors}
              onChange={(e) => handleInputChange('numberOfMentors', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
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
                <label key={facility} className={`flex items-center gap-2 p-2 rounded cursor-pointer ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
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
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            />
            <textarea
              placeholder="Top Startup Success Stories"
              value={formData.successStories}
              onChange={(e) => handleInputChange('successStories', e.target.value)}
              rows={3}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            />
            <input
              type="url"
              placeholder="LinkedIn Profile"
              value={formData.linkedinProfile}
              onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            />
            <input
              type="url"
              placeholder="Instagram (Optional)"
              value={formData.instagram}
              onChange={(e) => handleInputChange('instagram', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
            />
            <input
              type="url"
              placeholder="YouTube (Optional)"
              value={formData.youtube}
              onChange={(e) => handleInputChange('youtube', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
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
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <img src={logo} alt="EVO-A Logo" className="h-8 w-8 sm:h-10 sm:w-10 object-contain" />
            <span className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>EVO-A</span>
          </div>
          <h1 className={`text-lg sm:text-2xl font-bold mb-1 sm:mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
            Incubator Registration
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

