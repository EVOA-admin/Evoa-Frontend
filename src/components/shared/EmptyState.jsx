import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const EmptyState = ({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    className = ''
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div
            className={`flex flex-col items-center justify-center py-14 px-6 text-center mx-3 my-2 rounded-[22px] border transition-all duration-300 ${
                isDark
                    ? 'border-white/10'
                    : 'border-white/80'
            } ${className}`}
            style={{
                background: isDark
                    ? 'rgba(255,255,255,0.03)'
                    : 'rgba(255,255,255,0.72)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: isDark
                    ? '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
                    : '0 4px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
            }}
        >
            {Icon && (
                <div
                    className="mb-5 p-4 rounded-2xl"
                    style={{
                        background: 'rgba(0,184,169,0.12)',
                        border: '1px solid rgba(0,184,169,0.25)',
                        color: 'var(--evoa-accent-primary)',
                        boxShadow: '0 0 20px rgba(0,184,169,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                    }}
                >
                    <Icon size={32} />
                </div>
            )}

            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {title}
            </h3>

            {description && (
                <p className={`text-sm mb-7 max-w-sm mx-auto leading-relaxed ${isDark ? 'text-white/45' : 'text-gray-500'}`}>
                    {description}
                </p>
            )}

            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="px-7 py-2.5 text-sm font-semibold text-white rounded-[14px] transition-all"
                    style={{
                        background: 'linear-gradient(135deg, var(--evoa-accent-light) 0%, var(--evoa-accent-primary) 50%, var(--evoa-accent-darker) 100%)',
                        boxShadow: '0 4px 20px rgba(0,184,169,0.4), 0 0 0 1px rgba(0,184,169,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,184,169,0.55), 0 0 0 1px rgba(0,184,169,0.4), inset 0 1px 0 rgba(255,255,255,0.25)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,184,169,0.4), 0 0 0 1px rgba(0,184,169,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
                    }}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
