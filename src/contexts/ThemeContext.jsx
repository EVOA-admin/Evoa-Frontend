import { createContext, useContext, useState, useEffect } from 'react';
import UIThemeModal from '../components/shared/UIThemeModal';

const ThemeContext = createContext();

// Helper to darken/lighten a hex color
const adjustHexColor = (hex, amount) => {
  let color = hex.replace('#', '');
  if (color.length === 3) color = color.split('').map(c => c + c).join('');
  if (color.length !== 6) return hex;
  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);
  
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));
  
  return `#${(r).toString(16).padStart(2, '0')}${(g).toString(16).padStart(2, '0')}${(b).toString(16).padStart(2, '0')}`;
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      try { return localStorage.getItem('theme') || 'dark'; } catch (e) {}
    }
    return 'dark';
  });

  const [accentColor, setAccentColor] = useState(() => {
    if (typeof window !== 'undefined') {
      try { return localStorage.getItem('evoa_ui_theme_accent') || 'var(--evoa-accent-primary)'; } catch (e) {}
    }
    return 'var(--evoa-accent-primary)';
  });

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      try { localStorage.setItem('theme', theme); } catch (e) {}
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('evoa_ui_theme_accent', accentColor); } catch (e) {}
      
      const root = document.documentElement;
      root.style.setProperty('--evoa-accent-primary', accentColor);
      root.style.setProperty('--evoa-accent-hover', adjustHexColor(accentColor, -15));
      root.style.setProperty('--evoa-accent-dark', adjustHexColor(accentColor, -40));
      root.style.setProperty('--evoa-accent-light', adjustHexColor(accentColor, 45));
      root.style.setProperty('--evoa-accent-darker', adjustHexColor(accentColor, -60));
    }
  }, [accentColor]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  const openThemeModal = () => setIsThemeModalOpen(true);
  const closeThemeModal = () => setIsThemeModalOpen(false);

  return (
    <ThemeContext.Provider value={{ 
      theme, toggleTheme, setTheme, 
      accentColor, setAccentColor,
      openThemeModal 
    }}>
      {children}
      <UIThemeModal isOpen={isThemeModalOpen} onClose={closeThemeModal} />
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
