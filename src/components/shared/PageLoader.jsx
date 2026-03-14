import { useTheme } from '../../contexts/ThemeContext';

export default function PageLoader() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    return (
        <div className={`fixed inset-0 flex items-center justify-center ${isDark ? 'bg-black' : 'bg-white'}`}>
            <div
                className="w-10 h-10 border-4 border-[#00B8A9] border-t-transparent rounded-full animate-spin"
                aria-label="Loading page"
                role="status"
            />
        </div>
    );
}
