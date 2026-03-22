import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUpload, FiArrowLeft } from "react-icons/fi";
import SearchableSelect from "../../components/shared/SearchableSelect";
import { useTheme } from "../../contexts/ThemeContext";
import { updateUserProfile } from "../../services/usersService";
import storageService from "../../services/storageService";

const REG_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600&family=DM+Mono:wght@300;400&display=swap');
@keyframes reg-fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
.reg-root{min-height:100vh;background:#060607;color:#F4F0E8;font-family:'Cormorant Garamond',serif;display:flex;flex-direction:column;position:relative;overflow-x:hidden}
.reg-root::before{content:'';position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(244,240,232,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(244,240,232,.025) 1px,transparent 1px);background-size:60px 60px;z-index:0}
.reg-topbar{position:sticky;top:0;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:64px;background:rgba(6,6,7,.92);backdrop-filter:blur(16px);border-bottom:1px solid rgba(244,240,232,.06);flex-shrink:0}
.reg-brand{font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:.1em;color:#F4F0E8}
.reg-brand span{color:#E8341A}
.reg-back{display:flex;align-items:center;gap:6px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:rgba(244,240,232,.45);border:1px solid rgba(244,240,232,.1);padding:7px 14px;background:none;cursor:pointer;transition:color .2s,border-color .2s}
.reg-back:hover{color:#E8341A;border-color:rgba(232,52,26,.35)}
.reg-inner{flex:1;display:flex;flex-direction:column;max-width:680px;width:100%;margin:0 auto;padding:36px 24px 40px;position:relative;z-index:1}
.reg-head{margin-bottom:32px;animation:reg-fadeUp .4s ease both}
.reg-step-label{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:#E8341A;margin-bottom:8px}
.reg-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(28px,4vw,44px);letter-spacing:.04em;color:#F4F0E8;margin-bottom:6px;line-height:.95}
.reg-subtitle{font-size:14px;font-weight:300;color:rgba(244,240,232,.4);font-style:italic}
.reg-card{background:#0a0a0f;border:1px solid rgba(244,240,232,.07);padding:28px;flex:1;overflow-y:auto;margin-bottom:24px;animation:reg-fadeUp .4s .1s ease both}
.reg-section-header{font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:.05em;color:#F4F0E8;margin:20px 0 16px;padding-top:16px;border-top:1px solid rgba(244,240,232,.06)}
.reg-section-header:first-child{margin-top:0;padding-top:0;border-top:none}
.reg-input{width:100%;padding:11px 14px;background:#060607;border:1px solid rgba(244,240,232,.12);color:#F4F0E8;font-family:'Cormorant Garamond',serif;font-size:15px;font-weight:300;outline:none;transition:border-color .2s}
.reg-input::placeholder{color:rgba(244,240,232,.3)}
.reg-input:focus{border-color:#E8341A}
.reg-label{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:rgba(244,240,232,.4);margin-bottom:6px;display:block}
.reg-upload{border:1px dashed rgba(244,240,232,.15);padding:20px;text-align:center;cursor:pointer;transition:border-color .2s;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:rgba(244,240,232,.35)}
.reg-upload:hover{border-color:rgba(232,52,26,.4);color:#E8341A}
.reg-chip{display:inline-block;padding:5px 12px;border:1px solid rgba(244,240,232,.12);font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:rgba(244,240,232,.5);cursor:pointer;transition:all .2s;background:none}
.reg-chip:hover{border-color:rgba(232,52,26,.35);color:#E8341A}
.reg-chip.on{background:rgba(232,52,26,.1);border-color:#E8341A;color:#E8341A}
.reg-check-label{display:flex;align-items:center;gap:10px;cursor:pointer;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:rgba(244,240,232,.5);padding:6px 0}
.reg-check-label input{accent-color:#E8341A;width:14px;height:14px}
.reg-btn-primary{width:100%;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;padding:16px 36px;background:#E8341A;color:#060607;border:none;cursor:pointer;transition:background .2s,transform .15s;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));margin-top:8px}
.reg-btn-primary:hover:not(:disabled){background:#C9230F}
.reg-btn-primary:active{transform:scale(.97)}
.reg-btn-primary:disabled{background:rgba(244,240,232,.1);color:rgba(244,240,232,.3);cursor:not-allowed;clip-path:none}
.reg-error{background:rgba(232,52,26,.08);border:1px solid rgba(232,52,26,.25);padding:12px 16px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.06em;color:rgba(232,52,26,.9);margin-bottom:16px}
@media(max-width:640px){.reg-inner{padding:20px 16px 32px}.reg-card{padding:18px}.reg-topbar{padding:0 16px}}
`;

export default function ViewerRegistration() {
  const { theme } = useTheme();
  const isDark = true; // page shell is always dark — force dark styles throughout
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

  const inputCls = "reg-input";

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
          <div className="reg-step-label">Viewer Registration</div>
          <div className="reg-title">Create Your Profile</div>
          <div className="reg-subtitle">Explore the ecosystem as a viewer — no commitment needed</div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="reg-card">
            {error && <div className="reg-error">{error}</div>}

            <div className="reg-section-header">1. Basic Identity</div>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <input type="text" placeholder="Full Name" value={formData.fullName} onChange={handleNameChange} required className={inputCls} />
              <input type="text" placeholder="Username" value={formData.username} onChange={(e) => handleInputChange('username', e.target.value)} required className={inputCls} />
              <label className="reg-label" style={{cursor:'pointer'}}>
                Profile Photo (Optional)
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e.target.files[0])} className="hidden" style={{display:'none'}} />
                <div className={`reg-upload${imagePreview ? ' filled' : ''}`} style={{marginTop:6}}>
                  {imagePreview
                    ? <img src={imagePreview} alt="Preview" style={{width:'100%',height:80,objectFit:'cover'}} />
                    : <><FiUpload style={{margin:'0 auto 4px',display:'block'}} size={18}/><span>Click to upload photo</span></>}
                </div>
              </label>
            </div>

            <div className="reg-section-header">2. Account Details</div>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <input type="email" placeholder="Email Address" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className={inputCls} />
              <input type="tel" placeholder="Mobile Number" value={formData.mobile} onChange={(e) => handleInputChange('mobile', e.target.value)} className={inputCls} />
            </div>

            <div className="reg-section-header">3. Location</div>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <SearchableSelect value={formData.state} onChange={(v) => handleInputChange('state', v)} options={states.map(s => ({ value: s, label: s }))} placeholder="Select State" isDark={true} />
              <input type="text" placeholder="City" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} className={inputCls} />
              <input type="text" placeholder="Country" value={formData.country} onChange={(e) => handleInputChange('country', e.target.value)} className={inputCls} />
            </div>

            <div className="reg-section-header">4. Interests</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {interests.map(interest => (
                <button key={interest} type="button"
                  onClick={() => handleArrayChange('interests', interest)}
                  className={`reg-chip${formData.interests.includes(interest) ? ' on' : ''}`}>
                  {interest}
                </button>
              ))}
            </div>

            <div className="reg-section-header">5. Optional Info</div>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <input type="text" placeholder="Occupation (Student, Working Professional, etc.)" value={formData.occupation} onChange={(e) => handleInputChange('occupation', e.target.value)} className={inputCls} />
              <input type="text" placeholder="LinkedIn Profile URL (Optional)" value={formData.linkedinProfile} onChange={(e) => handleInputChange('linkedinProfile', e.target.value)} className={inputCls} />
            </div>

            <div className="reg-section-header">6. Terms & Agreements</div>
            <div style={{display:'flex',flexDirection:'column',gap:4}}>
              <label className="reg-check-label">
                <input type="checkbox" checked={formData.agreeToTerms} onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)} required />
                I agree to EVOA’s Terms & Privacy Policy
              </label>
              <label className="reg-check-label">
                <input type="checkbox" checked={formData.allowNotifications} onChange={(e) => handleInputChange('allowNotifications', e.target.checked)} />
                Allow notifications for important updates
              </label>
            </div>
          </div>

          <button type="submit" disabled={loading} className="reg-btn-primary">
            {loading ? 'Creating Account…' : 'Create Account →'}
          </button>
        </form>
      </div>
    </div>
  );
}
