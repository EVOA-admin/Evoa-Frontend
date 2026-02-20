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
        <div className={`flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border-2 border-dashed transition-all duration-300 ${isDark
                ? 'bg-white/5 border-white/10'
                : 'bg-gray-50 border-gray-200'
            } ${className}`}>
            {Icon && (
                <div className={`mb-4 p-4 rounded-full ${isDark ? 'bg-white/10 text-white/80' : 'bg-gray-100 text-gray-400'
                    }`}>
                    <Icon size={32} />
                </div>
            )}

            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'
                }`}>
                {title}
            </h3>

            {description && (
                <p className={`text-sm mb-6 max-w-sm mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                    {description}
                </p>
            )}

            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-[#00B8A9] rounded-xl hover:bg-[#00A89A] transition-colors shadow-lg shadow-[#00B8A9]/20"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
