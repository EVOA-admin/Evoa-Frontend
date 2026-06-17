import React, { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { HiArrowRight } from "react-icons/hi2";
import { FaRocket, FaCheckCircle } from "react-icons/fa";

export default function PitchUs() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const SectionTitle = ({ children }) => (
    <h2
      className={`text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-bold leading-snug mb-3 sm:mb-4 bg-gradient-to-r ${
        isDark
          ? "from-white via-[#B0FFFA] to-white bg-clip-text text-transparent"
          : "from-black via-evoa to-black bg-clip-text text-transparent"
      }`}
    >
      {children}
    </h2>
  );

  const CardContainer = ({ children, className = "" }) => (
    <div
      className={`group relative p-4 sm:p-6 md:p-7 lg:p-8 rounded-xl sm:rounded-2xl transition-all duration-500 overflow-hidden ${
        isDark
          ? "bg-gradient-to-br from-black/60 via-black/40 to-black/60 backdrop-blur-xl border border-[#B0FFFA]/20 hover:border-[#B0FFFA]/40 hover:shadow-[0_12px_40px_rgba(176,255,250,0.15),0_0_0_1px_rgba(176,255,250,0.1)] hover:scale-[1.01] sm:hover:scale-[1.02] hover:-translate-y-1"
          : "bg-gradient-to-br from-white/90 via-white/80 to-white/90 backdrop-blur-xl border border-[#B0FFFA]/30 hover:border-[#B0FFFA]/50 hover:shadow-[0_12px_40px_rgba(0,184,169,0.12),0_0_0_1px_rgba(176,255,250,0.2)] hover:scale-[1.01] sm:hover:scale-[1.02] hover:-translate-y-1"
      } ${className}`}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[#B0FFFA]/5 via-transparent to-[#80E5FF]/5 rounded-xl sm:rounded-2xl"></div>
      <div className="relative z-10">{children}</div>
    </div>
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    pitchType: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePitchTypeChange = (id) => {
    setFormData((prev) => ({
      ...prev,
      pitchType: id,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Replace with real submit logic
    console.log("Pitch submitted:", formData);
  };

  const benefits = [
    "Direct access to active investors who match your sector & stage",
    "Expert feedback on your pitch and deal structure",
    "Increased visibility across the EVO‑A ecosystem",
    "Opportunities to join live pitch battles and showcases",
    "Connect with mentors, advisors, and incubator partners",
  ];

  const pitchTypes = [
    {
      id: "seed",
      label: "Seed round",
      description: "Early‑stage funding to validate and launch your MVP.",
    },
    {
      id: "series-a",
      label: "Series A",
      description: "Growth capital to scale traction and expand your team.",
    },
    {
      id: "series-b",
      label: "Series B+",
      description: "Scale funding for proven, revenue‑generating models.",
    },
    {
      id: "strategic",
      label: "Strategic investment",
      description: "Capital plus partnerships, distribution, or technology.",
    },
  ];

  return (
    <section
      className={`min-h-screen py-8 sm:py-10 md:py-12 transition-colors duration-300 ${
        isDark ? "bg-black" : "bg-white"
      }`}
      aria-labelledby="pitch-heading"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10">
        {/* Header */}
        <header className="text-center mb-6 sm:mb-8 md:mb-10 px-4">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 backdrop-blur-xl border ${
              isDark
                ? "bg-[#B0FFFA]/5 border-[#B0FFFA]/20 text-[#B0FFFA]"
                : "bg-evoa/5 border-evoa/20 text-evoa"
            }`}
          >
            <span className="text-xs font-bold tracking-wider uppercase">
              Pitch on EVO‑A
            </span>
          </div>
          <SectionTitle>Pitch your startup</SectionTitle>
          <p
            className={`text-sm sm:text-base md:text-lg max-w-2xl mx-auto mt-3 ${
              isDark ? "text-white/70" : "text-gray-600"
            }`}
          >
            Get your startup in front of the right investors. Share your pitch and join
            the EVO‑A ecosystem.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-7 lg:gap-10 items-start">
          {/* Benefits */}
          <aside className="space-y-4 sm:space-y-5">
            <CardContainer className="p-4 sm:p-5 md:p-6">
              <h2
                className={`text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Why pitch on EVO‑A?
              </h2>
              <ul className="space-y-2 sm:space-y-3">
                {benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${
                        isDark
                          ? "bg-[#B0FFFA]/15 text-[#B0FFFA]"
                          : "bg-evoa/10 text-evoa"
                      }`}
                    >
                      <FaCheckCircle size={12} aria-hidden="true" />
                    </div>
                    <span
                      className={`text-xs sm:text-sm md:text-base ${
                        isDark ? "text-white/80" : "text-gray-700"
                      }`}
                    >
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContainer>

            {/* Stats */}
            <CardContainer aria-label="Platform highlights" className="p-4 sm:p-5">
              <div className="grid grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <div
                    className={`text-xl sm:text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r ${
                      isDark
                        ? "from-[#B0FFFA] via-white to-[#80E5FF] bg-clip-text text-transparent"
                        : "from-evoa via-teal-600 to-evoa-dark bg-clip-text text-transparent"
                    }`}
                  >
                    500+
                  </div>
                  <div
                    className={`text-xs sm:text-sm ${
                      isDark ? "text-white/70" : "text-gray-600"
                    }`}
                  >
                    Active investors
                  </div>
                </div>
                <div>
                  <div
                    className={`text-xl sm:text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r ${
                      isDark
                        ? "from-[#B0FFFA] via-white to-[#80E5FF] bg-clip-text text-transparent"
                        : "from-evoa via-teal-600 to-evoa-dark bg-clip-text text-transparent"
                    }`}
                  >
                    ₹2,000Cr+
                  </div>
                  <div
                    className={`text-xs sm:text-sm ${
                      isDark ? "text-white/70" : "text-gray-600"
                    }`}
                  >
                    Funds raised
                  </div>
                </div>
              </div>
            </CardContainer>
          </aside>

          {/* Form */}
          <div className="lg:col-span-2">
            <CardContainer>
              <form
                onSubmit={handleSubmit}
                className="space-y-5 sm:space-y-6"
                noValidate
              >
              <h2
                className={`text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-5 md:mb-6 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Submit your pitch
              </h2>

              <div className="space-y-5">
                {/* Name */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="name"
                    className={`text-sm font-medium ${
                      isDark ? "text-white" : "text-gray-700"
                    }`}
                  >
                    Full name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg border text-xs sm:text-sm md:text-base ${
                      isDark
                        ? "bg-black/50 border-white/20 text-white placeholder-white/40"
                        : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
                    } focus:outline-none focus:ring-2 focus:ring-evoa focus:border-evoa`}
                    placeholder="Enter your full name"
                    aria-required="true"
                  />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="email"
                      className={`text-sm font-medium ${
                        isDark ? "text-white" : "text-gray-700"
                      }`}
                    >
                      Email address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border text-sm sm:text-base ${
                        isDark
                          ? "bg-black/50 border-white/20 text-white placeholder-white/40"
                          : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
                      } focus:outline-none focus:ring-2 focus:ring-evoa focus:border-evoa`}
                      placeholder="you@example.com"
                      aria-required="true"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="phone"
                      className={`text-sm font-medium ${
                        isDark ? "text-white" : "text-gray-700"
                      }`}
                    >
                      Phone number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border text-sm sm:text-base ${
                        isDark
                          ? "bg-black/50 border-white/20 text-white placeholder-white/40"
                          : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
                      } focus:outline-none focus:ring-2 focus:ring-evoa focus:border-evoa`}
                      placeholder="+91 1234567890"
                      aria-required="true"
                    />
                  </div>
                </div>

                {/* Company */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="company"
                    className={`text-sm font-medium ${
                      isDark ? "text-white" : "text-gray-700"
                    }`}
                  >
                    Company / startup name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="company"
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg border text-xs sm:text-sm md:text-base ${
                      isDark
                        ? "bg-black/50 border-white/20 text-white placeholder-white/40"
                        : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
                    } focus:outline-none focus:ring-2 focus:ring-evoa focus:border-evoa`}
                    placeholder="Your startup name"
                    aria-required="true"
                  />
                </div>

                {/* Pitch type (radio-like group) */}
                <fieldset className="space-y-3">
                  <legend
                    className={`text-sm font-medium ${
                      isDark ? "text-white" : "text-gray-700"
                    }`}
                  >
                    Funding stage <span className="text-red-500">*</span>
                  </legend>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {pitchTypes.map((type) => {
                      const selected = formData.pitchType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => handlePitchTypeChange(type.id)}
                          className={`p-2.5 sm:p-3 md:p-4 rounded-lg border text-left text-xs sm:text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-evoa ${
                            selected
                              ? isDark
                                ? "bg-white text-black border-white"
                                : "bg-black text-white border-black"
                              : isDark
                              ? "bg-black/50 border-white/20 text-white hover:border-white/40"
                              : "bg-gray-50 border-gray-300 text-gray-900 hover:border-gray-400"
                          }`}
                          aria-pressed={selected}
                          aria-label={type.label}
                        >
                          <div className="font-semibold mb-0.5 sm:mb-1">
                            {type.label}
                          </div>
                          <div
                            className={
                              selected
                                ? isDark
                                  ? "text-black/70"
                                  : "text-white/80"
                                : isDark
                                ? "text-white/60"
                                : "text-gray-600"
                            }
                          >
                            {type.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {/* Hidden input to keep pitchType as part of form data */}
                  <input
                    type="hidden"
                    name="pitchType"
                    value={formData.pitchType}
                    required
                  />
                </fieldset>

                {/* Message */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="message"
                    className={`text-sm font-medium ${
                      isDark ? "text-white" : "text-gray-700"
                    }`}
                  >
                    Pitch description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border resize-none text-sm sm:text-base ${
                      isDark
                        ? "bg-black/50 border-white/20 text-white placeholder-white/40"
                        : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
                    } focus:outline-none focus:ring-2 focus:ring-evoa focus:border-evoa`}
                    placeholder="Tell us what you’re building, your traction, and what kind of support you’re looking for..."
                    aria-required="true"
                  />
                </div>

                {/* Submit */}
                <div className="pt-1">
                  <button
                    type="submit"
                    className={`w-full inline-flex items-center justify-center gap-2 font-semibold text-sm sm:text-base md:text-lg px-4 py-2.5 sm:py-3 md:py-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      isDark
                        ? "bg-gradient-to-r from-[#B0FFFA] to-[#80E5FF] text-black shadow-lg hover:shadow-[0_0_30px_rgba(176,255,250,0.5)] focus:ring-[#B0FFFA] focus:ring-offset-black"
                        : "bg-gradient-to-r from-evoa to-evoa-dark text-white shadow-lg hover:shadow-[0_0_30px_rgba(0,184,169,0.4)] focus:ring-evoa focus:ring-offset-white"
                    }`}
                  >
                    Submit pitch
                    <HiArrowRight size={18} aria-hidden="true" />
                  </button>
                </div>

                <p
                  className={`text-[11px] sm:text-xs text-center ${
                    isDark ? "text-white/50" : "text-gray-500"
                  }`}
                >
                  By submitting, you confirm you agree to our terms and acknowledge that
                  the EVO‑A team will review your pitch and typically respond within
                  48 hours.
                </p>
              </div>
              </form>
            </CardContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
