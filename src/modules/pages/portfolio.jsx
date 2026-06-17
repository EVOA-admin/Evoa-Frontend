import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { FaExternalLinkAlt, FaArrowUp } from "react-icons/fa";
import { HiArrowRight } from "react-icons/hi2";
import Footer from "../../components/layout/footer";

export default function Portfolio() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isVisible, setIsVisible] = useState({});
  const sectionRefs = useRef({});

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible((prev) => ({
            ...prev,
            [entry.target.dataset.section]: true
          }));
        }
      });
    }, observerOptions);

    const timeoutId = setTimeout(() => {
      Object.values(sectionRefs.current).forEach((ref) => {
        if (ref) observer.observe(ref);
      });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      Object.values(sectionRefs.current).forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const setRef = (section) => (el) => {
    if (el) {
      sectionRefs.current[section] = el;
      el.dataset.section = section;
    }
  };

  const SectionTitle = ({ children }) => (
    <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r ${
      isDark 
        ? 'from-white via-[#B0FFFA] to-white bg-clip-text text-transparent' 
        : 'from-black via-evoa to-black bg-clip-text text-transparent'
    }`}>
      {children}
    </h2>
  );

  const CardContainer = ({ children, className = '' }) => (
    <div className={`group relative p-4 sm:p-6 md:p-8 lg:p-10 rounded-xl sm:rounded-2xl transition-all duration-500 overflow-hidden ${
      isDark 
        ? 'bg-gradient-to-br from-black/60 via-black/40 to-black/60 backdrop-blur-xl border border-[#B0FFFA]/20 hover:border-[#B0FFFA]/40 hover:shadow-[0_12px_40px_rgba(176,255,250,0.15),0_0_0_1px_rgba(176,255,250,0.1)] hover:scale-[1.01] sm:hover:scale-[1.02] hover:-translate-y-1' 
        : 'bg-gradient-to-br from-white/90 via-white/80 to-white/90 backdrop-blur-xl border border-[#B0FFFA]/30 hover:border-[#B0FFFA]/50 hover:shadow-[0_12px_40px_rgba(0,184,169,0.12),0_0_0_1px_rgba(176,255,250,0.2)] hover:scale-[1.01] sm:hover:scale-[1.02] hover:-translate-y-1'
    } ${className}`}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[#B0FFFA]/5 via-transparent to-[#80E5FF]/5 rounded-xl sm:rounded-2xl"></div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );

  const portfolioItems = [
    {
      id: 1,
      title: "TechFlow Analytics",
      category: "SaaS",
      description: "AI-powered data analytics platform helping businesses make data-driven decisions.",
      image: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800",
      funding: "₹50L",
      status: "Active",
      year: "2023"
    },
    {
      id: 2,
      title: "GreenEnergy Solutions",
      category: "CleanTech",
      description: "Sustainable energy solutions for residential and commercial use.",
      image: "https://images.pexels.com/photos/1181476/pexels-photo-1181476.jpeg?auto=compress&cs=tinysrgb&w=800",
      funding: "₹1Cr",
      status: "Active",
      year: "2023"
    },
    {
      id: 3,
      title: "EduTech Platform",
      category: "EdTech",
      description: "Revolutionary online learning platform with AI-powered personalized courses.",
      image: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800",
      funding: "₹75L",
      status: "Active",
      year: "2024"
    },
    {
      id: 4,
      title: "HealthTech Innovations",
      category: "HealthTech",
      description: "Telemedicine platform connecting patients with healthcare providers.",
      image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800",
      funding: "₹2Cr",
      status: "Active",
      year: "2023"
    },
    {
      id: 5,
      title: "FinTech Solutions",
      category: "FinTech",
      description: "Digital payment gateway and financial services for SMEs.",
      image: "https://images.pexels.com/photos/3184357/pexels-photo-3184357.jpeg?auto=compress&cs=tinysrgb&w=800",
      funding: "₹1.5Cr",
      status: "Active",
      year: "2024"
    },
    {
      id: 6,
      title: "AgriTech Platform",
      category: "AgriTech",
      description: "Smart farming solutions using IoT and AI for better crop yields.",
      image: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800",
      funding: "₹3Cr",
      status: "Active",
      year: "2023"
    }
  ];

  const stats = [
    { label: "Total Investments", value: "₹8.25Cr+" },
    { label: "Active Startups", value: "50+" },
    { label: "Success Rate", value: "85%" },
    { label: "Industries", value: "12+" }
  ];

  const categories = ["All", "SaaS", "CleanTech", "EdTech", "HealthTech", "FinTech", "AgriTech"];

  const filteredItems = selectedCategory === "All" 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === selectedCategory);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-black' : 'bg-white'
    }`}>
      <section
        ref={setRef('portfolio')}
        className={`relative py-8 sm:py-10 md:py-12 transition-all duration-1000 ease-out ${
          isVisible['portfolio'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        aria-labelledby="portfolio-heading"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 md:mb-10 px-4">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 backdrop-blur-xl border ${
              isDark 
                ? 'bg-[#B0FFFA]/5 border-[#B0FFFA]/20 text-[#B0FFFA]' 
                : 'bg-evoa/5 border-evoa/20 text-evoa'
            }`}>
              <span className="text-xs font-bold tracking-wider uppercase">Our Success Stories</span>
            </div>
            <SectionTitle>Our Portfolio</SectionTitle>
            <p className={`text-sm sm:text-base md:text-lg max-w-2xl mx-auto mt-3 ${
              isDark ? 'text-white/70' : 'text-gray-600'
            }`}>
              Discover the innovative startups we've supported and the impact they're making in the ecosystem
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mb-6 sm:mb-8 md:mb-10">
            {stats.map((stat, idx) => (
              <CardContainer
                key={idx}
                className="text-center p-4 sm:p-5 md:p-6"
              >
                <div className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 bg-gradient-to-r ${
                  isDark 
                    ? 'from-[#B0FFFA] via-white to-[#80E5FF] bg-clip-text text-transparent' 
                    : 'from-evoa via-teal-600 to-evoa-dark bg-clip-text text-transparent'
                }`}>
                  {stat.value}
                </div>
                <div className={`text-xs sm:text-sm md:text-base font-medium ${
                  isDark ? 'text-white/80' : 'text-gray-700'
                }`}>
                  {stat.label}
                </div>
              </CardContainer>
            ))}
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8 md:mb-10 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base font-semibold rounded-lg transition-all duration-300 ${
                  selectedCategory === category
                    ? isDark
                      ? 'bg-gradient-to-r from-[#B0FFFA] to-[#80E5FF] text-black shadow-lg'
                      : 'bg-gradient-to-r from-evoa to-evoa-dark text-white shadow-lg'
                    : isDark
                      ? 'bg-black/40 text-white hover:bg-black/60 border border-[#B0FFFA]/30 hover:border-[#B0FFFA]/50'
                      : 'bg-white/90 text-gray-700 hover:bg-white border border-evoa/30 hover:border-evoa/50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Portfolio Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {filteredItems.map((item, index) => (
              <CardContainer
                key={item.id}
                className={`overflow-hidden transition-all duration-700 ${
                  isVisible['portfolio'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Image */}
                <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden rounded-lg mb-4 sm:mb-5">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${
                    isDark 
                      ? 'from-black/90 via-black/40 to-transparent' 
                      : 'from-black/80 via-black/30 to-transparent'
                  } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                    <div className="absolute bottom-4 left-4 right-4">
                      <button className={`w-full py-2.5 sm:py-3 font-semibold text-sm sm:text-base flex items-center justify-center gap-2 rounded-lg transition-all duration-300 ${
                        isDark 
                          ? 'bg-gradient-to-r from-[#B0FFFA] to-[#80E5FF] text-black hover:shadow-lg' 
                          : 'bg-gradient-to-r from-evoa to-evoa-dark text-white hover:shadow-lg'
                      }`}>
                        View Details
                        <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                  <div className={`absolute top-3 sm:top-4 right-3 sm:right-4 px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold backdrop-blur-xl ${
                    isDark 
                      ? 'bg-[#B0FFFA]/20 border border-[#B0FFFA]/30 text-[#B0FFFA]' 
                      : 'bg-white/90 border border-evoa/30 text-evoa'
                  }`}>
                    {item.status}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs sm:text-sm font-semibold px-3 py-1 rounded-lg ${
                      isDark 
                        ? 'bg-[#B0FFFA]/20 text-[#B0FFFA] border border-[#B0FFFA]/30' 
                        : 'bg-evoa/20 text-evoa border border-evoa/30'
                    }`}>
                      {item.category}
                    </span>
                    <span className={`text-xs sm:text-sm font-medium ${
                      isDark ? 'text-white/60' : 'text-gray-600'
                    }`}>
                      {item.year}
                    </span>
                  </div>
                  <h3 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-3 ${
                    isDark ? 'text-white group-hover:text-[#B0FFFA]' : 'text-black group-hover:text-evoa'
                  } transition-colors duration-300`}>
                    {item.title}
                  </h3>
                  <p className={`text-sm sm:text-base md:text-lg mb-4 sm:mb-5 leading-relaxed line-clamp-2 ${
                    isDark ? 'text-white/80' : 'text-gray-700'
                  }`}>
                    {item.description}
                  </p>
                  <div className={`flex items-center justify-between pt-4 border-t ${
                    isDark ? 'border-[#B0FFFA]/20' : 'border-evoa/20'
                  }`}>
                    <div>
                      <div className={`text-xs sm:text-sm font-medium mb-1 ${
                        isDark ? 'text-white/60' : 'text-gray-600'
                      }`}>
                        Funding Raised
                      </div>
                      <div className={`text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r ${
                        isDark 
                          ? 'from-[#B0FFFA] to-[#80E5FF] bg-clip-text text-transparent' 
                          : 'from-evoa to-evoa-dark bg-clip-text text-transparent'
                      }`}>
                        {item.funding}
                      </div>
                    </div>
                    <button className={`p-2 sm:p-3 rounded-lg transition-all duration-300 ${
                      isDark
                        ? 'bg-[#B0FFFA]/20 text-[#B0FFFA] hover:bg-[#B0FFFA]/30 hover:scale-110'
                        : 'bg-evoa/20 text-evoa hover:bg-evoa/30 hover:scale-110'
                    }`}>
                      <FaExternalLinkAlt size={16} className="sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              </CardContainer>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

