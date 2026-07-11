import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * AuthPromptModal
 *
 * A lightweight "Sign in to continue" bottom-sheet/modal that appears when
 * an unauthenticated visitor tries to perform a protected action (follow,
 * like, message, etc.).
 *
 * Props:
 *   isOpen      — boolean
 *   onClose     — () => void
 *   action      — string  — human-readable action name, e.g. "follow this profile"
 *   returnTo    — string  — path to redirect back to after sign-in (optional)
 */
export default function AuthPromptModal({ isOpen, onClose, action = 'do this', returnTo }) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const goToLogin = () => {
    onClose();
    navigate('/login', { state: { from: returnTo || window.location.pathname } });
  };

  const goToRegister = () => {
    onClose();
    navigate('/register', { state: { from: returnTo || window.location.pathname } });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          animation: 'auth-fade-in 0.2s ease',
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: 'fixed',
          bottom: 0, left: '50%',
          transform: 'translateX(-50%)',
          width: '100%', maxWidth: 430,
          zIndex: 9999,
          animation: 'auth-slide-up 0.28s cubic-bezier(0.34,1.2,0.64,1)',
        }}
      >
        <div
          style={{
            margin: '0 12px 16px',
            borderRadius: 24,
            padding: '28px 24px 24px',
            background: isDark ? '#111115' : '#ffffff',
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.35)',
          }}
        >
          {/* Drag handle */}
          <div style={{ width: 36, height: 4, borderRadius: 2, background: isDark ? 'rgba(255,255,255,0.15)' : '#e0e0e0', margin: '-8px auto 20px' }} />

          {/* Icon */}
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, #00b8a9, #E8341A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 24,
          }}>
            🔒
          </div>

          <h2 style={{
            textAlign: 'center',
            fontSize: 18, fontWeight: 700,
            color: isDark ? '#fff' : '#111',
            margin: '0 0 8px',
          }}>
            Sign in to {action}
          </h2>
          <p style={{
            textAlign: 'center',
            fontSize: 13,
            color: isDark ? 'rgba(255,255,255,0.5)' : '#777',
            margin: '0 0 24px', lineHeight: 1.5,
          }}>
            Create a free account or sign in to interact with this profile.
          </p>

          <button
            id="auth-prompt-signin"
            onClick={goToLogin}
            style={{
              width: '100%', padding: '13px 0',
              borderRadius: 12, border: 'none',
              background: '#00b8a9',
              color: '#fff', fontSize: 15, fontWeight: 700,
              cursor: 'pointer', marginBottom: 10,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Sign In
          </button>

          <button
            id="auth-prompt-register"
            onClick={goToRegister}
            style={{
              width: '100%', padding: '13px 0',
              borderRadius: 12,
              border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e0e0e0',
              background: 'transparent',
              color: isDark ? '#fff' : '#333',
              fontSize: 15, fontWeight: 600,
              cursor: 'pointer', marginBottom: 8,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : '#f5f5f5'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Create Account
          </button>

          <button
            onClick={onClose}
            style={{
              width: '100%', padding: '10px 0',
              background: 'none', border: 'none',
              color: isDark ? 'rgba(255,255,255,0.35)' : '#aaa',
              fontSize: 13, cursor: 'pointer',
            }}
          >
            Maybe later
          </button>
        </div>
      </div>

      <style>{`
        @keyframes auth-fade-in  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes auth-slide-up { from { transform: translateX(-50%) translateY(100%) } to { transform: translateX(-50%) translateY(0) } }
      `}</style>
    </>
  );
}
