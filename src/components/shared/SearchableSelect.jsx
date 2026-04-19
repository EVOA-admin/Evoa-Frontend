import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaSearch } from "react-icons/fa";

export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  isDark = false,
  className = "",
  accentColor = "#00B8A9"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Value Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-1 transition-all flex items-center justify-between cursor-pointer ${
          isDark
            ? "bg-white/5 border-white/10 text-white"
            : "bg-gray-100 border-gray-200 text-gray-900"
        }`}
        style={{
          ...(isOpen
            ? {
                borderColor: accentColor,
                boxShadow: `0 0 0 1px ${accentColor}, 0 0 0 4px ${accentColor}4D`,
              }
            : {}),
        }}
      >
        <span className={selectedOption ? "" : "text-gray-500"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <FaChevronDown
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          size={14}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute z-50 w-full mt-2 rounded-xl shadow-lg border overflow-hidden backdrop-blur-md ${
            isDark
              ? "bg-black/90 border-white/20"
              : "bg-white border-gray-200"
          }`}
        >
          {/* Search Input */}
          <div className={`p-2 border-b ${isDark ? 'border-white/20' : 'border-gray-200'}`}>
            <div className="relative">
              <FaSearch
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isDark ? "text-white/40" : "text-gray-400"
                }`}
                size={14}
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-1 ${
                  isDark
                    ? "bg-white/10 border-white/20 text-white placeholder-white/40"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                }`}
                style={{
                  borderColor: undefined,
                  boxShadow: undefined,
                }}
                autoFocus
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-all cursor-pointer ${
                    value === option.value
                      ? "text-white"
                      : isDark
                      ? "text-white hover:bg-white/10"
                      : "text-gray-900 hover:bg-gray-100"
                  }`}
                  style={value === option.value ? { backgroundColor: accentColor } : undefined}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div
                className={`px-4 py-3 text-sm text-center ${
                  isDark ? "text-white/60" : "text-gray-500"
                }`}
              >
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
