import { HiArrowDown } from 'react-icons/hi2';

// FAQ Data - Reduced to 4-5 most important questions
const faqData = [
  {
    question: 'Is EVO-A free?',
    answer: 'Yes, EVO-A provides free access for startups, investors, and viewers. Advanced features and premium services may be added in the future.'
  },
  {
    question: 'Is verification compulsory?',
    answer: 'Verification is strongly recommended for high trust and visibility. In some critical flows (investor offers, incubator matching), verification may be mandatory.'
  },
  {
    question: 'How long should the pitch video be?',
    answer: 'Minimum 90 seconds (1.5 minutes) and maximum 3 minutes. This maintains investor attention span and keeps the message clear.'
  },
  {
    question: 'Is SEBI registration required for investors?',
    answer: 'No. SEBI registered investors get an instant green badge. Non-SEBI angels can pass manual review with LinkedIn + PAN + ID proof.'
  },
  {
    question: 'Can I have multiple roles?',
    answer: 'Currently, an account starts with one primary role. Future updates may add multi-role support if you need multiple perspectives.'
  }
];

// FAQ Accordion Component
function FAQItem({ question, answer, isOpen, onToggle, isDark }) {
  return (
    <div className={`group relative rounded-xl sm:rounded-2xl transition-all duration-500 overflow-hidden ${
      isDark 
        ? `bg-gradient-to-br from-black/60 via-black/40 to-black/60 backdrop-blur-xl border border-[#B0FFFA]/20 ${isOpen ? 'border-[#B0FFFA]/40 shadow-[0_8px_32px_rgba(176,255,250,0.15)]' : 'hover:border-[#B0FFFA]/30'}` 
        : `bg-gradient-to-br from-white/90 via-white/80 to-white/90 backdrop-blur-xl border border-[#B0FFFA]/30 ${isOpen ? 'border-[#B0FFFA]/50 shadow-[0_8px_32px_rgba(0,184,169,0.12)]' : 'hover:border-[#B0FFFA]/40'}`
    }`}>
      {isOpen && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#B0FFFA]/5 via-transparent to-[#80E5FF]/5 rounded-xl sm:rounded-2xl"></div>
      )}
      <button
        onClick={onToggle}
        className={`relative z-10 w-full px-4 sm:px-5 md:px-6 py-3 sm:py-4 md:py-5 text-left flex items-center justify-between transition-all duration-300 rounded-xl sm:rounded-2xl ${
          isDark 
            ? `hover:bg-[#B0FFFA]/5 ${isOpen ? 'bg-[#B0FFFA]/10' : ''}` 
            : `hover:bg-[#B0FFFA]/5 ${isOpen ? 'bg-[#B0FFFA]/10' : ''}`
        }`}
      >
        <span className={`font-semibold text-xs sm:text-sm md:text-base lg:text-lg transition-all duration-300 pr-3 sm:pr-4 ${
          isDark 
            ? `text-white ${isOpen ? 'text-[#B0FFFA]' : ''}` 
            : `text-gray-900 ${isOpen ? 'text-[#00B8A9]' : ''}`
        }`}>
          {question}
        </span>
        <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-all duration-300 ${
          isDark 
            ? `bg-[#B0FFFA]/20 ${isOpen ? 'bg-[#B0FFFA]/30 rotate-180' : 'group-hover:bg-[#B0FFFA]/25'}`
            : `bg-[#B0FFFA]/20 ${isOpen ? 'bg-[#B0FFFA]/30 rotate-180' : 'group-hover:bg-[#B0FFFA]/25'}`
        }`}>
          <HiArrowDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          } ${isDark ? `text-[#B0FFFA]` : 'text-[#00B8A9]'}`} />
        </div>
      </button>
      {isOpen && (
        <div className={`relative z-10 px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 animate-slide-up ${
          isDark ? 'text-white/80' : 'text-gray-700'
        }`}>
          <p className="text-xs sm:text-sm md:text-base leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQSection({ isVisible, isDark, setRef, SectionTitle, openFAQ, toggleFAQ }) {
  return (
    <section 
      ref={setRef('faq')}
      className={`relative mt-4 sm:mt-12 md:mt-16 lg:mt-20 transition-all duration-1000 ease-out ${
        isVisible['faq'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12 px-4">
        <SectionTitle>Frequently Asked Questions</SectionTitle>
      </div>

      <div className="max-w-3xl mx-auto space-y-2 sm:space-y-3 md:space-y-4 px-2 sm:px-0">
        {faqData.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={openFAQ === index}
            onToggle={() => toggleFAQ(index)}
            isDark={isDark}
          />
        ))}
      </div>
    </section>
  );
}
