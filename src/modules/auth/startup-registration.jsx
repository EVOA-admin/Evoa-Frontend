import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiUpload, FiX, FiArrowLeft, FiVideo, FiImage } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import SearchableSelect from "../../components/shared/SearchableSelect";
import storageService from "../../services/storageService";
import startupsService from "../../services/startupsService";
import { getMyStartup, updateStartup } from "../../services/startupsService";
import { updateUserProfile } from "../../services/usersService";

const REG_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=DM+Mono:wght@300;400&display=swap');

/* ── Animations ── */
@keyframes reg-fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes reg-spin   { to{transform:rotate(360deg)} }

/* ── Root ── */
.reg-root {
  min-height:100vh;
  background:#F8FAFC;
  color:#0F172A;
  font-family:'Inter',sans-serif;
  display:flex;flex-direction:column;
  position:relative;overflow-x:hidden;
}
/* Subtle dot-grid background matching landing page */
.reg-root::before {
  content:'';position:fixed;inset:0;pointer-events:none;
  background-image:radial-gradient(circle,#CBD5E1 1px,transparent 1px);
  background-size:28px 28px;opacity:.55;z-index:0;
}

/* ── Topbar ── */
.reg-topbar {
  position:sticky;top:0;z-index:10;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 32px;height:64px;
  background:rgba(255,255,255,.95);
  backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
  border-bottom:1px solid #E2E8F0;flex-shrink:0;
  box-shadow:0 1px 3px rgba(15,23,42,.06);
}
.reg-brand {
  font-family:'Inter',sans-serif;font-size:22px;font-weight:800;
  letter-spacing:-.02em;color:#0F172A;
}
.reg-brand span{color:#1565C0;}
.reg-back {
  display:flex;align-items:center;gap:6px;
  font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;
  color:#64748B;border:1px solid #E2E8F0;padding:7px 16px;border-radius:6px;
  background:#fff;cursor:pointer;transition:all .2s;
}
.reg-back:hover{color:#1565C0;border-color:rgba(21,101,192,.4);background:#EEF5FF;}

/* ── Inner wrapper ── */
.reg-inner {
  flex:1;display:flex;flex-direction:column;
  max-width:860px;width:100%;
  margin:0 auto;padding:40px 24px 48px;
  position:relative;z-index:1;
}

/* ── Header ── */
.reg-head{margin-bottom:32px;animation:reg-fadeUp .45s ease both;}
.reg-step-label {
  font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.2em;
  text-transform:uppercase;color:#1565C0;margin-bottom:10px;
  display:flex;align-items:center;gap:8px;
}
.reg-step-label::before{content:'';width:18px;height:2px;background:#1565C0;flex-shrink:0;}
.reg-title {
  font-family:'Inter',sans-serif;font-size:clamp(26px,4vw,40px);
  font-weight:800;letter-spacing:-.025em;color:#0F172A;
  margin-bottom:8px;line-height:1.1;
}
.reg-subtitle{font-size:15px;font-weight:400;color:#64748B;line-height:1.6;}

/* ── Progress bar ── */
.reg-progress{display:flex;align-items:center;gap:6px;margin-bottom:32px;}
.reg-dot {
  width:32px;height:4px;border-radius:2px;
  background:#E2E8F0;transition:background .3s,width .3s;
}
.reg-dot.active{background:#1565C0;width:52px;}
.reg-dot.done{background:rgba(21,101,192,.35);}

/* ── Form card ── */
.reg-card {
  background:#FFFFFF;
  border:1px solid #E2E8F0;
  border-radius:16px;
  padding:32px;
  flex:1;overflow-y:auto;margin-bottom:24px;
  animation:reg-fadeUp .45s .1s ease both;
  box-shadow:0 4px 24px rgba(15,23,42,.06),0 1px 4px rgba(15,23,42,.04);
}
.reg-step-title {
  font-family:'Inter',sans-serif;font-size:18px;font-weight:700;
  letter-spacing:-.01em;color:#0F172A;
  margin-bottom:24px;padding-bottom:16px;
  border-bottom:1px solid #F1F5F9;
}

/* ── Inputs ── */
.reg-input {
  width:100%;padding:11px 14px;
  background:#FFFFFF;
  border:1.5px solid #E2E8F0;
  border-radius:8px;
  color:#0F172A;
  font-family:'Inter',sans-serif;font-size:14px;font-weight:400;
  outline:none;transition:border-color .2s,box-shadow .2s;
  box-sizing:border-box;
}
.reg-input::placeholder{color:#94A3B8;}
.reg-input:focus{border-color:#1565C0;box-shadow:0 0 0 3px rgba(21,101,192,.10);}
textarea.reg-input{resize:vertical;min-height:80px;}

.reg-label {
  font-family:'Inter',sans-serif;font-size:12px;font-weight:600;
  letter-spacing:.01em;text-transform:uppercase;
  color:#334155;margin-bottom:6px;display:block;
}

/* ── Upload box ── */
.reg-upload {
  border:1.5px dashed #CBD5E1;border-radius:8px;
  padding:20px;text-align:center;cursor:pointer;
  transition:border-color .2s,background .2s;
  font-family:'Inter',sans-serif;font-size:12px;font-weight:500;
  color:#94A3B8;
}
.reg-upload:hover{border-color:rgba(21,101,192,.5);color:#1565C0;background:#EEF5FF;}
.reg-upload.filled{border-color:rgba(21,101,192,.45);background:#F0F7FF;}

/* ── Selection chips ── */
.reg-chip {
  display:inline-block;padding:6px 14px;border-radius:6px;
  border:1.5px solid #E2E8F0;
  font-family:'Inter',sans-serif;font-size:12px;font-weight:500;
  color:#64748B;cursor:pointer;transition:all .18s;background:#fff;
}
.reg-chip:hover{border-color:rgba(21,101,192,.45);color:#1565C0;background:#EEF5FF;}
.reg-chip.on{background:#EEF5FF;border-color:#1565C0;color:#1565C0;font-weight:600;}

/* ── Nav row ── */
.reg-nav{display:flex;justify-content:space-between;gap:16px;flex-shrink:0;animation:reg-fadeUp .45s .2s ease both;}

/* ── Buttons ── */
.reg-btn-ghost {
  font-family:'Inter',sans-serif;font-size:13px;font-weight:600;
  letter-spacing:.01em;padding:12px 24px;border-radius:8px;
  border:1.5px solid #E2E8F0;color:#64748B;background:#fff;
  cursor:pointer;transition:all .2s;
}
.reg-btn-ghost:hover:not(:disabled){border-color:#1565C0;color:#1565C0;background:#EEF5FF;}
.reg-btn-ghost:disabled{opacity:.4;cursor:not-allowed;}

.reg-btn-primary {
  font-family:'Inter',sans-serif;font-size:13px;font-weight:700;
  letter-spacing:.01em;padding:13px 32px;border-radius:8px;
  background:#1565C0;color:#fff;border:none;cursor:pointer;
  transition:background .2s,transform .15s,box-shadow .2s;
  box-shadow:0 4px 16px rgba(21,101,192,.32);
  clip-path:none;
}
.reg-btn-primary:hover:not(:disabled){background:#1976D2;transform:translateY(-1px);box-shadow:0 6px 24px rgba(21,101,192,.40);}
.reg-btn-primary:active{transform:scale(.97);}
.reg-btn-primary:disabled{background:#CBD5E1;color:#94A3B8;cursor:not-allowed;box-shadow:none;}

/* ── Error / Info messages ── */
.reg-error {
  background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;
  padding:12px 16px;font-family:'Inter',sans-serif;font-size:13px;
  color:#DC2626;margin-top:16px;
}
.reg-info {
  background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;
  padding:12px 16px;font-family:'Inter',sans-serif;font-size:13px;
  color:#D97706;margin-top:16px;
}

/* ── Section label ── */
.reg-section-label {
  font-family:'Inter',sans-serif;font-size:11px;font-weight:600;
  letter-spacing:.06em;text-transform:uppercase;
  color:#94A3B8;margin-bottom:14px;
}

/* ── Verify box ── */
.reg-verify-box{
  border:1.5px solid #E2E8F0;background:#F8FAFC;
  padding:20px;border-radius:12px;
}
.reg-verify-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px;}
.reg-verify-title{font-family:'Inter',sans-serif;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#334155;}
.reg-pill{
  display:inline-flex;align-items:center;padding:4px 12px;
  border:1px solid rgba(21,101,192,.35);border-radius:100px;
  font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase;
  color:#1565C0;background:#EEF5FF;
}
.reg-hint{margin-top:6px;font-size:13px;color:#64748B;}

/* ── Entity grid ── */
.reg-entity-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;}
.reg-entity-card{
  padding:14px;border-radius:10px;
  border:1.5px solid #E2E8F0;background:#fff;
  text-align:left;cursor:pointer;transition:border-color .2s,background .2s,box-shadow .2s;
}
.reg-entity-card:hover{border-color:rgba(21,101,192,.4);background:#F0F7FF;}
.reg-entity-card.on{border-color:#1565C0;background:#EEF5FF;box-shadow:0 0 0 3px rgba(21,101,192,.08);}
.reg-entity-title{display:block;font-size:14px;font-weight:600;color:#0F172A;}
.reg-entity-copy{display:block;margin-top:4px;font-size:12px;color:#64748B;line-height:1.45;}
.reg-helper{font-size:13px;color:#64748B;line-height:1.6;}

/* ── Responsive ── */
@media(max-width:640px){
  .reg-inner{padding:24px 16px 36px;}
  .reg-card{padding:20px;border-radius:12px;}
  .reg-topbar{padding:0 16px;}
  .reg-nav{flex-direction:column-reverse;}
  .reg-btn-ghost,.reg-btn-primary{width:100%;justify-content:center;}
}
`;

const FOUNDER_ROLES = ["CEO", "CTO", "COO", "CMO", "CFO", "Co-founder", "Solo Founder"];
const INDUSTRIES = [
  "AI / ML",
  "SaaS",
  "FinTech",
  "EdTech",
  "HealthTech",
  "Mobility",
  "D2C / E-commerce",
  "FoodTech",
  "DeepTech",
  "Blockchain / Web3",
  "Agritech",
  "GreenTech / ClimaTech",
  "Gaming",
  "Cybersecurity",
  "Manufacturing",
  "Others",
];
const STAGES = ["Idea Stage", "Pre-Seed", "Seed", "Series A", "Series B+", "Growth / Scale"];
const STATES_LIST = [
  "Uttar Pradesh", "Delhi NCR", "Maharashtra", "Karnataka", "Tamil Nadu",
  "Gujarat", "Rajasthan", "West Bengal", "Telangana", "Kerala", "Haryana",
  "Madhya Pradesh", "Punjab", "Bihar", "Odisha", "Others"
];
const COUNTRY_OPTIONS = [
  { value: "IN", label: "🇮🇳 India" },
  { value: "US", label: "🇺🇸 United States" },
  { value: "GB", label: "🇬🇧 United Kingdom" },
  { value: "SG", label: "🇸🇬 Singapore" },
  { value: "AE", label: "🇦🇪 UAE" },
  { value: "DE", label: "🇩🇪 Germany" },
  { value: "AU", label: "🇦🇺 Australia" },
  { value: "CA", label: "🇨🇦 Canada" },
  { value: "BR", label: "🇧🇷 Brazil" },
  { value: "FR", label: "🇫🇷 France" },
  { value: "NL", label: "🇳🇱 Netherlands" },
  { value: "SE", label: "🇸🇪 Sweden" },
  { value: "IL", label: "🇮🇱 Israel" },
  { value: "NG", label: "🇳🇬 Nigeria" },
  { value: "KE", label: "🇰🇪 Kenya" },
  { value: "ZA", label: "🇿🇦 South Africa" },
  { value: "ID", label: "🇮🇩 Indonesia" },
  { value: "MY", label: "🇲🇾 Malaysia" },
  { value: "JP", label: "🇯🇵 Japan" },
  { value: "KR", label: "🇰🇷 South Korea" },
  { value: "MX", label: "🇲🇽 Mexico" },
  { value: "CN", label: "🇨🇳 China" },
  { value: "TR", label: "🇹🇷 Turkey" },
  { value: "BD", label: "🇧🇩 Bangladesh" },
  { value: "AR", label: "🇦🇷 Argentina" },
  { value: "AT", label: "🇦🇹 Austria" },
  { value: "BE", label: "🇧🇪 Belgium" },
  { value: "CL", label: "🇨🇱 Chile" },
  { value: "CO", label: "🇨🇴 Colombia" },
  { value: "CZ", label: "🇨🇿 Czech Republic" },
  { value: "DK", label: "🇩🇰 Denmark" },
  { value: "EG", label: "🇪🇬 Egypt" },
  { value: "ES", label: "🇪🇸 Spain" },
  { value: "ET", label: "🇪🇹 Ethiopia" },
  { value: "FI", label: "🇫🇮 Finland" },
  { value: "GH", label: "🇬🇭 Ghana" },
  { value: "GR", label: "🇬🇷 Greece" },
  { value: "HU", label: "🇭🇺 Hungary" },
  { value: "IE", label: "🇮🇪 Ireland" },
  { value: "IT", label: "🇮🇹 Italy" },
  { value: "LK", label: "🇱🇰 Sri Lanka" },
  { value: "NP", label: "🇳🇵 Nepal" },
  { value: "NZ", label: "🇳🇿 New Zealand" },
  { value: "PH", label: "🇵🇭 Philippines" },
  { value: "PL", label: "🇵🇱 Poland" },
  { value: "PT", label: "🇵🇹 Portugal" },
  { value: "RO", label: "🇷🇴 Romania" },
  { value: "RU", label: "🇷🇺 Russia" },
  { value: "SA", label: "🇸🇦 Saudi Arabia" },
  { value: "TH", label: "🇹🇭 Thailand" },
  { value: "TZ", label: "🇹🇿 Tanzania" },
  { value: "UA", label: "🇺🇦 Ukraine" },
  { value: "UY", label: "🇺🇾 Uruguay" },
  { value: "VN", label: "🇻🇳 Vietnam" },
  { value: "OTHER", label: "🌍 Other Country" },
];

const COUNTRY_VERIFICATION_DATA = {
  IN: {
    name: "India",
    registry: "MCA - Ministry of Corporate Affairs",
    pill: "CIN / GST",
    label1: "CIN - Company Identification Number",
    hint1: "Format: U12345MH2020PTC123456",
    label2: "GSTIN (optional)",
    entities: [
      { title: "Private Limited (Pvt Ltd)", copy: "Most common startup structure" },
      { title: "LLP", copy: "Limited Liability Partnership" },
      { title: "Partnership Firm", copy: "Registered partnership" },
      { title: "Sole Proprietorship", copy: "Individual / proprietor" },
      { title: "MSME / Udyam", copy: "Udyam registered" },
      { title: "Not Registered Yet", copy: "Idea / pre-registration stage" },
    ],
  },
  US: {
    name: "United States",
    registry: "IRS + State Secretary of State",
    pill: "EIN",
    label1: "EIN - Employer Identification Number",
    hint1: "Format: XX-XXXXXXX",
    label2: "State Registration No. (optional)",
    entities: [
      { title: "C-Corporation", copy: "Preferred for VC - Delaware C-Corp" },
      { title: "LLC", copy: "Limited Liability Company" },
      { title: "S-Corporation", copy: "Pass-through taxation" },
      { title: "Sole Proprietor", copy: "Individual / DBA" },
      { title: "Partnership", copy: "General or limited partnership" },
      { title: "Not Registered Yet", copy: "Idea stage" },
    ],
  },
  GB: {
    name: "United Kingdom",
    registry: "Companies House, UK",
    pill: "CRN",
    label1: "Companies House Number",
    hint1: "8 digits, e.g. 12345678 or OC123456",
    label2: "VAT Number (optional)",
    entities: [
      { title: "Limited Company (Ltd)", copy: "Most common structure" },
      { title: "LLP", copy: "Limited Liability Partnership" },
      { title: "PLC", copy: "Public Limited Company" },
      { title: "Sole Trader", copy: "Self-employed individual" },
      { title: "Partnership", copy: "General partnership" },
      { title: "Not Registered Yet", copy: "Pre-registration" },
    ],
  },
  SG: {
    name: "Singapore",
    registry: "ACRA - Accounting & Corporate Regulatory Authority",
    pill: "UEN",
    label1: "UEN - Unique Entity Number",
    hint1: "e.g. 200312345A or T12LL1234A",
    label2: "GST Registration (optional)",
    entities: [
      { title: "Private Limited (Pte Ltd)", copy: "Standard startup structure" },
      { title: "LLP", copy: "Limited Liability Partnership" },
      { title: "Sole Proprietor", copy: "Individual business" },
      { title: "Partnership", copy: "General partnership" },
      { title: "Branch Office", copy: "Foreign company branch" },
      { title: "Not Registered Yet", copy: "Idea stage" },
    ],
  },
  AE: {
    name: "UAE",
    registry: "DED or Free Zone Authority",
    pill: "TRN / Trade License",
    label1: "Trade License Number",
    hint1: "Issued by DED or Free Zone Authority",
    label2: "TRN - Tax Registration Number (optional)",
    entities: [
      { title: "LLC", copy: "Limited Liability Company" },
      { title: "Free Zone Company (FZCO/FZE)", copy: "Free zone registered" },
      { title: "Sole Establishment", copy: "Individual ownership" },
      { title: "Branch Office", copy: "Foreign company branch" },
      { title: "Civil Company", copy: "Professional services firm" },
      { title: "Not Registered Yet", copy: "Idea stage" },
    ],
  },
  DE: {
    name: "Germany",
    registry: "Handelsregister",
    pill: "HRB / HRA",
    label1: "Handelsregisternummer",
    hint1: "e.g. HRB 12345",
    label2: "Steuernummer / USt-IdNr. (optional)",
    entities: [
      { title: "GmbH", copy: "Limited liability company" },
      { title: "AG", copy: "Joint-stock company" },
      { title: "UG", copy: "Entrepreneurial company" },
      { title: "Einzelunternehmen", copy: "Sole trader" },
      { title: "GbR", copy: "Civil law partnership" },
      { title: "Not Registered Yet", copy: "Idea stage" },
    ],
  },
  AU: {
    name: "Australia",
    registry: "ASIC - Australian Securities & Investments Commission",
    pill: "ACN / ABN",
    label1: "ACN - Australian Company Number",
    hint1: "9 digits, e.g. 123 456 789",
    label2: "ABN - Australian Business Number (optional)",
    entities: [
      { title: "Pty Ltd", copy: "Proprietary Limited" },
      { title: "Ltd", copy: "Public company" },
      { title: "Trust", copy: "Unit or discretionary trust" },
      { title: "Sole Trader", copy: "Individual" },
      { title: "Partnership", copy: "Business partnership" },
      { title: "Not Registered Yet", copy: "Idea stage" },
    ],
  },
  CA: {
    name: "Canada",
    registry: "Corporations Canada or Provincial Registry",
    pill: "BN",
    label1: "Business Number (BN)",
    hint1: "9 digits issued by CRA",
    label2: "GST/HST Number (optional)",
    entities: [
      { title: "Corporation (Inc. / Ltd.)", copy: "Federal or provincial corporation" },
      { title: "Sole Proprietor", copy: "Individual" },
      { title: "Partnership", copy: "General or limited" },
      { title: "Cooperative", copy: "Co-op" },
      { title: "Non-Profit", copy: "Not-for-profit" },
      { title: "Not Registered Yet", copy: "Idea stage" },
    ],
  },
  BR: {
    name: "Brazil",
    registry: "Receita Federal",
    pill: "CNPJ",
    label1: "CNPJ",
    hint1: "Format: XX.XXX.XXX/XXXX-XX",
    label2: "State Registration (optional)",
    entities: [
      { title: "Ltda", copy: "Limited liability company" },
      { title: "S.A.", copy: "Corporation" },
      { title: "MEI", copy: "Individual micro-entrepreneur" },
      { title: "EIRELI", copy: "Single-member company" },
      { title: "Startup Act Registered", copy: "Brazil startup law structure" },
      { title: "Not Registered Yet", copy: "Idea stage" },
    ],
  },
  FR: {
    name: "France",
    registry: "RCS - Registre du Commerce et des Societes",
    pill: "SIRET",
    label1: "SIRET Number",
    hint1: "14 digits",
    label2: "VAT Number (optional)",
    entities: [
      { title: "SAS", copy: "Simplified joint-stock company" },
      { title: "SARL", copy: "Limited liability company" },
      { title: "SA", copy: "Corporation" },
      { title: "Auto-entrepreneur", copy: "Sole trader" },
      { title: "SCI", copy: "Civil property company" },
      { title: "Not Registered Yet", copy: "Idea stage" },
    ],
  },
  NL: {
    name: "Netherlands",
    registry: "KVK - Kamer van Koophandel",
    pill: "KVK",
    label1: "KVK Number",
    hint1: "8 digits, e.g. 12345678",
    label2: "VAT Number (optional)",
    entities: [
      { title: "BV", copy: "Private limited company" },
      { title: "NV", copy: "Public company" },
      { title: "VOF", copy: "Partnership" },
      { title: "Eenmanszaak", copy: "Sole proprietorship" },
      { title: "Stichting", copy: "Foundation" },
      { title: "Not Registered Yet", copy: "Idea stage" },
    ],
  },
  SE: {
    name: "Sweden",
    registry: "Bolagsverket",
    pill: "Org. Number",
    label1: "Organisationsnummer",
    hint1: "10 digits",
    label2: "VAT Number (optional)",
    entities: [
      { title: "AB", copy: "Private limited company" },
      { title: "HB", copy: "Partnership" },
      { title: "KB", copy: "Limited partnership" },
      { title: "Enskild firma", copy: "Sole trader" },
      { title: "EK", copy: "Cooperative" },
      { title: "Not Registered Yet", copy: "Idea stage" },
    ],
  },
  IL: {
    name: "Israel",
    registry: "Companies Registrar",
    pill: "Company No.",
    label1: "Company Registration Number",
    hint1: "9 digits, e.g. 512345678",
    label2: "VAT No. (optional)",
    entities: [
      { title: "Ltd", copy: "Private limited company" },
      { title: "PLC", copy: "Public company" },
      { title: "Partnership", copy: "Shutafut" },
      { title: "Sole Proprietor", copy: "Individual business" },
      { title: "Non-Profit (Amuta)", copy: "NGO / association" },
      { title: "Not Registered Yet", copy: "Idea stage" },
    ],
  },
  NG: {
    name: "Nigeria",
    registry: "CAC - Corporate Affairs Commission",
    pill: "RC No.",
    label1: "CAC Registration Number",
    hint1: "e.g. RC 1234567",
    label2: "TIN (optional)",
    entities: [
      { title: "Limited by Shares (Ltd)", copy: "Standard company" },
      { title: "Business Name", copy: "Sole proprietor or partnership" },
      { title: "Incorporated Trustee", copy: "NGO / foundation" },
      { title: "Limited Partnership (LP)", copy: "LP structure" },
      { title: "LLP", copy: "Limited Liability Partnership" },
      { title: "Not Registered Yet", copy: "Idea stage" },
    ],
  },
  KE: {
    name: "Kenya",
    registry: "Business Registration Service",
    pill: "BRS No.",
    label1: "Company Registration Number",
    hint1: "e.g. PVT-XXXXXXXX",
    label2: "KRA PIN (optional)",
    entities: [
      { title: "Private Company (Ltd)", copy: "Standard structure" },
      { title: "Sole Proprietor", copy: "Individual" },
      { title: "Partnership", copy: "Business partnership" },
      { title: "LLP", copy: "Limited Liability Partnership" },
      { title: "Public Company (PLC)", copy: "Public listing" },
      { title: "Not Registered Yet", copy: "Idea stage" },
    ],
  },
  ZA: {
    name: "South Africa",
    registry: "CIPC - Companies & Intellectual Property Commission",
    pill: "CIPC No.",
    label1: "Company Registration Number",
    hint1: "e.g. 2020/123456/07",
    label2: "VAT Number (optional)",
    entities: [
      { title: "(Pty) Ltd", copy: "Proprietary Limited" },
      { title: "SOC Ltd", copy: "State Owned Company" },
      { title: "NPO", copy: "Non-profit organisation" },
      { title: "Sole Proprietor", copy: "Individual" },
      { title: "Partnership", copy: "General partnership" },
      { title: "Not Registered Yet", copy: "Idea stage" },
    ],
  },
  ID: {
    name: "Indonesia",
    registry: "Ministry of Law & Human Rights",
    pill: "NIB",
    label1: "NIB - Nomor Induk Berusaha",
    hint1: "13 digits issued by OSS system",
    label2: "NPWP - Tax Number (optional)",
    entities: [
      { title: "PT", copy: "Standard company" },
      { title: "PT PMA", copy: "Foreign-owned company" },
      { title: "CV", copy: "Partnership" },
      { title: "Firma", copy: "General partnership" },
      { title: "Usaha Perseorangan", copy: "Individual business" },
      { title: "Not Registered Yet", copy: "Idea stage" },
    ],
  },
  MY: {
    name: "Malaysia",
    registry: "SSM - Suruhanjaya Syarikat Malaysia",
    pill: "ROC No.",
    label1: "SSM Registration Number",
    hint1: "e.g. 123456-X",
    label2: "Tax Identification Number (optional)",
    entities: [
      { title: "Sdn Bhd", copy: "Private limited company" },
      { title: "Bhd", copy: "Public limited company" },
      { title: "LLP (PLT)", copy: "Limited liability partnership" },
      { title: "Enterprise", copy: "Sole proprietorship" },
      { title: "Partnership", copy: "Perkongsian" },
      { title: "Not Registered Yet", copy: "Idea stage" },
    ],
  },
  JP: {
    name: "Japan",
    registry: "Ministry of Justice - National Tax Agency",
    pill: "Corporate No.",
    label1: "Corporate Number",
    hint1: "13 digits issued by NTA",
    label2: "",
    entities: [
      { title: "Kabushiki Kaisha (KK)", copy: "Stock company" },
      { title: "Godo Kaisha (GK)", copy: "LLC equivalent" },
      { title: "Goshi Kaisha", copy: "Limited partnership" },
      { title: "Sole Proprietor", copy: "Individual business" },
      { title: "NPO", copy: "Non-profit" },
      { title: "Not Registered Yet", copy: "Idea stage" },
    ],
  },
  KR: {
    name: "South Korea",
    registry: "Supreme Court Registry",
    pill: "BRN",
    label1: "Business Registration Number",
    hint1: "10 digits, XXX-XX-XXXXX",
    label2: "Corporate Registration No. (optional)",
    entities: [
      { title: "Jusik Hoesa (Co., Ltd)", copy: "Stock company" },
      { title: "Yuhan Hoesa", copy: "LLC equivalent" },
      { title: "Hapja Hoesa", copy: "Limited partnership" },
      { title: "Sole Proprietor", copy: "Individual business" },
      { title: "Cooperative", copy: "Cooperative" },
      { title: "Not Registered Yet", copy: "Idea stage" },
    ],
  },
  CN: {
    name: "China",
    registry: "SAMR - State Administration for Market Regulation",
    pill: "USCC",
    label1: "Unified Social Credit Code",
    hint1: "18 characters alphanumeric",
    label2: "",
    entities: [
      { title: "WFOE", copy: "Wholly Foreign-Owned Enterprise" },
      { title: "Joint Venture (JV)", copy: "Joint venture" },
      { title: "Ltd. Co.", copy: "Standard domestic company" },
      { title: "Sole Proprietor", copy: "Individual business" },
      { title: "Partnership", copy: "General or limited partnership" },
      { title: "Not Registered Yet", copy: "Idea stage" },
    ],
  },
  TR: {
    name: "Turkey",
    registry: "MERSIS - Central Registration System",
    pill: "VKN / MERSIS",
    label1: "Tax Identification Number (VKN)",
    hint1: "10 digits issued by tax authority",
    label2: "MERSIS Number (optional)",
    entities: [
      { title: "Anonim Sirket (AS)", copy: "Joint-stock company" },
      { title: "Limited Sirket", copy: "Limited liability company" },
      { title: "Sahis Sirketi", copy: "Sole proprietorship" },
      { title: "Adi Ortaklik", copy: "General partnership" },
      { title: "Komandit Sirket", copy: "Limited partnership" },
      { title: "Not Registered Yet", copy: "Idea stage" },
    ],
  },
  PK: {
    name: "Pakistan",
    registry: "SECP - Securities & Exchange Commission of Pakistan",
    pill: "CUIN",
    label1: "CUIN - Corporate Universal Identification Number",
    hint1: "7 digits, e.g. 0012345",
    label2: "NTN - National Tax Number (optional)",
    entities: [
      { title: "Private Limited (Pvt Ltd)", copy: "Most common structure" },
      { title: "SMC-Private", copy: "Single member company" },
      { title: "Public Limited", copy: "Listed or unlisted public company" },
      { title: "Partnership", copy: "Registered firm" },
      { title: "Sole Proprietor", copy: "Individual" },
      { title: "Not Registered Yet", copy: "Idea stage" },
    ],
  },
  BD: {
    name: "Bangladesh",
    registry: "RJSC - Registrar of Joint Stock Companies",
    pill: "RJSC No.",
    label1: "Company Registration Number",
    hint1: "e.g. C-12345/2020",
    label2: "BIN / TIN (optional)",
    entities: [
      { title: "Private Limited (Ltd)", copy: "Standard company" },
      { title: "Public Limited", copy: "Public company" },
      { title: "One Person Company (OPC)", copy: "Single owner" },
      { title: "Partnership", copy: "Registered partnership" },
      { title: "Sole Proprietor", copy: "Individual" },
      { title: "Not Registered Yet", copy: "Idea stage" },
    ],
  },
  MX: {
    name: "Mexico",
    registry: "Registro Publico de Comercio",
    pill: "RFC",
    label1: "RFC - Registro Federal de Contribuyentes",
    hint1: "12-13 characters alphanumeric",
    label2: "",
    entities: [
      { title: "S.A. de C.V.", copy: "Corporation" },
      { title: "S. de R.L. de C.V.", copy: "Limited liability company" },
      { title: "SAPI de C.V.", copy: "Startup-friendly structure" },
      { title: "Persona Fisica", copy: "Individual / sole trader" },
      { title: "S.C.", copy: "Civil society" },
      { title: "Not Registered Yet", copy: "Idea stage" },
    ],
  },
  OTHER: {
    name: "Other Country",
    registry: "National business registry",
    pill: "Custom ID",
    label1: "Company Registration Number (if available)",
    hint1: "As shown on your official registration document",
    label2: "Tax ID (optional)",
    entities: [
      { title: "Corporation / Ltd.", copy: "Standard company structure" },
      { title: "LLC / LLP", copy: "Limited liability entity" },
      { title: "Sole Proprietor", copy: "Individual business" },
      { title: "Partnership", copy: "Business partnership" },
      { title: "Startup / Tech Entity", copy: "Special purpose vehicle" },
      { title: "Not Registered Yet", copy: "Idea / pre-reg stage" },
    ],
  },
};

const FALLBACK_COUNTRY_DATA = {
  name: "Selected Country",
  registry: "National business registry",
  pill: "Registration ID",
  label1: "Registration Number",
  hint1: "Enter the official business registration number if available",
  label2: "Tax ID (optional)",
  entities: [
    { title: "Corporation / Ltd.", copy: "Standard company structure" },
    { title: "LLC / LLP", copy: "Limited liability entity" },
    { title: "Sole Proprietor", copy: "Individual business" },
    { title: "Partnership", copy: "Business partnership" },
    { title: "Startup / Tech Entity", copy: "Special purpose vehicle" },
    { title: "Not Registered Yet", copy: "Idea / pre-reg stage" },
  ],
};

const createFounder = () => ({ name: "", email: "", mobile: "", role: "", linkedin: "", photo: null });

const getCountryVerificationConfig = (countryCode) => {
  if (!countryCode) return null;
  return COUNTRY_VERIFICATION_DATA[countryCode] || FALLBACK_COUNTRY_DATA;
};

export default function StartupRegistration() {
  useTheme();
  const isDark = false;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'quick';
  const isQuickMode = mode === 'quick';
  const isCompleteMode = mode === 'complete';
  const { completeRegistration } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filePreviews, setFilePreviews] = useState({});

  // ── Quick Onboarding state (only used in ?mode=quick) ──────────────────────
  const [quickForm, setQuickForm] = useState({
    startupName: '',
    startupUsername: '',
    phone: '',
    startupLogo: null,
    pitchVideo: null,
    founders: [{ name: '', role: 'Founder' }],
    pitchDeck: null,
    websiteUrl: '',
    city: '',
    state: '',
    stage: '',
    revenue: '',
  });
  const [quickFilePreviews, setQuickFilePreviews] = useState({});

  // ── Complete Registration state (only used in ?mode=complete) ──────────────
  const [existingStartupId, setExistingStartupId] = useState(null);

  const [formData, setFormData] = useState({
    founders: [createFounder()],
    startupName: "",
    startupUsername: "",
    phone: "",
    startupLogo: null,
    companyEmail: "",
    country: "India",
    industries: [],
    stage: "",
    countryOfIncorporation: "",
    legalEntityType: "",
    registrationIdPrimary: "",
    registrationIdSecondary: "",
    manualRegistrationId: "",
    incorporationCertificate: null,
    manualRegistrationDocument: null,
    shortDescription: "",
    pitchVideo: null,
    pitchDeck: null,
    amountRaising: "",
    equityGiving: "",
    preMoneyValuation: "",
    hashtags: "",
    websiteUrl: "",
    linkedin: "",
    instagram: "",
    youtube: "",
    playStore: "",
    productDemo: "",
    brochure: null,
  });

  const inputCls = "reg-input";
  const TOTAL_STEPS = 3;
  const countryConfig = getCountryVerificationConfig(formData.countryOfIncorporation);
  const isManualCountry = formData.countryOfIncorporation === "OTHER";
  const requiresRegistrationProof =
    !!formData.countryOfIncorporation && formData.legalEntityType && formData.legalEntityType !== "Not Registered Yet";

  // ── On mount: guard against duplicate startup (quick) or pre-fill (complete) ──
  useEffect(() => {
    if (!isQuickMode && !isCompleteMode) return;
    getMyStartup().then(res => {
      const s = res?.data?.data || res?.data;
      if (!s?.id) return;

      if (isQuickMode) {
        // Startup already exists — skip quick onboarding, go straight to complete registration
        navigate('/register/startup?mode=complete', { replace: true });
        return;
      }

      // Complete mode: pre-fill form from existing startup data
      setExistingStartupId(s.id);
      setFormData(prev => ({
        ...prev,
        startupName: s.name || '',
        startupUsername: s.username || '',
        phone: s.phone || s.mobile || '',
        companyEmail: s.companyEmail || '',
        industries: s.industries || [],
        stage: s.stage || '',
        city: s.location?.city || '',
        state: s.location?.state || '',
        revenue: s.revenue !== null && s.revenue !== undefined ? s.revenue.toString() : '',
        countryOfIncorporation: s.verification?.countryCode || '',
        legalEntityType: s.verification?.entityType || '',
        registrationIdPrimary: s.verification?.value || '',
        registrationIdSecondary: s.verification?.secondaryValue || '',
        shortDescription: s.description || s.shortDescription || '',
        pitchVideo: s.pitchVideoUrl || null,
        pitchDeck: s.pitchDeckUrl || null,
        hashtags: typeof s.hashtags === 'string' ? s.hashtags : (s.hashtags || []).join(' '),
        websiteUrl: s.website || s.socialLinks?.website || '',
        linkedin: s.socialLinks?.linkedin || '',
        instagram: s.socialLinks?.instagram || '',
        youtube: s.socialLinks?.youtube || '',
        playStore: s.socialLinks?.playStore || '',
        productDemo: s.socialLinks?.productDemo || '',
        amountRaising: s.raisingAmount?.toString() || '',
        equityGiving: s.equityPercentage?.toString() || '',
        preMoneyValuation: s.preMoneyValuation?.toString() || '',
        founders: s.founders?.length > 0
          ? s.founders.map(f => ({ name: f.name || '', email: f.email || '', mobile: f.mobile || '', role: f.role || '', linkedin: f.linkedin || '', photo: null }))
          : [createFounder()],
      }));
      // Show existing media in file previews
      if (s.pitchVideoUrl) setFilePreviews(p => ({ ...p, pitchVideo: { type: 'video', url: s.pitchVideoUrl } }));
      if (s.logoUrl)       setFilePreviews(p => ({ ...p, startupLogo: { type: 'image', url: s.logoUrl } }));
      if (s.pitchDeckUrl)  setFilePreviews(p => ({ ...p, pitchDeck: { type: 'file', name: 'Existing pitch deck' } }));
    }).catch(() => {}); // non-fatal: if no startup exists or network error, continue normally
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleFounderChange = (index, field, value) => {
    setFormData((prev) => {
      const founders = [...prev.founders];
      founders[index] = { ...founders[index], [field]: value };
      return { ...prev, founders };
    });
  };

  const addFounder = () => {
    setFormData((prev) => ({ ...prev, founders: [...prev.founders, createFounder()] }));
  };

  const removeFounder = (index) => {
    setFormData((prev) => ({
      ...prev,
      founders: prev.founders.filter((_, founderIndex) => founderIndex !== index),
    }));
  };

  const handleCountryChange = (countryCode) => {
    setError("");
    setFormData((prev) => ({
      ...prev,
      countryOfIncorporation: countryCode,
      legalEntityType: "",
      registrationIdPrimary: "",
      registrationIdSecondary: "",
      manualRegistrationId: "",
      incorporationCertificate: null,
      manualRegistrationDocument: null,
    }));
    setFilePreviews((prev) => {
      const next = { ...prev };
      delete next.incorporationCertificate;
      delete next.manualRegistrationDocument;
      return next;
    });
  };

  const handleFileUpload = (field, file) => {
    if (!file) return;
    if (field === "pitchVideo" && file.size > 50 * 1024 * 1024) {
      setError("Video size must be under 50 MB.");
      return;
    }
    if (
      (field === "incorporationCertificate" || field === "manualRegistrationDocument") &&
      file.size > 5 * 1024 * 1024
    ) {
      setError("Verification documents must be under 5 MB.");
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: file }));

    if (file.type.startsWith("image/")) {
      setFilePreviews((prev) => ({ ...prev, [field]: { type: "image", url: URL.createObjectURL(file) } }));
      return;
    }
    if (file.type.startsWith("video/")) {
      setFilePreviews((prev) => ({ ...prev, [field]: { type: "video", url: URL.createObjectURL(file) } }));
      return;
    }

    setFilePreviews((prev) => ({ ...prev, [field]: { type: "file", name: file.name } }));
  };

  const validateStep = () => {
    setError("");

    switch (currentStep) {
      case 1: {
        for (let i = 0; i < formData.founders.length; i += 1) {
          const founder = formData.founders[i];
          if (!founder.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(founder.email)) {
            setError(`Founder ${i + 1}: A valid email is required.`);
            return false;
          }
          if (!founder.role) {
            setError(`Founder ${i + 1}: Please select a role.`);
            return false;
          }
        }
        if (!formData.companyEmail.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(formData.companyEmail)) {
          setError("A valid company email is required.");
          return false;
        }
        return true;
      }
      case 2: {
        if (formData.industries.length === 0) {
          setError("Please select at least one industry.");
          return false;
        }
        if (!formData.countryOfIncorporation) {
          setError("Please select the country of incorporation.");
          return false;
        }
        if (!formData.legalEntityType) {
          setError("Please select the legal entity type.");
          return false;
        }

        if (isManualCountry) {
          if (requiresRegistrationProof && !formData.manualRegistrationDocument) {
            setError("Please upload the official registration document for this country.");
            return false;
          }
          return true;
        }

        if (requiresRegistrationProof) {
          if (!formData.registrationIdPrimary.trim()) {
            setError("Please enter the primary registration number.");
            return false;
          }
          if (!formData.incorporationCertificate) {
            setError("Please upload the certificate of incorporation.");
            return false;
          }
        }

        return true;
      }
      case 3: {
        if (!formData.shortDescription.trim() || formData.shortDescription.trim().length < 20) {
          setError("Please enter a short description of at least 20 characters.");
          return false;
        }
        return true;
      }
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep() && currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const uploadToStorage = async (file, path) => {
    if (!file) return null;
    // If the value is already a URL string (pre-filled from existing startup), skip re-upload
    if (typeof file === 'string') return file;
    try {
      return await storageService.uploadFile(file, "evoa-media", `startups/${Date.now()}_${path}_${file.name}`);
    } catch {
      return await storageService.uploadFile(file, "public", `startups/${Date.now()}_${path}_${file.name}`);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    try {
      setLoading(true);
      setError("");

      const [
        logoUrl,
        pitchVideoUrl,
        pitchDeckUrl,
        brochureUrl,
        incorporationCertificateUrl,
        manualRegistrationDocumentUrl,
      ] = await Promise.all([
        uploadToStorage(formData.startupLogo, "logo"),
        uploadToStorage(formData.pitchVideo, "pitch_video"),
        uploadToStorage(formData.pitchDeck, "pitch_deck"),
        uploadToStorage(formData.brochure, "brochure"),
        uploadToStorage(formData.incorporationCertificate, "incorporation_certificate"),
        uploadToStorage(formData.manualRegistrationDocument, "manual_registration_document"),
      ]);

      const foundersWithPhotos = await Promise.all(
        formData.founders.map(async (founder, index) => ({
          ...founder,
          photoUrl: await uploadToStorage(founder.photo, `founder_${index}`),
        }))
      );

      const selectedCountry = countryConfig || getCountryVerificationConfig(formData.countryOfIncorporation);
      const verification = {
        countryCode: formData.countryOfIncorporation || null,
        countryName: selectedCountry?.name || null,
        registry: selectedCountry?.registry || null,
        idLabel: isManualCountry ? "Country Registration ID" : selectedCountry?.label1 || "Registration Number",
        secondaryIdLabel: isManualCountry ? "Tax ID" : selectedCountry?.label2 || null,
        entityType: formData.legalEntityType || null,
        type: isManualCountry ? "Manual Country Verification" : selectedCountry?.pill || "Registration ID",
        value: isManualCountry
          ? formData.manualRegistrationId.trim()
          : formData.registrationIdPrimary.trim(),
        secondaryValue: isManualCountry
          ? ""
          : formData.registrationIdSecondary.trim(),
        documentUrl: isManualCountry ? manualRegistrationDocumentUrl : incorporationCertificateUrl,
        registrationStatus: formData.legalEntityType === "Not Registered Yet" ? "unregistered" : "registered",
      };

      const payload = {
        name: formData.startupName,
        username: formData.startupUsername,
        phone: formData.phone ? formData.phone.trim() : undefined,
        mobile: formData.phone ? formData.phone.trim() : undefined,
        companyEmail: formData.companyEmail,
        website: formData.websiteUrl,
        stage: formData.stage,
        revenue: formData.revenue ? Number(formData.revenue) : undefined,
        industries: formData.industries,
        location: {
          city: formData.city || undefined,
          state: formData.state || undefined,
          country: formData.country || 'India',
        },
        founders: foundersWithPhotos.map((founder) => ({
          name: founder.name,
          email: founder.email,
          mobile: founder.mobile,
          role: founder.role,
          linkedin: founder.linkedin,
          photoUrl: founder.photoUrl,
        })),
        verification,
        logoUrl,
        pitchVideoUrl,
        pitchDeckUrl,
        description: formData.shortDescription,
        shortDescription: formData.shortDescription,
        socialLinks: {
          linkedin: formData.linkedin,
          instagram: formData.instagram,
          youtube: formData.youtube,
          playStore: formData.playStore,
          productDemo: formData.productDemo,
          website: formData.websiteUrl,
          brochure: brochureUrl,
        },
        brochureUrl,
        raisingAmount: Number(formData.amountRaising) || 0,
        equityPercentage: Number(formData.equityGiving) || 0,
        preMoneyValuation: Number(formData.preMoneyValuation) || 0,
        hashtags: formData.hashtags,
        teamMembers: [],
      };

      // Use updateStartup if completing an existing profile, createStartup for new profiles
      if (isCompleteMode && existingStartupId) {
        await updateStartup(existingStartupId, payload);
      } else {
        await startupsService.createStartup(payload);
      }

      if (logoUrl) {
        await updateUserProfile({ avatarUrl: logoUrl }).catch(() => {});
      }

      await completeRegistration();
      navigate(isCompleteMode ? "/startup/profile" : "/startup");
    } catch (err) {
      console.error("Registration failed:", err);
      setError(err.response?.data?.message || err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const FileUploadBox = ({ field, label, accept, previewHeight = "h-28", helperText = "" }) => (
    <label className="block text-sm text-slate-500">
      {label}
      <input
        type="file"
        accept={accept}
        onChange={(e) => handleFileUpload(field, e.target.files[0])}
        className="hidden"
      />
      <div
        className="mt-2 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl cursor-pointer overflow-hidden transition-all"
      >
        {filePreviews[field]?.type === "image" && (
          <img src={filePreviews[field].url} alt="preview" className={`w-full ${previewHeight} object-cover`} />
        )}
        {filePreviews[field]?.type === "video" && (
          <video src={filePreviews[field].url} controls className="w-full max-h-40 object-cover" />
        )}
        {filePreviews[field]?.type === "file" && (
          <div className="p-3 flex items-center gap-2 bg-slate-50">
            <span className="text-xl">PDF</span>
            <span className="text-xs truncate flex-1 text-slate-600">
              {filePreviews[field].name}
            </span>
            <span className="text-blue-600 text-xs">OK</span>
          </div>
        )}
        {!filePreviews[field] && (
          <div className="p-4 text-center text-slate-400">
            <FiUpload className="mx-auto mb-2" size={22} />
            <span className="text-xs">Click to upload</span>
            {helperText ? <div className="mt-2 text-[11px] text-slate-400">{helperText}</div> : null}
          </div>
        )}
      </div>
    </label>
  );


  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
              1. Founder(s) &amp; Startup Basics
            </h2>

            <div className="space-y-3">
              {formData.founders.map((founder, index) => (
                <div
                  key={index}
                  className="p-3 sm:p-4 rounded-xl border bg-slate-50 border-slate-200"
                >
            <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-slate-700">Founder {index + 1}{founder.name ? `: ${founder.name}` : ''}</span>
                    {formData.founders.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFounder(index)}
                      className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        <FiX size={16} />
                      </button>
                    )}
                  </div>
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="email"
                        placeholder="Founder Email *"
                        value={founder.email}
                        onChange={(e) => handleFounderChange(index, "email", e.target.value)}
                        className={inputCls}
                      />
                      <input
                        type="tel"
                        placeholder="Mobile Number"
                        value={founder.mobile}
                        onChange={(e) => handleFounderChange(index, "mobile", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <SearchableSelect
                      value={founder.role}
                      onChange={(value) => handleFounderChange(index, "role", value)}
                      options={FOUNDER_ROLES.map((role) => ({ value: role, label: role }))}
                      placeholder="Select Founder Role *"
                    />
                    <input
                      type="url"
                      placeholder="LinkedIn URL"
                      value={founder.linkedin}
                      onChange={(e) => handleFounderChange(index, "linkedin", e.target.value)}
                      className={inputCls}
                    />
                    <label className="block text-xs text-slate-400">
                      Founder Photo (Optional)
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          handleFounderChange(index, "photo", file);
                          setFilePreviews((prev) => ({
                            ...prev,
                            [`founder_${index}`]: { type: "image", url: URL.createObjectURL(file) },
                          }));
                        }}
                      />
                      <div
                        className="mt-1.5 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl cursor-pointer overflow-hidden transition-all"
                      >
                        {filePreviews[`founder_${index}`]?.type === "image" ? (
                          <img
                            src={filePreviews[`founder_${index}`].url}
                            alt="Founder"
                            className="w-full h-20 object-cover"
                          />
                        ) : (
                          <div className="p-3 text-center text-slate-400">
                            <FiUpload className="mx-auto mb-1" size={18} />
                            <span className="text-xs">Upload</span>
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
                className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors"
              >
                + Add Another Founder
              </button>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide mb-3 text-slate-400">
                Startup Details
              </p>
              <div className="space-y-2.5">
                <FileUploadBox field="startupLogo" label="Startup Logo" accept="image/*" previewHeight="h-24" />
                <input
                  type="email"
                  placeholder="Company Email *"
                  value={formData.companyEmail}
                  onChange={(e) => handleInputChange("companyEmail", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
              2. Industry &amp; Verification
            </h2>

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">
                Industry * (Multi-Select)
              </label>
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map((industry) => (
                  <button
                    key={industry}
                    type="button"
                    onClick={() => handleArrayChange("industries", industry)}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                      formData.industries.includes(industry)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600"
                    }`}
                  >
                    {industry}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide mb-3 text-slate-400">
                Business Verification
              </p>
              <div className="space-y-4">
                <SearchableSelect
                  value={formData.countryOfIncorporation}
                  onChange={handleCountryChange}
                  options={COUNTRY_OPTIONS}
                  placeholder="Country of Incorporation *"
                />

                {countryConfig && (
                  <>
                    <div className="space-y-3">
                      <label className="reg-label">Type of Legal Entity *</label>
                      <div className="reg-entity-grid">
                        {countryConfig.entities.map((entity) => (
                          <button
                            key={entity.title}
                            type="button"
                            onClick={() => handleInputChange("legalEntityType", entity.title)}
                            className={`reg-entity-card${formData.legalEntityType === entity.title ? " on" : ""}`}
                          >
                            <span className="reg-entity-title">{entity.title}</span>
                            <span className="reg-entity-copy">{entity.copy}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {isManualCountry ? (
                      <div className="reg-verify-box">
                        <div className="reg-verify-head">
                          <span className="reg-verify-title">Custom Country Verification</span>
                          <span className="reg-pill">Manual</span>
                        </div>
                        <p className="reg-helper">
                          Upload any official government-issued business registration document for manual review.
                        </p>
                        <div className="space-y-3 mt-4">
                          <div>
                            <label className="reg-label">Country Registration ID (If Available)</label>
                            <input
                              type="text"
                              value={formData.manualRegistrationId}
                              onChange={(e) => handleInputChange("manualRegistrationId", e.target.value)}
                              placeholder="As shown on your registration document"
                              className={inputCls}
                            />
                          </div>
                          {requiresRegistrationProof && (
                            <FileUploadBox
                              field="manualRegistrationDocument"
                              label="Official Registration Document *"
                              accept=".pdf,image/*"
                              helperText="PDF, JPG, PNG - Max 5 MB"
                            />
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="reg-verify-box">
                        <div className="reg-verify-head">
                          <span className="reg-verify-title">Official Registration ID</span>
                          <span className="reg-pill">{countryConfig.pill}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="reg-label">
                              {countryConfig.label1}
                              {requiresRegistrationProof ? " *" : ""}
                            </label>
                            <input
                              type="text"
                              value={formData.registrationIdPrimary}
                              onChange={(e) => handleInputChange("registrationIdPrimary", e.target.value)}
                              placeholder={`${countryConfig.pill} number`}
                              className={inputCls}
                            />
                            {countryConfig.hint1 ? <div className="reg-hint">{countryConfig.hint1}</div> : null}
                          </div>
                          {countryConfig.label2 ? (
                            <div>
                              <label className="reg-label">{countryConfig.label2}</label>
                              <input
                                type="text"
                                value={formData.registrationIdSecondary}
                                onChange={(e) => handleInputChange("registrationIdSecondary", e.target.value)}
                                placeholder="Enter number"
                                className={inputCls}
                              />
                            </div>
                          ) : null}
                        </div>

                        {requiresRegistrationProof ? (
                          <div className="mt-4">
                            <FileUploadBox
                              field="incorporationCertificate"
                              label="Certificate of Incorporation *"
                              accept=".pdf,image/*"
                              helperText="Accepted from any country - PDF, JPG, PNG - Max 5 MB"
                            />
                          </div>
                        ) : null}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
              3. Pitch &amp; Links
            </h2>
            <textarea
              placeholder="Short Description * (min. 20 chars)"
              value={formData.shortDescription}
              onChange={(e) => handleInputChange("shortDescription", e.target.value)}
              maxLength={250}
              rows={3}
              className={inputCls}
            />
            <FileUploadBox field="pitchVideo" label="Pitch Video (90 sec - 3 min)" accept="video/*" previewHeight="h-32" />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                placeholder="Raising (INR)"
                value={formData.amountRaising}
                onChange={(e) => handleInputChange("amountRaising", e.target.value)}
                className={inputCls}
              />
              <input
                type="number"
                placeholder="Equity (%)"
                value={formData.equityGiving}
                onChange={(e) => handleInputChange("equityGiving", e.target.value)}
                className={inputCls}
              />
              <input
                type="number"
                placeholder="Pre-Money Val"
                value={formData.preMoneyValuation}
                onChange={(e) => handleInputChange("preMoneyValuation", e.target.value)}
                className={inputCls}
              />
            </div>
            <input
              type="text"
              placeholder="Hashtags (#Fintech #AI)"
              value={formData.hashtags}
              onChange={(e) => handleInputChange("hashtags", e.target.value)}
              className={inputCls}
            />

            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide mb-3 text-slate-400">
                Links (Optional)
              </p>
              <div className="space-y-2.5">
                <input
                  type="url"
                  placeholder="LinkedIn Page"
                  value={formData.linkedin}
                  onChange={(e) => handleInputChange("linkedin", e.target.value)}
                  className={inputCls}
                />
                <input
                  type="url"
                  placeholder="Instagram"
                  value={formData.instagram}
                  onChange={(e) => handleInputChange("instagram", e.target.value)}
                  className={inputCls}
                />
                <input
                  type="url"
                  placeholder="YouTube"
                  value={formData.youtube}
                  onChange={(e) => handleInputChange("youtube", e.target.value)}
                  className={inputCls}
                />
                <input
                  type="url"
                  placeholder="Play Store / App Store"
                  value={formData.playStore}
                  onChange={(e) => handleInputChange("playStore", e.target.value)}
                  className={inputCls}
                />
                <input
                  type="url"
                  placeholder="Product Demo Link"
                  value={formData.productDemo}
                  onChange={(e) => handleInputChange("productDemo", e.target.value)}
                  className={inputCls}
                />
                <FileUploadBox field="brochure" label="Company Brochure PDF (Optional)" accept=".pdf" />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ── Quick Onboarding helper handlers ──────────────────────────────────────
  const handleQuickFounderChange = (index, field, value) => {
    setQuickForm(prev => {
      const founders = [...prev.founders];
      founders[index] = { ...founders[index], [field]: value };
      return { ...prev, founders };
    });
  };

  const addQuickFounder = () => {
    setQuickForm(prev => ({
      ...prev,
      founders: [...prev.founders, { name: '', role: 'Co-founder' }],
    }));
  };

  const removeQuickFounder = (index) => {
    setQuickForm(prev => ({
      ...prev,
      founders: prev.founders.filter((_, i) => i !== index),
    }));
  };

  const handleQuickFileUpload = (field, file) => {
    if (!file) return;
    if (field === 'pitchVideo' && file.size > 50 * 1024 * 1024) {
      setError('Video size must be under 50 MB.'); return;
    }
    if (field === 'startupLogo' && file.size > 5 * 1024 * 1024) {
      setError('Logo must be under 5 MB.'); return;
    }
    if (field === 'pitchDeck' && file.size > 20 * 1024 * 1024) {
      setError('Pitch Deck PDF size must be under 20 MB.'); return;
    }
    setError('');
    setQuickForm(prev => ({ ...prev, [field]: file }));
    if (file.type.startsWith('image/')) {
      setQuickFilePreviews(prev => ({ ...prev, [field]: { type: 'image', url: URL.createObjectURL(file) } }));
    } else if (file.type.startsWith('video/')) {
      setQuickFilePreviews(prev => ({ ...prev, [field]: { type: 'video', url: URL.createObjectURL(file) } }));
    } else {
      setQuickFilePreviews(prev => ({ ...prev, [field]: { type: 'file', name: file.name } }));
    }
  };

  // ── Quick Onboarding submit ────────────────────────────────────────────────
  const handleQuickSubmit = async () => {
    setError('');
    if (!quickForm.startupName.trim()) { setError('Startup name is required.'); return; }
    if (!quickForm.startupUsername.trim()) { setError('Startup username / @handle is required.'); return; }
    if (!quickForm.phone.trim()) { setError('Phone number is required.'); return; }

    const validFounders = (quickForm.founders || []).filter(f => f.name && f.name.trim());
    if (validFounders.length === 0) { setError('At least one founder/co-founder name is required.'); return; }

    try {
      setLoading(true);
      const [pitchVideoUrl, pitchDeckUrl] = await Promise.all([
        uploadToStorage(quickForm.pitchVideo, 'pitch_video'),
        uploadToStorage(quickForm.pitchDeck, 'pitch_deck'),
      ]);
      const payload = {
        name: quickForm.startupName.trim(),
        username: quickForm.startupUsername.trim().toLowerCase().replace(/\s+/g, ''),
        phone: quickForm.phone.trim(),
        mobile: quickForm.phone.trim(),
        website: quickForm.websiteUrl.trim() || undefined,
        stage: quickForm.stage || undefined,
        revenue: Number(quickForm.revenue) || undefined,
        location: (quickForm.city.trim() || quickForm.state)
          ? { city: quickForm.city.trim(), state: quickForm.state, country: 'India' }
          : undefined,
        founders: validFounders.map(f => ({ name: f.name.trim(), role: f.role || 'Founder' })),
        socialLinks: quickForm.websiteUrl.trim() ? { website: quickForm.websiteUrl.trim() } : undefined,
        pitchVideoUrl,
        pitchDeckUrl,
        teamMembers: [],
        hashtags: '',
      };
      await startupsService.createStartup(payload);
      await completeRegistration();
      navigate('/startup');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create startup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Quick Onboarding upload box helper ────────────────────────────────────
  const QuickUploadBox = ({ field, label, accept, icon: Icon, helperText }) => {
    const preview = quickFilePreviews[field];
    return (
      <label className="block">
        <span className="reg-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {Icon && <Icon size={13} />}{label}
        </span>
        <input type="file" accept={accept} className="hidden"
          onChange={e => handleQuickFileUpload(field, e.target.files[0])} />
        <div className={`reg-upload${preview ? ' filled' : ''}`} style={{ marginTop: 6 }}>
          {preview?.type === 'image' && <img src={preview.url} alt="preview" style={{ width: '100%', height: 72, objectFit: 'cover', borderRadius: 6 }} />}
          {preview?.type === 'video' && <video src={preview.url} style={{ width: '100%', maxHeight: 72, objectFit: 'cover', borderRadius: 6 }} />}
          {preview?.type === 'file' && (
            <div style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left' }}>
              <span style={{ fontSize: 18 }}>📄</span>
              <span style={{ fontSize: 12, color: '#334155', flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{preview.name}</span>
              <span style={{ fontSize: 11, color: '#1565C0', fontWeight: 600 }}>PDF OK</span>
            </div>
          )}
          {!preview && (
            <div style={{ padding: '16px 0' }}>
              <FiUpload style={{ margin: '0 auto 6px', display: 'block' }} size={20} />
              <div style={{ fontSize: 12 }}>Click to upload</div>
              {helperText && <div style={{ fontSize: 11, marginTop: 4, opacity: .8 }}>{helperText}</div>}
            </div>
          )}
          {preview && (
            <div style={{ fontSize: 11, color: '#1565C0', marginTop: 4 }}>
              ✓ {field === 'pitchVideo' ? 'Video selected' : field === 'pitchDeck' ? 'PDF selected' : 'Image selected'}
              <span style={{ color: '#94A3B8', marginLeft: 8 }}>Click to change</span>
            </div>
          )}
        </div>
      </label>
    );
  };

  // ── Quick Onboarding render ────────────────────────────────────────────────
  if (isQuickMode) {
    return (
      <div className="reg-root">
        <style>{REG_CSS}</style>
        <div className="reg-topbar">
          <div className="reg-brand">EVO<span>-A</span></div>
          <button className="reg-back" onClick={() => navigate('/choice-role')}>
            <FiArrowLeft size={12} /> Back
          </button>
        </div>
        <div className="reg-inner" style={{ maxWidth: 580 }}>
          <div className="reg-head">
            <div className="reg-step-label">Quick Start · Startup</div>
            <div className="reg-title">Launch Your Startup</div>
            <div className="reg-subtitle">
              Fill in your startup &amp; founder details to launch your profile on EVOA.
            </div>
          </div>

          {/* Single step card */}
          <div className="reg-card">
            <p className="reg-step-title">Startup Basics &amp; Founders</p>

            {/* Name */}
            <div style={{ marginBottom: 18 }}>
              <label className="reg-label">Startup Name <span style={{ color: '#E53E3E' }}>*</span></label>
              <input
                type="text"
                className="reg-input"
                placeholder="e.g. FinVerse Technologies"
                value={quickForm.startupName}
                onChange={e => setQuickForm(p => ({ ...p, startupName: e.target.value }))}
              />
            </div>

            {/* Username */}
            <div style={{ marginBottom: 18 }}>
              <label className="reg-label">Startup Username <span style={{ color: '#E53E3E' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: '#94A3B8', fontFamily: 'DM Mono, monospace', fontSize: 14, pointerEvents: 'none'
                }}>@</span>
                <input
                  type="text"
                  className="reg-input"
                  style={{ paddingLeft: 30 }}
                  placeholder="finverse"
                  value={quickForm.startupUsername}
                  onChange={e => setQuickForm(p => ({ ...p, startupUsername: e.target.value.replace(/\s+/g, '').toLowerCase() }))}
                />
              </div>
              <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 5 }}>This becomes your unique @handle on EVOA.</p>
            </div>

            {/* Phone Number */}
            <div style={{ marginBottom: 18 }}>
              <label className="reg-label">Phone Number <span style={{ color: '#E53E3E' }}>*</span></label>
              <input
                type="tel"
                className="reg-input"
                placeholder="e.g. +91 9876543210"
                value={quickForm.phone}
                onChange={e => setQuickForm(p => ({ ...p, phone: e.target.value }))}
              />
            </div>

            {/* Founder/Co-founder Name(s) */}
            <div style={{ marginBottom: 18, background: '#F8FAFC', padding: 16, borderRadius: 10, border: '1px solid #E2E8F0' }}>
              <label className="reg-label" style={{ marginBottom: 10 }}>Founder / Co-Founder Name(s) <span style={{ color: '#E53E3E' }}>*</span></label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {quickForm.founders.map((founder, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="text"
                      className="reg-input"
                      placeholder={`Founder ${idx + 1} Name *`}
                      value={founder.name}
                      onChange={e => handleQuickFounderChange(idx, 'name', e.target.value)}
                    />
                    {quickForm.founders.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuickFounder(idx)}
                        style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4 }}
                      >
                        <FiX size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addQuickFounder}
                  style={{
                    background: '#fff', border: '1px dashed #CBD5E1', padding: '8px 14px', borderRadius: 6,
                    color: '#1565C0', fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'center', marginTop: 4
                  }}
                >
                  + Add Co-Founder
                </button>
              </div>
            </div>

            {/* City & State */}
            <div style={{ marginBottom: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="reg-label">City</label>
                <input
                  type="text"
                  className="reg-input"
                  placeholder="e.g. Bengaluru"
                  value={quickForm.city}
                  onChange={e => setQuickForm(p => ({ ...p, city: e.target.value }))}
                />
              </div>
              <div>
                <label className="reg-label">State</label>
                <SearchableSelect
                  value={quickForm.state}
                  onChange={value => setQuickForm(p => ({ ...p, state: value }))}
                  options={STATES_LIST.map(s => ({ value: s, label: s }))}
                  placeholder="Select State"
                />
              </div>
            </div>

            {/* Stage & Revenue */}
            <div style={{ marginBottom: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="reg-label">Startup Stage</label>
                <SearchableSelect
                  value={quickForm.stage}
                  onChange={value => setQuickForm(p => ({ ...p, stage: value }))}
                  options={STAGES.map(s => ({ value: s, label: s }))}
                  placeholder="Select Stage"
                />
              </div>
              <div>
                <label className="reg-label">Annual Revenue (INR)</label>
                <input
                  type="number"
                  className="reg-input"
                  placeholder="e.g. 500000"
                  value={quickForm.revenue}
                  onChange={e => setQuickForm(p => ({ ...p, revenue: e.target.value }))}
                />
              </div>
            </div>

            {/* Website Link */}
            <div style={{ marginBottom: 18 }}>
              <label className="reg-label">Website Link</label>
              <input
                type="url"
                className="reg-input"
                placeholder="https://yourstartup.com"
                value={quickForm.websiteUrl}
                onChange={e => setQuickForm(p => ({ ...p, websiteUrl: e.target.value }))}
              />
            </div>

            {/* Pitch Video (optional) */}
            <div style={{ marginBottom: 18 }}>
              <QuickUploadBox
                field="pitchVideo"
                label={<>Pitch Video <span style={{ color: '#94A3B8', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional · strongly recommended)</span></>}
                accept="video/*"
                icon={FiVideo}
                helperText="MP4, MOV · Max 50 MB — investors watch this first!"
              />
            </div>

            {/* Pitch Deck Upload (optional) */}
            <div>
              <QuickUploadBox
                field="pitchDeck"
                label={<>Pitch Deck PDF <span style={{ color: '#94A3B8', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></>}
                accept=".pdf"
                icon={FiUpload}
                helperText="PDF · Max 20 MB"
              />
            </div>
          </div>

          {error && <div className="reg-error">{error}</div>}

          {/* Info strip */}
          <div style={{
            background: '#EEF5FF', border: '1px solid rgba(21,101,192,.15)', borderRadius: 10,
            padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 10
          }}>
            <span style={{ fontSize: 16 }}>💡</span>
            <p style={{ fontSize: 12, color: '#1565C0', lineHeight: 1.55, margin: 0 }}>
              You can complete your full verification and business credentials anytime from your profile to get the <strong>Verified</strong> badge.
            </p>
          </div>

          <div className="reg-nav" style={{ justifyContent: 'flex-end' }}>
            <button
              className="reg-btn-primary"
              onClick={handleQuickSubmit}
              disabled={loading}
              style={{ minWidth: 180 }}
            >
              {loading ? 'Creating profile…' : 'Enter the App →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Full / Complete Registration render (existing 3-step form) ─────────────
  return (
    <div className="reg-root">
      <style>{REG_CSS}</style>
      <div className="reg-topbar">
        <div className="reg-brand">EVO<span>-A</span></div>
        <button className="reg-back" onClick={() => navigate(isCompleteMode ? '/startup/profile' : '/choice-role')}>
          <FiArrowLeft size={12} /> Back
        </button>
      </div>
      <div className="reg-inner">
        <div className="reg-head">
          <div className="reg-step-label">
            Step {currentStep} / {TOTAL_STEPS} — {isCompleteMode ? 'Complete Registration' : 'Startup Registration'}
          </div>
          <div className="reg-title">
            {currentStep === 1 && "Founders & Basics"}
            {currentStep === 2 && "Industry & Verification"}
            {currentStep === 3 && "Pitch & Links"}
          </div>
          <div className="reg-subtitle">
            {isCompleteMode ? 'Fill in the remaining details to get your Verified badge' : 'Complete all required fields to continue'}
          </div>
        </div>
        <div className="reg-progress">
          {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
            <div
              key={index}
              className={`reg-dot${index + 1 === currentStep ? " active" : index + 1 < currentStep ? " done" : ""}`}
            />
          ))}
        </div>
        <div className="reg-card">{renderStep()}</div>
        {error ? <div className="reg-error">{error}</div> : null}
        <div className="reg-nav">
          <button className="reg-btn-ghost" onClick={prevStep} disabled={currentStep === 1}>
            Previous
          </button>
          {currentStep < TOTAL_STEPS ? (
            <button className="reg-btn-primary" onClick={nextStep}>
              Next
            </button>
          ) : (
            <button className="reg-btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Uploading…' : isCompleteMode ? 'Save & Complete' : 'Submit'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
