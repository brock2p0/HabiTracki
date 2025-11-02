import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
          {isDarkMode ? (
            <Moon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          ) : (
            <Sun className="w-5 h-5 text-slate-700" />
          )}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Theme</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isDarkMode ? 'Dark mode' : 'Light mode'}
          </p>
        </div>
      </div>

      <button
        onClick={toggleTheme}
        className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-slate-300 dark:bg-[#10d46e]"
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        role="switch"
        aria-checked={isDarkMode}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
            isDarkMode ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

export default ThemeToggle;
