import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { HiUsers, HiChartBar } from "react-icons/hi2";
import { FaRocket, FaHandPaper, FaLightbulb, FaStar } from "react-icons/fa";
import Footer from "../../components/layout/footer";

export default function About() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const SectionTitle = ({ children }) => (
    <h2
      className={`text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-bold leading-snug mb-3 sm:mb-4 bg-gradient-to-r ${isDark
        ? "from-white via-[#B0FFFA] to-white bg-clip-text text-transparent"
        : "from-black via-[#00B8A9] to-black bg-clip-text text-transparent"
        }`}
    >
      {children}
    </h2>
  );

  const CardContainer = ({ children, className = "" }) => (
    <div
      className={`group relative p-4 sm:p-5 md:p-6 lg:p-7 rounded-xl sm:rounded-2xl transition-all duration-500 overflow-hidden ${isDark
        ? "bg-gradient-to-br from-black/60 via-black/40 to-black/60 backdrop-blur-xl border border-[#B0FFFA]/20 hover:border-[#B0FFFA]/40 hover:shadow-[0_12px_40px_rgba(176,255,250,0.15),0_0_0_1px_rgba(176,255,250,0.1)] hover:scale-[1.01] sm:hover:scale-[1.02] hover:-translate-y-1"
        : "bg-gradient-to-br from-white/90 via-white/80 to-white/90 backdrop-blur-xl border border-[#B0FFFA]/30 hover:border-[#B0FFFA]/50 hover:shadow-[0_12px_40px_rgba(0,184,169,0.12),0_0_0_1px_rgba(176,255,250,0.2)] hover:scale-[1.01] sm:hover:scale-[1.02] hover:-translate-y-1"
        } ${className}`}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[#B0FFFA]/5 via-transparent to-[#80E5FF]/5 rounded-xl sm:rounded-2xl"></div>
      <div className="relative z-10">{children}</div>
    </div>
  );

  const values = [
    {
      icon: FaRocket,
      title: "Innovation first",
      description:
        "Supporting bold, breakthrough ideas that can reshape industries and create lasting impact.",
    },
    {
      icon: HiUsers,
      title: "Community driven",
      description:
        "Building an ecosystem where startups, investors, and mentors grow and succeed together.",
    },
    {
      icon: HiChartBar,
      title: "Data‑driven",
      description:
        "Using insights and analytics to guide smarter investment and growth decisions.",
    },
    {
      icon: FaHandPaper,
      title: "Transparency",
      description:
        "Prioritizing openness, trust, and honest communication with all stakeholders.",
    },
  ];

  const milestones = [
    {
      year: "2020",
      title: "Founded",
      description:
        "EVO‑A launched with a vision to transform how startups connect with capital.",
    },
    {
      year: "2021",
      title: "First 100 startups",
      description: "Reached a community of 100 registered startups across India.",
    },
    {
      year: "2022",
      title: "₹100Cr+ raised",
      description: "Startups on the platform collectively crossed ₹100 crores in funding.",
    },
    {
      year: "2023",
      title: "500+ investors",
      description: "Grew to a network of more than 500 active investors.",
    },
    {
      year: "2024",
      title: "Market leader",
      description:
        "Recognized as a leading platform for startup–investor connections in India.",
    },
  ];

  const team = [
    { name: "Aditya Narayan Singh", role: "CEO & Co-Founder", image: "https://i.pravatar.cc/150?img=13" },
    { name: "Abhishek Kumar", role: "CTO & Co-Founder", image: "https://i.pravatar.cc/150?img=11" },
    { name: "Divyanshu Singh", role: "Full Stack Developer", image: "https://i.pravatar.cc/150?img=12" },
    { name: "Enub Uzair", role: "Data Analyst", image: "https://i.pravatar.cc/150?img=10" },
    { name: "Harshil Awasthi", role: "RAG Developer", image: "https://i.pravatar.cc/150?img=12" },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-black" : "bg-white"
        }`}
    >
      <section
        className="py-8 sm:py-10 md:py-12"
        aria-labelledby="about-heading"
      >
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 text-center">
          <header className="mb-8 sm:mb-10 md:mb-12">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 backdrop-blur-xl border ${isDark
                ? "bg-[#B0FFFA]/5 border-[#B0FFFA]/20 text-[#B0FFFA]"
                : "bg-[#00B8A9]/5 border-[#00B8A9]/20 text-[#00B8A9]"
                }`}
            >
              <span className="text-xs font-bold tracking-wider uppercase">
                About EVO‑A
              </span>
            </div>
            <SectionTitle>Building the future of startup funding</SectionTitle>
            <p
              className={`text-sm sm:text-base md:text-lg max-w-3xl mx-auto mt-3 ${isDark ? "text-white/70" : "text-gray-600"
                }`}
            >
              EVO‑A connects ambitious founders with visionary investors, creating a
              trusted platform for funding, mentorship, and long‑term growth in the
              startup ecosystem.
            </p>
          </header>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 pb-8 sm:pb-12 md:pb-16 lg:pb-20 space-y-10 sm:space-y-14 md:space-y-16">
          {/* Mission & Vision */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 items-start">
            <CardContainer className="text-left">
              <h3
                className={`text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 ${isDark ? "text-white" : "text-gray-900"
                  }`}
              >
                Our mission
              </h3>
              <p
                className={`text-sm sm:text-base md:text-lg mb-3 sm:mb-4 leading-relaxed ${isDark ? "text-white/80" : "text-gray-700"
                  }`}
              >
                EVO‑A exists to democratize access to startup funding for entrepreneurs
                across India, ensuring that promising ideas are not limited by geography or
                traditional networks.
              </p>
              <p
                className={`text-sm sm:text-base md:text-lg leading-relaxed ${isDark ? "text-white/80" : "text-gray-700"
                  }`}
              >
                By combining technology, data, and human expertise, the platform enables
                startups and investors to discover the right opportunities faster, with
                greater confidence and transparency.
              </p>
            </CardContainer>

            <CardContainer className="flex flex-col items-center text-center">
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center mb-3 sm:mb-4 rounded-full ${isDark ? "bg-[#B0FFFA]/10" : "bg-[#00B8A9]/10"
                  }`}
              >
                <FaLightbulb
                  size={32}
                  className={isDark ? "text-[#B0FFFA]" : "text-[#00B8A9]"}
                  aria-hidden="true"
                />
              </div>
              <h3
                className={`text-lg sm:text-xl md:text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"
                  }`}
              >
                Vision 2030
              </h3>
              <p
                className={`text-sm sm:text-base md:text-lg ${isDark ? "text-white/70" : "text-gray-600"
                  }`}
              >
                To be India’s most trusted startup–investor platform, enabling ₹10,000+
                crores in funding and empowering thousands of founders by 2030.
              </p>
            </CardContainer>
          </section>

          {/* Values */}
          <section aria-labelledby="values-heading">
            <div className="text-center mb-5 sm:mb-7 md:mb-8">
              <SectionTitle>Our core values</SectionTitle>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {values.map((value, idx) => {
                const IconComponent = value.icon;
                return (
                  <CardContainer key={idx} className="text-center h-full">
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-3 sm:mb-4 rounded-full ${isDark ? "bg-[#B0FFFA]/10" : "bg-[#00B8A9]/10"
                        }`}
                    >
                      <IconComponent
                        size={28}
                        className={isDark ? "text-[#B0FFFA]" : "text-[#00B8A9]"}
                        aria-hidden="true"
                      />
                    </div>
                    <h3
                      className={`text-base sm:text-lg md:text-xl font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"
                        }`}
                    >
                      {value.title}
                    </h3>
                    <p
                      className={`text-xs sm:text-sm md:text-base ${isDark ? "text-white/70" : "text-gray-600"
                        }`}
                    >
                      {value.description}
                    </p>
                  </CardContainer>
                );
              })}
            </div>
          </section>

          {/* Journey / Timeline */}
          <section aria-labelledby="journey-heading">
            <div className="text-center mb-5 sm:mb-7 md:mb-8">
              <SectionTitle>Our journey</SectionTitle>
            </div>
            <div className="relative">
              <ol className="space-y-5 sm:space-y-6">
                {milestones.map((milestone, idx) => (
                  <li key={idx}>
                    <CardContainer className="flex items-start gap-4 sm:gap-5">
                      <div
                        className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center font-semibold text-xs sm:text-sm md:text-base rounded-full ${isDark ? "bg-[#B0FFFA] text-black" : "bg-[#00B8A9] text-white"
                          }`}
                      >
                        {milestone.year}
                      </div>
                      <div className="flex-1 pt-1">
                        <h3
                          className={`text-base sm:text-lg md:text-xl font-semibold mb-1.5 ${isDark ? "text-white" : "text-gray-900"
                            }`}
                        >
                          {milestone.title}
                        </h3>
                        <p
                          className={`text-sm sm:text-base ${isDark ? "text-white/70" : "text-gray-600"
                            }`}
                        >
                          {milestone.description}
                        </p>
                      </div>
                    </CardContainer>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Team */}
          <section aria-labelledby="team-heading">
            <div className="text-center mb-5 sm:mb-7 md:mb-8">
              <SectionTitle>Meet the team</SectionTitle>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {team.map((member, idx) => (
                <CardContainer
                  key={idx}
                  className="text-center p-4 sm:p-5 md:p-6"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 overflow-hidden mx-auto mb-3 sm:mb-4 rounded-full border border-white/20">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <h3
                    className={`text-xs sm:text-sm md:text-base font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"
                      }`}
                  >
                    {member.name}
                  </h3>
                  <p
                    className={`text-[10px] sm:text-xs md:text-sm ${isDark ? "text-white/60" : "text-gray-600"
                      }`}
                  >
                    {member.role}
                  </p>
                </CardContainer>
              ))}
            </div>
          </section>
        </div>
      </section>
      <Footer />
    </div>
  );
}
