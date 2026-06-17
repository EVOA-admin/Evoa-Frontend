import React from 'react';
import { FaTimes, FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

const PRESET_COLORS = [
  { name: 'Teal', hex: '#00B8A9' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Indigo', hex: '#6366F1' },
  { name: 'Purple', hex: '#A855F7' },
  { name: 'Rose', hex: '#F43F5E' },
  { name: 'Orange', hex: '#F97316' },
];

export default function UIThemeModal({ isOpen, onClose }) {
  const { theme, toggleTheme, accentColor, setAccentColor } = useTheme();
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className={`relative w-full max-w-sm rounded-3xl p-6 shadow-2xl transition-transform ${
          isDark 
            ? 'bg-[#111111] border border-white/10 text-white shadow-black/80' 
            : 'bg-white border border-gray-200 text-gray-900 shadow-xl'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight">Appearance</h2>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}
          >
            <FaTimes size={18} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
          </button>
        </div>

        {/* Mode Toggle Section */}
        <div className="mb-8">
          <p className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Theme Mode
          </p>
          <div className={`flex p-1 rounded-2xl ${isDark ? 'bg-[#1A1A1A]' : 'bg-gray-100'}`}>
            <button
              onClick={() => { if(isDark) toggleTheme(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                !isDark 
                  ? 'bg-white shadow-sm text-gray-900' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FaSun size={16} /> Light
            </button>
            <button
              onClick={() => { if(!isDark) toggleTheme(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                isDark 
                  ? 'bg-[#2A2A2A] shadow-sm text-white' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <FaMoon size={16} /> Dark
            </button>
          </div>
        </div>

        {/* Accent Color Section */}
        <div>
          <p className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Accent Color
          </p>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {PRESET_COLORS.map((color) => {
              const isActive = accentColor.toUpperCase() === color.hex.toUpperCase();
              return (
                <button
                  key={color.hex}
                  onClick={() => setAccentColor(color.hex)}
                  className={`relative aspect-square rounded-2xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${
                    isActive ? 'ring-2 ring-offset-2' : ''
                  }`}
                  style={{ 
                    backgroundColor: color.hex,
                    '--tw-ring-color': color.hex,
                    '--tw-ring-offset-color': isDark ? '#111111' : '#ffffff'
                  }}
                  title={color.name}
                >
                  {isActive && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
                  )}
                </button>
              );
            })}
            
            {/* Custom Color Picker */}
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-inner group">
              <div 
                className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-yellow-500 opacity-80 group-hover:opacity-100 transition-opacity"
              />
              <input 
                type="color" 
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer opacity-0"
                title="Custom Color"
              />
              {!PRESET_COLORS.find(c => c.hex.toUpperCase() === accentColor.toUpperCase()) && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: accentColor }} />
                </div>
              )}
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-6 py-3.5 rounded-xl bg-evoa text-white font-bold tracking-wide hover:bg-evoa-hover active:scale-[0.98] transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
}
