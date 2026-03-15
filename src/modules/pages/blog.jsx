import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { HiCalendar, HiUser, HiArrowRight } from "react-icons/hi2";
import Footer from "../../components/layout/footer";

export default function Blog() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
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
    <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-bold leading-snug mb-2 sm:mb-3 bg-gradient-to-r ${isDark
        ? 'from-white via-[#B0FFFA] to-white bg-clip-text text-transparent'
        : 'from-black via-[#00B8A9] to-black bg-clip-text text-transparent'
      }`}>
      {children}
    </h2>
  );

  const CardContainer = ({ children, className = '' }) => (
    <div className={`group relative p-4 sm:p-6 md:p-8 lg:p-10 rounded-xl sm:rounded-2xl transition-all duration-500 overflow-hidden ${isDark
        ? 'bg-gradient-to-br from-black/60 via-black/40 to-black/60 backdrop-blur-xl border border-[#B0FFFA]/20 hover:border-[#B0FFFA]/40 hover:shadow-[0_12px_40px_rgba(176,255,250,0.15),0_0_0_1px_rgba(176,255,250,0.1)] hover:scale-[1.01] sm:hover:scale-[1.02] hover:-translate-y-1'
        : 'bg-gradient-to-br from-white/90 via-white/80 to-white/90 backdrop-blur-xl border border-[#B0FFFA]/30 hover:border-[#B0FFFA]/50 hover:shadow-[0_12px_40px_rgba(0,184,169,0.12),0_0_0_1px_rgba(176,255,250,0.2)] hover:scale-[1.01] sm:hover:scale-[1.02] hover:-translate-y-1'
      } ${className}`}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[#B0FFFA]/5 via-transparent to-[#80E5FF]/5 rounded-xl sm:rounded-2xl"></div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );

  const blogPosts = [
    {
      id: 1,
      title: "The Future of Startup Funding in India",
      excerpt:
        "Exploring how the startup ecosystem is evolving and what investors are looking for in 2026.",
      author: "John Doe",
      date: "March 15, 2026",
      category: "Funding",
      image:
        "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800",
      readTime: "5 min read",
    },
    {
      id: 2,
      title: "10 Tips for Pitching Your Startup Successfully",
      excerpt:
        "Learn the essential strategies to make your pitch stand out and attract the right investors.",
      author: "Jane Smith",
      date: "March 10, 2026",
      category: "Pitching",
      image:
        "https://images.pexels.com/photos/1181476/pexels-photo-1181476.jpeg?auto=compress&cs=tinysrgb&w=800",
      readTime: "7 min read",
    },
    {
      id: 3,
      title: "Building a Strong Investor Network",
      excerpt:
        "Discover how to connect with the right investors and build meaningful relationships in the startup world.",
      author: "Mike Johnson",
      date: "March 5, 2026",
      category: "Networking",
      image:
        "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800",
      readTime: "6 min read",
    },
    {
      id: 4,
      title: "AI Startups: The Next Big Wave",
      excerpt:
        "Understanding the AI revolution and how startups are leveraging artificial intelligence.",
      author: "Sarah Williams",
      date: "February 28, 2026",
      category: "Technology",
      image:
        "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800",
      readTime: "8 min read",
    },
    {
      id: 5,
      title: "From Idea to IPO: A Startup Journey",
      excerpt:
        "A comprehensive guide on scaling your startup from initial concept to public offering.",
      author: "David Brown",
      date: "February 20, 2026",
      category: "Growth",
      image:
        "https://images.pexels.com/photos/3184357/pexels-photo-3184357.jpeg?auto=compress&cs=tinysrgb&w=800",
      readTime: "10 min read",
    },
    {
      id: 6,
      title: "Sustainable Startups: The Green Revolution",
      excerpt:
        "How eco-friendly startups are changing the business landscape and attracting conscious investors.",
      author: "Emily Davis",
      date: "February 15, 2026",
      category: "Sustainability",
      image:
        "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800",
      readTime: "6 min read",
    },
  ];

  const categories = [
    "All",
    "Funding",
    "Pitching",
    "Networking",
    "Technology",
    "Growth",
    "Sustainability",
  ];

  const filteredPosts = selectedCategory === "All"
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-white'
      }`}>
      <section
        ref={setRef('blog')}
        className={`relative py-8 sm:py-10 md:py-12 transition-all duration-1000 ease-out ${isVisible['blog'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        aria-labelledby="blog-heading"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10">
          {/* Header */}
          <header className="text-center mb-6 sm:mb-8 md:mb-10 px-4">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 backdrop-blur-xl border ${isDark
                ? 'bg-[#B0FFFA]/5 border-[#B0FFFA]/20 text-[#B0FFFA]'
                : 'bg-[#00B8A9]/5 border-[#00B8A9]/20 text-[#00B8A9]'
              }`}>
              <span className="text-xs font-bold tracking-wider uppercase">Insights & Stories</span>
            </div>
            <SectionTitle>EVO‑A Blog</SectionTitle>
            <p className={`text-sm sm:text-base md:text-lg max-w-2xl mx-auto mt-3 ${isDark ? 'text-white/70' : 'text-gray-600'
              }`}>
              Insights, stories, and expert advice on startups, investing, and the entrepreneurial ecosystem.
            </p>
          </header>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8 md:mb-10 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base font-semibold rounded-lg transition-all duration-300 ${selectedCategory === category
                    ? isDark
                      ? 'bg-gradient-to-r from-[#B0FFFA] to-[#80E5FF] text-black shadow-lg'
                      : 'bg-gradient-to-r from-[#00B8A9] to-[#008C81] text-white shadow-lg'
                    : isDark
                      ? 'bg-black/40 text-white hover:bg-black/60 border border-[#B0FFFA]/30 hover:border-[#B0FFFA]/50'
                      : 'bg-white/90 text-gray-700 hover:bg-white border border-[#00B8A9]/30 hover:border-[#00B8A9]/50'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Blog Posts Grid */}
          <main
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
            aria-label="Blog articles"
          >
            {filteredPosts.map((post, index) => (
              <CardContainer
                key={post.id}
                className={`flex flex-col overflow-hidden transition-all duration-700 ${isVisible['blog'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Image */}
                <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden rounded-lg mb-4 sm:mb-5">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${isDark
                      ? 'from-black/90 via-black/40 to-transparent'
                      : 'from-black/80 via-black/30 to-transparent'
                    } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                    <div className="absolute bottom-4 left-4 right-4">
                      <button className={`w-full py-2.5 sm:py-3 font-semibold text-sm sm:text-base flex items-center justify-center gap-2 rounded-lg transition-all duration-300 ${isDark
                          ? 'bg-gradient-to-r from-[#B0FFFA] to-[#80E5FF] text-black hover:shadow-lg'
                          : 'bg-gradient-to-r from-[#00B8A9] to-[#008C81] text-white hover:shadow-lg'
                        }`}>
                        Read Article
                        <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                  <span className={`absolute top-3 sm:top-4 left-3 sm:left-4 px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold backdrop-blur-xl ${isDark
                      ? 'bg-[#B0FFFA]/20 border border-[#B0FFFA]/30 text-[#B0FFFA]'
                      : 'bg-white/90 border border-[#00B8A9]/30 text-[#00B8A9]'
                    }`}>
                    {post.category}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1">
                  <h2 className={`text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 line-clamp-2 ${isDark ? 'text-white group-hover:text-[#B0FFFA]' : 'text-black group-hover:text-[#00B8A9]'
                    } transition-colors duration-300`}>
                    {post.title}
                  </h2>
                  <p className={`text-sm sm:text-base md:text-lg mb-3 sm:mb-4 line-clamp-3 leading-relaxed ${isDark ? 'text-white/80' : 'text-gray-700'
                    }`}>
                    {post.excerpt}
                  </p>

                  {/* Meta Info */}
                  <div className={`mt-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm mb-3 sm:mb-4 ${isDark ? 'text-white/60' : 'text-gray-600'
                    }`}>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="inline-flex items-center gap-1.5">
                        <HiUser className="w-4 h-4" aria-hidden="true" />
                        <span>{post.author}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <HiCalendar className="w-4 h-4" aria-hidden="true" />
                        <span>{post.date}</span>
                      </span>
                    </div>
                    <span className="font-medium">{post.readTime}</span>
                  </div>

                  {/* Read More */}
                  <button
                    type="button"
                    className={`inline-flex items-center gap-2 text-sm sm:text-base font-semibold transition-all duration-300 ${isDark
                        ? 'text-[#B0FFFA] hover:text-[#80E5FF]'
                        : 'text-[#00B8A9] hover:text-[#008C81]'
                      }`}
                    aria-label={`Read more: ${post.title}`}
                  >
                    Read more
                    <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </button>
                </div>
              </CardContainer>
            ))}
          </main>

          {/* Load More */}
          <div className="text-center mt-8 sm:mt-10 md:mt-12">
            <button
              type="button"
              className={`px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-3.5 font-bold text-sm sm:text-base md:text-lg rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 ${isDark
                  ? 'bg-gradient-to-r from-[#B0FFFA] to-[#80E5FF] text-black shadow-xl hover:shadow-[0_0_40px_rgba(176,255,250,0.5)]'
                  : 'bg-gradient-to-r from-[#00B8A9] to-[#008C81] text-white shadow-xl hover:shadow-[0_0_40px_rgba(0,184,169,0.3)]'
                }`}
            >
              Load more articles
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
