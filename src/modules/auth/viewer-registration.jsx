import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUpload, FiUser } from "react-icons/fi";
import { useTheme } from "../../contexts/ThemeContext";
import SearchableSelect from "../../components/shared/SearchableSelect";
import logo from "../../assets/logo.avif";
import { updateUserProfile } from "../../services/usersService";
import storageService from "../../services/storageService";

export default function ViewerRegistration() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

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
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleFileUpload = (file) => {
    if (!file) return;
    setFormData(prev => ({ ...prev, profilePhoto: file }));
    // Show image preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
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
    if (!formData.agreeToTerms) {
      setError('Please agree to the Terms & Privacy Policy to continue.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Upload Profile Photo if selected
      let avatarUrl = undefined;
      if (formData.profilePhoto) {
        try {
          const fileName = `avatars/${Date.now()}_${formData.profilePhoto.name.replace(/\s+/g, '_')}`;
          avatarUrl = await storageService.uploadFile(formData.profilePhoto, 'avatars', fileName);
        } catch (uploadErr) {
          console.warn('Profile photo upload failed, continuing without it:', uploadErr.message);
          // Don't block registration if image upload fails
        }
      }

      // Build bio from interests and occupation
      const bioParts = [];
      if (formData.occupation) bioParts.push(`Occupation: ${formData.occupation}`);
      if (formData.interests.length > 0) bioParts.push(`Interests: ${formData.interests.join(', ')}`);
      const bio = bioParts.join('\n');

      const location = [formData.city, formData.state, formData.country].filter(Boolean).join(', ');

      const profileData = {
        fullName: formData.fullName,
        location: location || undefined,
        bio: bio || undefined,
      };

      // Only include avatarUrl if upload succeeded
      if (avatarUrl) profileData.avatarUrl = avatarUrl;

      // Only include website if provided (must be a valid URL)
      if (formData.linkedinProfile) {
        const linkedin = formData.linkedinProfile.startsWith('http')
          ? formData.linkedinProfile
          : `https://${formData.linkedinProfile}`;
        profileData.website = linkedin;
      }

      // Strip undefined values
      Object.keys(profileData).forEach(key => {
        if (profileData[key] === undefined || profileData[key] === '') delete profileData[key];
      });

      await updateUserProfile(profileData);
      navigate('/viewer');
    } catch (err) {
      console.error("Registration error:", err);
      const msg = err?.data?.message || err?.message || 'Failed to register. Please try again.';
      setError(Array.isArray(msg) ? msg.join('. ') : msg);
    } finally {
      setLoading(false);
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

        <form onSubmit={handleSubmit} className={`p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3 md:space-y-4 flex-1 overflow-y-auto ${isDark ? 'bg-black/50 border border-white/10' : 'bg-white border border-black/10'}`}>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
            1. Basic Identity
          </h2>
          <input
            type="text"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleNameChange}
            required
            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
          />
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            required
            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
          />

          {/* Profile Photo */}
          <label className={`block text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
            Profile Photo (Optional)
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files[0])}
              className="hidden"
            />
            <div className={`mt-2 border-2 border-dashed cursor-pointer transition-all ${isDark ? 'border-white/20 hover:border-[#00B8A9]/50' : 'border-black/20 hover:border-[#00B8A9]/50'}`}>
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover" />
                  <div className={`absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity ${isDark ? 'bg-black/60' : 'bg-white/60'}`}>
                    <span className="text-xs font-medium">Click to change</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 sm:p-4 text-center">
                  <FiUpload className="mx-auto mb-1 sm:mb-2" size={20} />
                  <span className="text-xs">Click to upload photo</span>
                </div>
              )}
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
            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
          />
          <input
            type="tel"
            placeholder="Mobile Number"
            value={formData.mobile}
            onChange={(e) => handleInputChange('mobile', e.target.value)}
            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
          />

          <h2 className={`text-lg sm:text-xl font-semibold mt-4 sm:mt-6 mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
            3. Location Details
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
            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
          />
          <input
            type="text"
            placeholder="Country"
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
          />

          <h2 className={`text-lg sm:text-xl font-semibold mt-4 sm:mt-6 mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
            4. Interest Selection
          </h2>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {interests.map(interest => (
              <label key={interest} className={`flex items-center gap-2 p-2 cursor-pointer ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
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
            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
          />
          <input
            type="text"
            placeholder="LinkedIn Profile URL (Optional)"
            value={formData.linkedinProfile}
            onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border focus:outline-none focus:ring-1 transition-all ${isDark ? 'bg-black/80 border-white/20 text-white placeholder-white/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30' : 'bg-white border-black/20 text-black placeholder-black/50 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'}`}
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
            disabled={loading}
            className="w-full py-2.5 sm:py-3 text-xs sm:text-sm font-semibold transition-all mt-4 sm:mt-6 shrink-0 bg-[#00B8A9] text-white hover:bg-[#00A89A] shadow-lg shadow-[#00B8A9]/30 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-[#00B8A9]/40 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
