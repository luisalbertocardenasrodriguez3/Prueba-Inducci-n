import React from 'react';
import { Languages, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { soundManager } from '../utils/soundEffects';

interface LanguageToggleProps {
  theme?: 'dark' | 'light';
  variant?: 'compact' | 'full';
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  theme = 'dark',
  variant = 'compact',
  className = '',
}) => {
  const { language, toggleLanguage, t } = useLanguage();
  const isDark = theme === 'dark';

  const handleClick = () => {
    soundManager.playClick();
    toggleLanguage();
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className={`group relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border font-bold text-xs transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm cursor-pointer select-none ${
        isDark
          ? 'bg-slate-900/80 hover:bg-slate-800 border-slate-700/80 hover:border-emerald-500/50 text-slate-200'
          : 'bg-white hover:bg-emerald-50 border-slate-200 hover:border-emerald-400 text-slate-800 shadow-xs'
      } ${className}`}
      title={t('lang_switch_tooltip')}
      aria-label="Cambiar idioma entre Español e Inglés"
    >
      <Globe className="w-3.5 h-3.5 text-emerald-500 group-hover:rotate-45 transition-transform duration-300 shrink-0" />
      
      {/* Visual pill showing ES and EN with the active one highlighted */}
      <div className="flex items-center gap-0.5 text-[11px] font-mono tracking-tight">
        <span
          className={`px-1.5 py-0.5 rounded-md transition-all ${
            language === 'es'
              ? 'bg-emerald-600 text-white font-black shadow-xs'
              : isDark
              ? 'text-slate-400 group-hover:text-slate-200'
              : 'text-slate-500 group-hover:text-slate-800'
          }`}
        >
          ES
        </span>
        <span className="text-slate-400 text-[10px] opacity-60">/</span>
        <span
          className={`px-1.5 py-0.5 rounded-md transition-all ${
            language === 'en'
              ? 'bg-emerald-600 text-white font-black shadow-xs'
              : isDark
              ? 'text-slate-400 group-hover:text-slate-200'
              : 'text-slate-500 group-hover:text-slate-800'
          }`}
        >
          EN
        </span>
      </div>

      {variant === 'full' && (
        <span className="hidden md:inline font-sans text-[11px] font-semibold text-slate-400">
          {language === 'es' ? 'Español' : 'English'}
        </span>
      )}
    </button>
  );
};
