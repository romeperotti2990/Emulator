import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'dark') {
            return true;
        }
        return false;
    });

    // Apply theme to DOM whenever isDark changes
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            let darkStyleEl = document.getElementById('dark-mode-override');
            if (!darkStyleEl) {
                darkStyleEl = document.createElement('style');
                darkStyleEl.id = 'dark-mode-override';
                document.head.appendChild(darkStyleEl);
            }
            darkStyleEl.innerHTML = `
              /* Dark mode - ensure body is dark */
              body { background-color: #111827 !important; color: #f3f4f6 !important; }
            `;
        } else {
            document.documentElement.classList.remove('dark');
            let darkStyleEl = document.getElementById('dark-mode-override');
            if (!darkStyleEl) {
                darkStyleEl = document.createElement('style');
                darkStyleEl.id = 'dark-mode-override';
                document.head.appendChild(darkStyleEl);
            }
            // Light mode - swap the default colors with the dark: variants
            darkStyleEl.innerHTML = `
              /* Light mode styles */
              body { background-color: #ffffff !important; color: #000000 !important; }
              
              :root:not(.dark) .bg-white { background-color: #ffffff !important; }
              :root:not(.dark) .bg-gray-50 { background-color: #f9fafb !important; }
              :root:not(.dark) .bg-gray-100 { background-color: #f3f4f6 !important; }
              :root:not(.dark) .bg-gray-200 { background-color: #e5e7eb !important; }
              :root:not(.dark) .bg-gray-800 { background-color: #1f2937 !important; }
              :root:not(.dark) .bg-gray-900 { background-color: #111827 !important; }
              
              :root:not(.dark) .text-black { color: #000000 !important; }
              :root:not(.dark) .text-gray-50 { color: #f9fafb !important; }
              :root:not(.dark) .text-gray-100 { color: #f3f4f6 !important; }
              :root:not(.dark) .text-gray-200 { color: #e5e7eb !important; }
              :root:not(.dark) .text-gray-300 { color: #d1d5db !important; }
              :root:not(.dark) .text-gray-500 { color: #6b7280 !important; }
              :root:not(.dark) .text-gray-600 { color: #4b5563 !important; }
              :root:not(.dark) .text-gray-700 { color: #374151 !important; }
              :root:not(.dark) .text-gray-900 { color: #111827 !important; }
              
              :root:not(.dark) .border-gray-200 { border-color: #e5e7eb !important; }
              :root:not(.dark) .border-gray-600 { border-color: #4b5563 !important; }
              
              :root:not(.dark) .hover\:bg-gray-100:hover { background-color: #f3f4f6 !important; }
              :root:not(.dark) .hover\:bg-gray-200:hover { background-color: #e5e7eb !important; }
              :root:not(.dark) .hover\:text-blue-600:hover { color: #2563eb !important; }
              :root:not(.dark) .hover\:text-blue-700:hover { color: #1d4ed8 !important; }
              
              :root:not(.dark) .focus\:ring-blue-400:focus { --tw-ring-color: #60a5fa !important; }
              
              /* Override dark hover styles in light mode */
              :root:not(.dark) .dark\:hover\:bg-gray-800:hover { background-color: #e5e7eb !important; }
              :root:not(.dark) .dark\:hover\:bg-gray-700:hover { background-color: #d1d5db !important; }
              :root:not(.dark) .dark\:hover\:text-blue-400:hover { color: #60a5fa !important; }
              
              /* Light mode hover overrides */
              :root:not(.dark) .hover\:bg-gray-800:hover { background-color: #e5e7eb !important; }
            `;
        }
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    const toggleTheme = useCallback(() => {
        setIsDark(prev => !prev);
    }, []);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
