import React, { useContext } from 'react';
import { Sun, Moon } from 'lucide-react';
import { AuthContext } from '../context/AuthAppContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useContext(AuthContext);

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-full flex items-center justify-center border border-border/50 hover:bg-muted text-foreground transition-all duration-300 overflow-hidden cursor-pointer"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className={`transition-all duration-500 transform ${
        theme === 'dark' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
      }`}>
        <Sun className="w-5 h-5 text-amber-500" />
      </div>
      <div className={`absolute transition-all duration-500 transform ${
        theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
      }`}>
        <Moon className="w-5 h-5 text-indigo-400" />
      </div>
    </button>
  );
}
