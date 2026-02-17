import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUpload } from "react-icons/fi";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/logo.avif";

export default function ViewerRegistration() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  // Removed: showPassword, showConfirmPassword (Account Security section removed)

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    profilePhoto: null,
    email: '',
    mobile: '',
    city: '',
    state: '',
    country: 'India',
    interests: [],
    occupation: '',
    linkedinProfile: '',
    agreeToTerms: false,
    allowNotifications: false
    // Removed: password, confirmPassword (Account Security section removed)
  });

  const states = ['Uttar Pradesh', 'Delhi NCR', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'West Bengal', 'Rajasthan', 'Telangana', 'Kerala', 'Others'];
  const interests = ['Startup Content', 'Business Learning', 'AI/Tech', 'Personal Finance', 'Investing Basics', 'Pitch Battles', 'Hackathons', 'Trending Startups', 'Founder Stories', 'Internships & Jobs'];

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

  const generateUsername = (name) => {
    if (!name) return '';
    const base = name.toLowerCase().replace(/\s+/g, '_');
    const random = Math.floor(Math.random() * 100);
    return `${base}_${random}`;
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    handleInputChange('fullName', name);
    if (!formData.username || formData.username.startsWith(formData.fullName.toLowerCase().replace(/\s+/g, '_'))) {
      handleInputChange('username', generateUsername(name));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);

    try {
      // Save metadata to Supabase user_metadata
      const { updateUserMetadata } = useAuth();
      await updateUserMetadata({
        role: 'VIEWER',
        profile_complete: true
      });

      // TODO: Save registration data to backend database here

      // Navigate to dashboard
      navigate('/viewer');
    } catch (error) {
      console.error('Failed to save metadata:', error);
      alert('Failed to complete registration. Please try again.');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 overflow-hidden ${isDark ? 'bg-black' : 'bg-white'}`}>
      <div className="h-screen flex flex-col max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="mb-4 sm:mb-6 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <img src={logo} alt="EVO-A Logo" className="h-8 w-8 sm:h-10 sm:w-10 object-contain" />
            <span className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>EVO-A</span>
          </div>
          <h1 className={`text-lg sm:text-2xl font-bold mb-1 sm:mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
            Viewer Registration
          </h1>
          <p className={`text-xs sm:text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
            Join as a viewer to explore and discover opportunities
          </p>
        </div>

        <form onSubmit={handleSubmit} className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3 md:space-y-4 flex-1 overflow-y-auto ${isDark ? 'bg-black/50 border border-white/10' : 'bg-white border border-black/10'}`}>
          <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
            1. Basic Identity
          </h2>
          <input
            type="text"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleNameChange}
            required
            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
          />
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            required
            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
          />
          <label className={`block text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
            Profile Photo Upload (Optional but recommended)
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload('profilePhoto', e.target.files[0])}
              className="hidden"
            />
            <div className={`mt-2 p-3 sm:p-4 border-2 border-dashed rounded-lg cursor-pointer text-center ${isDark ? 'border-white/20 hover:border-white/40' : 'border-black/20 hover:border-black/40'}`}>
              <FiUpload className="mx-auto mb-1 sm:mb-2" size={20} />
              <span className="text-xs">Click to upload</span>
            </div>
          </label>

          <h2 className={`text-lg sm:text-xl font-semibold mt-4 sm:mt-6 mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
            2. Account Details
          </h2>
          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
          />
          <input
            type="tel"
            placeholder="Mobile Number"
            value={formData.mobile}
            onChange={(e) => handleInputChange('mobile', e.target.value)}
            required
            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
          />

          <h2 className={`text-lg sm:text-xl font-semibold mt-4 sm:mt-6 mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
            3. Location Details
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
          <input
            type="text"
            placeholder="Country"
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
          />

          <h2 className={`text-lg sm:text-xl font-semibold mt-4 sm:mt-6 mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
            4. Interest Selection
          </h2>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {interests.map(interest => (
              <label key={interest} className={`flex items-center gap-2 p-2 rounded cursor-pointer ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
                <input
                  type="checkbox"
                  checked={formData.interests.includes(interest)}
                  onChange={() => handleArrayChange('interests', interest)}
                  className="w-4 h-4"
                />
                <span className={`text-sm ${isDark ? 'text-white' : 'text-black'}`}>{interest}</span>
              </label>
            ))}
          </div>

          <h2 className={`text-lg sm:text-xl font-semibold mt-4 sm:mt-6 mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
            5. Optional Professional Info
          </h2>
          <input
            type="text"
            placeholder="Occupation (Student, Working Professional, etc.)"
            value={formData.occupation}
            onChange={(e) => handleInputChange('occupation', e.target.value)}
            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
          />
          <input
            type="url"
            placeholder="LinkedIn Profile (Optional)"
            value={formData.linkedinProfile}
            onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border ${isDark ? 'bg-black/80 border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
          />

          <h2 className={`text-lg sm:text-xl font-semibold mt-4 sm:mt-6 mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
            6. Terms & Agreements
          </h2>
          <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-white' : 'text-black'}`}>
            <input
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
              required
              className="w-4 h-4"
            />
            <span className="text-sm">I agree to EVOA's Terms & Privacy Policy</span>
          </label>
          <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-white' : 'text-black'}`}>
            <input
              type="checkbox"
              checked={formData.allowNotifications}
              onChange={(e) => handleInputChange('allowNotifications', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">Allow notifications for important updates</span>
          </label>

          <button
            type="submit"
            className={`w-full py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all mt-4 sm:mt-6 shrink-0 ${isDark
              ? 'bg-white text-black hover:bg-white/90'
              : 'bg-black text-white hover:bg-black/90'
              }`}
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}

