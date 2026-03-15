import { HiShieldCheck, HiCurrencyDollar, HiAcademicCap, HiCheckCircle } from 'react-icons/hi2';

export default function TrustDesignSection({ isVisible, isDark, setRef, SectionTitle, CardContainer }) {
  return (
    <section 
      ref={setRef('trustVerification')}
      className={`relative transition-all duration-1000 ease-out ${
        isVisible['trustDesign'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Header Section */}
      <div className="text-center mb-6 md:mb-12 px-4">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 sm:mb-6 backdrop-blur-xl border ${
          isDark 
            ? 'bg-[#B0FFFA]/5 border-[#B0FFFA]/20 text-[#B0FFFA]' 
            : 'bg-[#00B8A9]/5 border-[#00B8A9]/20 text-[#00B8A9]'
        }`}>
          <HiShieldCheck className="text-lg" />
          <span className="text-sm font-semibold tracking-wide">SECURITY & TRUST</span>
        </div>
        
        <SectionTitle>
          Trust-First Design
        </SectionTitle>
        
        <p className={`hidden sm:block text-lg md:text-xl max-w-4xl mx-auto mt-4 leading-relaxed ${
          isDark ? 'text-white/70' : 'text-gray-600'
        }`}>
          Build confidence with verified profiles and secure document verification across all user types
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Startup Verification Card */}
        <CardContainer>
          {/* Icon + Heading in one row */}
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-14 h-14 flex items-center justify-center rounded-xl ${
              isDark 
                ? 'bg-gradient-to-br from-[#B0FFFA]/20 to-[#80E5FF]/10' 
                : 'bg-gradient-to-br from-[#B0FFFA]/30 to-[#80E5FF]/20'
            }`}>
              <HiShieldCheck className={`text-3xl ${isDark ? 'text-[#B0FFFA]' : 'text-[#00B8A9]'}`} />
            </div>

            <h3 className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-black'
            }`}>
              Startup Verification
            </h3>
          </div>

          <p className={`text-base leading-relaxed mb-6 ${
            isDark ? 'text-white/70' : 'text-black/70'
          }`}>
            Multiple verification options including CIN, GST, Udyam registration, or founder identification documents.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <HiCheckCircle className={`shrink-0 mt-0.5 text-lg ${isDark ? 'text-[#B0FFFA]' : 'text-[#00B8A9]'}`} />
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>
                  Auto-Verify
                </p>
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                  CIN document upload for instant verification
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <HiCheckCircle className={`shrink-0 mt-0.5 text-lg ${isDark ? 'text-[#B0FFFA]' : 'text-[#00B8A9]'}`} />
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>
                  Manual Review
                </p>
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                  GST or Udyam registration verification
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <HiCheckCircle className={`shrink-0 mt-0.5 text-lg ${isDark ? 'text-[#B0FFFA]' : 'text-[#00B8A9]'}`} />
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>
                  Early Stage
                </p>
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                  Founder ID proof for unregistered startups
                </p>
              </div>
            </div>
          </div>
        </CardContainer>

        {/* Investor Verification Card */}
        <CardContainer>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-14 h-14 flex items-center justify-center rounded-xl ${
              isDark 
                ? 'bg-gradient-to-br from-[#B0FFFA]/20 to-[#80E5FF]/10' 
                : 'bg-gradient-to-br from-[#B0FFFA]/30 to-[#80E5FF]/20'
            }`}>
              <HiCurrencyDollar className={`text-3xl ${isDark ? 'text-[#B0FFFA]' : 'text-[#00B8A9]'}`} />
            </div>

            <h3 className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-black'
            }`}>
              Investor Verification
            </h3>
          </div>

          <p className={`text-base leading-relaxed mb-6 ${
            isDark ? 'text-white/70' : 'text-black/70'
          }`}>
            SEBI-registered investors get instant approval. Angel investors verified through LinkedIn, PAN, and ID documents.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <HiCheckCircle className={`shrink-0 mt-0.5 text-lg ${isDark ? 'text-[#B0FFFA]' : 'text-[#00B8A9]'}`} />
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>
                  SEBI Registered
                </p>
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                  Registration number + certificate upload
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <HiCheckCircle className={`shrink-0 mt-0.5 text-lg ${isDark ? 'text-[#B0FFFA]' : 'text-[#00B8A9]'}`} />
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>
                  Angel Investors
                </p>
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                  LinkedIn profile + PAN + ID verification
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <HiCheckCircle className={`shrink-0 mt-0.5 text-lg ${isDark ? 'text-[#B0FFFA]' : 'text-[#00B8A9]'}`} />
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>
                  Trust Badge
                </p>
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                  Community verified badge on profile
                </p>
              </div>
            </div>
          </div>
        </CardContainer>

        {/* Incubator Verification Card */}
        <CardContainer>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-14 h-14 flex items-center justify-center rounded-xl ${
              isDark 
                ? 'bg-gradient-to-br from-[#B0FFFA]/20 to-[#80E5FF]/10' 
                : 'bg-gradient-to-br from-[#B0FFFA]/30 to-[#80E5FF]/20'
            }`}>
              <HiAcademicCap className={`text-3xl ${isDark ? 'text-[#B0FFFA]' : 'text-[#00B8A9]'}`} />
            </div>

            <h3 className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-black'
            }`}>
              Incubator Verification
            </h3>
          </div>

          <p className={`text-base leading-relaxed mb-6 ${
            isDark ? 'text-white/70' : 'text-black/70'
          }`}>
            Comprehensive verification for government, university, corporate, and private incubators.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <HiCheckCircle className={`shrink-0 mt-0.5 text-lg ${isDark ? 'text-[#B0FFFA]' : 'text-[#00B8A9]'}`} />
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>
                  Government Body
                </p>
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                  Official registration documents
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <HiCheckCircle className={`shrink-0 mt-0.5 text-lg ${isDark ? 'text-[#B0FFFA]' : 'text-[#00B8A9]'}`} />
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>
                  Academic Institution
                </p>
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                  University affiliation certificate
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <HiCheckCircle className={`shrink-0 mt-0.5 text-lg ${isDark ? 'text-[#B0FFFA]' : 'text-[#00B8A9]'}`} />
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>
                  Private/Corporate
                </p>
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                  Legal incorporation certificate
                </p>
              </div>
            </div>
          </div>
        </CardContainer>
      </div>
    </section>
  );
}
