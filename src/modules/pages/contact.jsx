import React, { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { HiMail, HiPhone, HiLocationMarker } from "react-icons/hi";
import { HiArrowRight } from "react-icons/hi2";
import { FaLinkedin, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Footer from "../../components/layout/footer";

const SectionTitle = ({ children }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <h2
      className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3 ${isDark
        ? "text-white"
        : "bg-gradient-to-r from-[#00B8A9] via-[#00C9B7] to-[#00B8A9] bg-clip-text text-transparent"
        }`}
    >
      {children}
    </h2>
  );
};

const CardContainer = ({ children, className = "" }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div
      className={`group relative p-5 sm:p-6 md:p-7 lg:p-8 rounded-xl transition-all duration-300 ${isDark
        ? "bg-gradient-to-br from-black/80 via-slate-900/70 to-black/80 backdrop-blur-xl border border-[#B0FFFA]/20 hover:border-[#B0FFFA]/40 hover:shadow-2xl hover:shadow-[#B0FFFA]/10"
        : "bg-white backdrop-blur-xl border border-gray-200/80 hover:border-[#00B8A9]/30 hover:shadow-xl hover:shadow-[#00B8A9]/5"
        } ${className}`}
    >
      {children}
    </div>
  );
};

export default function Contact() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = "Subject must be at least 5 characters";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 20) {
      newErrors.message = "Message must be at least 20 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // TODO: Replace with your actual API endpoint
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Contact form submitted:", formData);

      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });

      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: HiMail,
      title: "Email",
      value: "admin@evoa.co.in",
      link: "mailto:contact@evoa.com",
    },
    {
      icon: HiPhone,
      title: "Phone",
      value: "+91 9636641861, 9759054403",
      link: "tel:+919636641861",
    },
    {
      icon: HiLocationMarker,
      title: "Address",
      value: "Vasant Kunj, New Delhi, 110070",
      link: null,
    },
  ];

  const socialLinks = [
    { icon: FaLinkedin, name: "LinkedIn", url: "https://linkedin.com/company/evo-a" },
    // { icon: FaXTwitter, name: "X (Twitter)", url: "https://twitter.com/evoa" },
    { icon: FaInstagram, name: "Instagram", url: "https://instagram.com/evoaofficial" },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-black" : "bg-gradient-to-br from-gray-50 via-[#B0FFFA]/5 to-gray-50"
        }`}
    >
      <section
        className="py-12 sm:py-16 md:py-20 lg:py-24"
        aria-labelledby="contact-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
          {/* Header */}
          <header className="text-center mb-10 sm:mb-12 md:mb-16">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 backdrop-blur-xl border font-semibold ${isDark
                ? "bg-[#B0FFFA]/10 border-[#B0FFFA]/30 text-[#B0FFFA]"
                : "bg-[#00B8A9]/10 border-[#00B8A9]/20 text-[#00B8A9]"
                }`}
            >
              <span className="text-xs tracking-wider uppercase">
                Contact Us
              </span>
            </div>
            <SectionTitle>Get in Touch</SectionTitle>
            <p
              className={`text-base sm:text-lg md:text-xl max-w-3xl mx-auto mt-4 leading-relaxed ${isDark ? "text-slate-300" : "text-gray-600"
                }`}
            >
              Have a question or want to discuss a partnership? Our team is here to help.
              <br className="hidden sm:block" />
              We typically respond within 24 business hours.
            </p>
          </header>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 items-start">
            {/* Contact Information - Left Side */}
            <aside className="space-y-5 sm:space-y-6">
              {/* Contact Cards */}
              <div className="space-y-4">
                {contactInfo.map((info, idx) => {
                  const IconComponent = info.icon;

                  const content = (
                    <div className="flex items-start gap-4">
                      <div
                        className={`shrink-0 inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${isDark
                          ? "bg-[#B0FFFA]/10 border border-[#B0FFFA]/20"
                          : "bg-[#00B8A9]/10 border border-[#00B8A9]/20"
                          }`}
                      >
                        <IconComponent
                          size={22}
                          className={isDark ? "text-[#B0FFFA]" : "text-[#00B8A9]"}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`font-semibold text-sm mb-1.5 ${isDark ? "text-slate-300" : "text-gray-500"
                            }`}
                        >
                          {info.title}
                        </h3>
                        <p
                          className={`text-base sm:text-lg font-medium ${info.link
                            ? isDark
                              ? "text-white hover:text-[#B0FFFA] cursor-pointer"
                              : "text-gray-900 hover:text-[#00B8A9] cursor-pointer"
                            : isDark
                              ? "text-white"
                              : "text-gray-900"
                            } transition-colors`}
                        >
                          {info.value}
                        </p>
                      </div>
                    </div>
                  );

                  return (
                    <CardContainer key={idx} className="hover:scale-[1.01]">
                      {info.link ? (
                        <a href={info.link} className="block">
                          {content}
                        </a>
                      ) : (
                        content
                      )}
                    </CardContainer>
                  );
                })}
              </div>

              {/* Social Links */}
              <CardContainer>
                <h3
                  className={`font-semibold text-lg mb-4 ${isDark ? "text-white" : "text-gray-900"
                    }`}
                >
                  Follow Us
                </h3>
                <p
                  className={`text-sm mb-4 ${isDark ? "text-slate-300" : "text-gray-600"
                    }`}
                >
                  Connect with us on social media for updates and news.
                </p>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((social, idx) => {
                    const IconComponent = social.icon;
                    return (
                      <a
                        key={idx}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 hover:-translate-y-1 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDark
                          ? "bg-[#B0FFFA]/10 text-[#B0FFFA] hover:bg-[#B0FFFA]/20 border border-[#B0FFFA]/20 focus:ring-[#B0FFFA]/60 focus:ring-offset-black"
                          : "bg-[#00B8A9]/10 text-[#00B8A9] hover:bg-[#00B8A9]/20 border border-[#00B8A9]/20 focus:ring-[#00B8A9]/60 focus:ring-offset-white"
                          }`}
                        aria-label={social.name}
                      >
                        <IconComponent size={20} />
                      </a>
                    );
                  })}
                </div>
              </CardContainer>
            </aside>

            {/* Contact Form - Right Side */}
            <div>
              <CardContainer>
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <div className="mb-6">
                    <h2
                      className={`text-xl sm:text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"
                        }`}
                    >
                      Send Us a Message
                    </h2>
                    <p className={`text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                      Fill out the form below and we'll get back to you shortly.
                    </p>
                  </div>

                  {/* Success/Error Messages */}
                  {submitStatus === "success" && (
                    <div className={`p-4 rounded-lg border ${isDark
                      ? "bg-[#B0FFFA]/10 border-[#B0FFFA]/30"
                      : "bg-green-50 border-green-200"
                      }`}>
                      <p className={`text-sm font-medium ${isDark ? "text-[#B0FFFA]" : "text-green-800"
                        }`}>
                        ✓ Message sent successfully! We'll respond within 24 hours.
                      </p>
                    </div>
                  )}

                  {submitStatus === "error" && (
                    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <p className="text-sm font-medium text-red-800 dark:text-red-300">
                        ✗ Something went wrong. Please try again or contact us directly.
                      </p>
                    </div>
                  )}

                  <div className="space-y-5">
                    {/* Name */}
                    <div>
                      <label
                        htmlFor="name"
                        className={`block text-sm font-semibold mb-2 ${isDark ? "text-white" : "text-gray-700"
                          }`}
                      >
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        autoComplete="name"
                        className={`w-full px-4 py-3 rounded-xl border text-sm transition-all duration-200 ${errors.name
                          ? "border-red-500 focus:ring-red-500"
                          : isDark
                            ? "bg-black/50 border-slate-700/50 text-white placeholder-slate-400 focus:border-[#B0FFFA] focus:ring-2 focus:ring-[#B0FFFA]/20"
                            : "bg-white border-gray-300 text-black placeholder-gray-400 focus:border-[#00B8A9] focus:ring-2 focus:ring-[#00B8A9]/20"
                          } focus:outline-none`}
                        placeholder="John Doe"
                        aria-required="true"
                        aria-invalid={!!errors.name}
                      />
                      {errors.name && (
                        <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className={`block text-sm font-semibold mb-2 ${isDark ? "text-white" : "text-gray-700"
                          }`}
                      >
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        autoComplete="email"
                        className={`w-full px-4 py-3 rounded-xl border text-sm transition-all duration-200 ${errors.email
                          ? "border-red-500 focus:ring-red-500"
                          : isDark
                            ? "bg-black/50 border-slate-700/50 text-white placeholder-slate-400 focus:border-[#B0FFFA] focus:ring-2 focus:ring-[#B0FFFA]/20"
                            : "bg-white border-gray-300 text-black placeholder-gray-400 focus:border-[#00B8A9] focus:ring-2 focus:ring-[#00B8A9]/20"
                          } focus:outline-none`}
                        placeholder="john@company.com"
                        aria-required="true"
                        aria-invalid={!!errors.email}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                      )}
                    </div>

                    {/* Subject */}
                    <div>
                      <label
                        htmlFor="subject"
                        className={`block text-sm font-semibold mb-2 ${isDark ? "text-white" : "text-gray-700"
                          }`}
                      >
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="subject"
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-3 rounded-xl border text-sm transition-all duration-200 ${errors.subject
                          ? "border-red-500 focus:ring-red-500"
                          : isDark
                            ? "bg-black/50 border-slate-700/50 text-white placeholder-slate-400 focus:border-[#B0FFFA] focus:ring-2 focus:ring-[#B0FFFA]/20"
                            : "bg-white border-gray-300 text-black placeholder-gray-400 focus:border-[#00B8A9] focus:ring-2 focus:ring-[#00B8A9]/20"
                          } focus:outline-none`}
                        placeholder="Partnership Inquiry"
                        aria-required="true"
                        aria-invalid={!!errors.subject}
                      />
                      {errors.subject && (
                        <p className="mt-1 text-xs text-red-500">{errors.subject}</p>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <label
                        htmlFor="message"
                        className={`block text-sm font-semibold mb-2 ${isDark ? "text-white" : "text-gray-700"
                          }`}
                      >
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className={`w-full px-4 py-3 rounded-xl border resize-none text-sm transition-all duration-200 ${errors.message
                          ? "border-red-500 focus:ring-red-500"
                          : isDark
                            ? "bg-black/50 border-slate-700/50 text-white placeholder-slate-400 focus:border-[#B0FFFA] focus:ring-2 focus:ring-[#B0FFFA]/20"
                            : "bg-white border-gray-300 text-black placeholder-gray-400 focus:border-[#00B8A9] focus:ring-2 focus:ring-[#00B8A9]/20"
                          } focus:outline-none`}
                        placeholder="Tell us about your inquiry..."
                        aria-required="true"
                        aria-invalid={!!errors.message}
                      />
                      {errors.message && (
                        <p className="mt-1 text-xs text-red-500">{errors.message}</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full inline-flex items-center justify-center gap-2 font-semibold text-base px-6 py-3.5 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isSubmitting
                          ? "opacity-60 cursor-not-allowed"
                          : "hover:scale-[1.02] active:scale-[0.98]"
                          } ${isDark
                            ? "bg-gradient-to-r from-[#B0FFFA] to-[#80E5FF] text-black shadow-lg hover:shadow-[#B0FFFA]/40 focus:ring-[#B0FFFA] focus:ring-offset-black"
                            : "bg-gradient-to-r from-[#00B8A9] to-[#00C9B7] text-white shadow-lg hover:shadow-[#00B8A9]/40 focus:ring-[#00B8A9] focus:ring-offset-white"
                          }`}
                      >
                        {isSubmitting ? (
                          <>
                            <svg
                              className="animate-spin h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message
                            <HiArrowRight size={18} aria-hidden="true" />
                          </>
                        )}
                      </button>
                    </div>

                    {/* Privacy Notice */}
                    <p
                      className={`text-xs text-center leading-relaxed pt-1 ${isDark ? "text-slate-400" : "text-gray-500"
                        }`}
                    >
                      By submitting this form, you agree to our privacy policy. We respect your
                      privacy and will never share your information with third parties.
                    </p>
                  </div>
                </form>
              </CardContainer>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
