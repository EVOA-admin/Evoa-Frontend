import React, { useState, useRef, useEffect } from "react";
import { FiChevronDown, FiSearch, FiCheck } from "react-icons/fi";

/**
 * SearchableSelect — White/Blue Design System
 *
 * Fully themed to match the landing page and registration redesign.
 * `isDark` and `accentColor` props are preserved for API backward-compatibility
 * but the component always renders in the light white/blue theme to match
 * the registration flow design system.
 */
export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  isDark = false,      // kept for backward compat — light theme always used
  className = "",
  accentColor,         // kept for backward compat — blue always used
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  /* ── Close on outside click / Escape ── */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  /* ── Auto-focus search when opened ── */
  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleToggle = () => {
    setIsOpen((prev) => {
      if (prev) setSearchQuery("");
      return !prev;
    });
  };

  return (
    <>
      {/* Scoped styles — injected once per render, deduplicated by browser */}
      <style>{`
        .ss-root { position: relative; }

        /* ── Trigger button ── */
        .ss-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 11px 14px;
          background: #FFFFFF;
          border: 1.5px solid #E2E8F0;
          border-radius: 8px;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #0F172A;
          text-align: left;
          box-sizing: border-box;
          line-height: 1.4;
        }
        .ss-trigger:hover { border-color: #CBD5E1; }
        .ss-trigger.ss-open {
          border-color: #1565C0;
          box-shadow: 0 0 0 3px rgba(21, 101, 192, 0.10);
        }

        .ss-trigger .ss-value {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .ss-trigger .ss-placeholder { color: #94A3B8; }

        .ss-chevron {
          color: #94A3B8;
          flex-shrink: 0;
          transition: transform 0.2s, color 0.2s;
        }
        .ss-trigger.ss-open .ss-chevron {
          transform: rotate(180deg);
          color: #1565C0;
        }

        /* ── Dropdown panel ── */
        .ss-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          z-index: 9999;
          background: #FFFFFF;
          border: 1.5px solid #E2E8F0;
          border-radius: 10px;
          box-shadow:
            0 8px 32px rgba(15, 23, 42, 0.12),
            0 2px 8px rgba(15, 23, 42, 0.06);
          overflow: hidden;
          animation: ss-drop 0.15s ease;
        }
        @keyframes ss-drop {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Search bar ── */
        .ss-search-wrap {
          padding: 10px 10px 8px;
          border-bottom: 1px solid #F1F5F9;
        }
        .ss-search-inner {
          position: relative;
          display: flex;
          align-items: center;
        }
        .ss-search-icon {
          position: absolute;
          left: 10px;
          color: #94A3B8;
          pointer-events: none;
          flex-shrink: 0;
        }
        .ss-search-input {
          width: 100%;
          padding: 8px 10px 8px 32px;
          background: #F8FAFC;
          border: 1.5px solid #E2E8F0;
          border-radius: 6px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: #0F172A;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          box-sizing: border-box;
          line-height: 1.4;
        }
        .ss-search-input::placeholder { color: #94A3B8; }
        .ss-search-input:focus {
          border-color: #1565C0;
          box-shadow: 0 0 0 2px rgba(21, 101, 192, 0.10);
          background: #FFFFFF;
        }

        /* ── Options list ── */
        .ss-list {
          max-height: 228px;
          overflow-y: auto;
          overscroll-behavior: contain;
        }
        .ss-list::-webkit-scrollbar { width: 4px; }
        .ss-list::-webkit-scrollbar-track { background: transparent; }
        .ss-list::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 2px;
        }
        .ss-list::-webkit-scrollbar-thumb:hover { background: #94A3B8; }

        /* ── Option item ── */
        .ss-option {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 10px 14px;
          background: transparent;
          border: none;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #0F172A;
          cursor: pointer;
          text-align: left;
          transition: background 0.12s, color 0.12s;
          line-height: 1.4;
        }
        .ss-option:hover {
          background: #EFF6FF;
          color: #1565C0;
        }
        .ss-option.ss-selected {
          background: #EFF6FF;
          color: #1565C0;
          font-weight: 600;
        }
        .ss-check {
          color: #1565C0;
          flex-shrink: 0;
        }

        /* ── Empty state ── */
        .ss-empty {
          padding: 16px 14px;
          text-align: center;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: #94A3B8;
        }
      `}</style>

      <div className={`ss-root ${className}`} ref={dropdownRef}>
        {/* ── Trigger ── */}
        <button
          type="button"
          className={`ss-trigger${isOpen ? " ss-open" : ""}`}
          onClick={handleToggle}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className={selectedOption ? "ss-value" : "ss-value ss-placeholder"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <FiChevronDown className="ss-chevron" size={15} />
        </button>

        {/* ── Dropdown panel ── */}
        {isOpen && (
          <div className="ss-dropdown" role="listbox">
            {/* Search */}
            <div className="ss-search-wrap">
              <div className="ss-search-inner">
                <FiSearch className="ss-search-icon" size={13} />
                <input
                  ref={searchRef}
                  type="text"
                  className="ss-search-input"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Options */}
            <div className="ss-list">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = value === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={`ss-option${isSelected ? " ss-selected" : ""}`}
                      onClick={() => handleSelect(option.value)}
                    >
                      <span>{option.label}</span>
                      {isSelected && <FiCheck className="ss-check" size={14} />}
                    </button>
                  );
                })
              ) : (
                <div className="ss-empty">No options found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
