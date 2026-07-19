import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUpload, FiArrowLeft } from "react-icons/fi";
import SearchableSelect from "../../components/shared/SearchableSelect";
import { useTheme } from "../../contexts/ThemeContext";
import { updateUserProfile } from "../../services/usersService";
import storageService from "../../services/storageService";

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
  flex:1; display:flex; flex-direction:column; max-width:680px; width:100%;
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

/* ── Card ── */
.reg-card {
  background:#FFFFFF; border:1px solid #E2E8F0; border-radius:16px; padding:32px;
  flex:1; overflow-y:auto; margin-bottom:24px;
  animation:reg-fadeUp .45s .1s ease both;
  box-shadow:0 4px 24px rgba(15,23,42,.06),0 1px 4px rgba(15,23,42,.04);
}

/* Section header inside viewer card (replaces Bebas sections) */
.reg-section-header {
  font-family:'Inter',sans-serif; font-size:14px; font-weight:700;
  letter-spacing:-.01em; color:#0F172A;
  margin:24px 0 14px; padding-top:20px;
  border-top:1px solid #F1F5F9;
}
.reg-section-header:first-child { margin-top:0; padding-top:0; border-top:none; }

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
  margin-bottom:6px; display:block; cursor:pointer;
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

/* ── Submit button (full-width on viewer page) ── */
.reg-btn-primary {
  width:100%; font-family:'Inter',sans-serif; font-size:14px; font-weight:700;
  padding:15px 32px; border-radius:8px;
  background:#1565C0; color:#fff; border:none; cursor:pointer;
  transition:background .2s,transform .15s,box-shadow .2s;
  box-shadow:0 4px 16px rgba(21,101,192,.32); clip-path:none; margin-top:8px;
}
.reg-btn-primary:hover:not(:disabled) { background:#1976D2; transform:translateY(-1px); box-shadow:0 6px 24px rgba(21,101,192,.40); }
.reg-btn-primary:active { transform:scale(.97); }
.reg-btn-primary:disabled { background:#CBD5E1; color:#94A3B8; cursor:not-allowed; box-shadow:none; clip-path:none; }

/* ── Error ── */
.reg-error {
  background:#FEF2F2; border:1px solid #FECACA; border-radius:8px;
  padding:12px 16px; font-family:'Inter',sans-serif; font-size:13px;
  color:#DC2626; margin-bottom:16px;
}

/* ── Responsive ── */
@media(max-width:640px) {
  .reg-inner{padding:24px 16px 36px;} .reg-card{padding:20px;border-radius:12px;}
  .reg-topbar{padding:0 16px;}
}
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
