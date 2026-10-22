import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Flame,
  Volume2,
  VolumeX,
  FileText,
  User,
  GraduationCap,
  Sparkles,
  BotMessageSquare,
  Sun,
  Moon,
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Lock,
  Share2,
  Check,
  LayoutDashboard,
  Eye,
  LogOut,
} from 'lucide-react';
import { SenaLogo } from './SenaLogo';
import { LearnerProfile, UserGameState, UserRole, InstructorActiveTab } from '../types/induction';
import { soundManager } from '../utils/soundEffects';
import {
  subscribeAutoSync,
  getAutoSyncState,
  AutoSyncState,
} from '../services/autoSyncService';

interface HeaderProps {
  learner: LearnerProfile;
  gameState: UserGameState;
  theme: 'dark' | 'light';
  currentRole: UserRole;
  activeInstructorTab?: InstructorActiveTab;
  onToggleTheme: () => void;
  onToggleSound: () => void;
  onOpenProfile: () => void;
  onOpenPlan: () => void;
  onOpenBadges: () => void;
  onOpenCertificate: () => void;
  onOpenAssistant: () => void;
  onOpenGoogleSheets: () => void;
  onOpenInstructorAccess: () => void;
  onSwitchToInstructorDashboard?: () => void;
  onSwitchToLearnerView?: () => void;
  onCopyApprenticeLink?: () => void;
  onExitToLanding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  learner,
  gameState,
  theme,
  currentRole,
  activeInstructorTab = 'dashboard',
  onToggleTheme,
  onToggleSound,
  onOpenProfile,
  onOpenPlan,
  onOpenBadges,
  onOpenCertificate,
  onOpenAssistant,
  onOpenGoogleSheets,
  onOpenInstructorAccess,
  onSwitchToInstructorDashboard,
  onSwitchToLearnerView,
  onCopyApprenticeLink,
  onExitToLanding,
}) => {
  const [autoSync, setAutoSync] = useState<AutoSyncState>(getAutoSyncState);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeAutoSync((state) => {
      setAutoSync(state);
    });
    return () => unsubscribe();
  }, []);

  const getLevelTitle = (lvl: number) => {
    if (lvl <= 1) return 'Aprendiz Novato';
    if (lvl === 2) return 'Aprendiz Consciente';
    if (lvl === 3) return 'Líder Vocero';
    return 'Embajador SENA';
  };

  const currentLevelProgress = Math.min(100, Math.round((gameState.xp % 250) / 2.5));
  const isDark = theme === 'dark';
  const isInstructor = currentRole === 'instructor';

  const handleCopyLink = () => {
    if (onCopyApprenticeLink) {
      onCopyApprenticeLink();
    } else {
      const url = `${window.location.origin}${window.location.pathname}?role=aprendiz`;
      navigator.clipboard.writeText(url);
    }
    soundManager.playCorrect();
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors duration-300 shadow-lg ${
        isDark
          ? 'bg-slate-950/85 border-emerald-500/20 shadow-black/40 text-slate-100'
          : 'bg-white/85 border-emerald-500/30 shadow-slate-200/60 text-slate-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Theme Switcher & Institutional Branding */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => {
              soundManager.playClick();
              onToggleTheme();
            }}
            className={`group relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl backdrop-blur-xl border transition-all duration-300 shadow-md hover:scale-105 active:scale-95 ${
              isDark
                ? 'bg-slate-900/70 hover:bg-slate-800/80 border-amber-400/40 hover:border-amber-400/80 text-amber-300 shadow-black/40'
                : 'bg-white/80 hover:bg-emerald-50 border-emerald-500/40 hover:border-emerald-600 text-emerald-800 shadow-emerald-900/10'
            }`}
            title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            aria-label="Cambiar tema de color"
          >
            <div
              className={`p-1 rounded-xl transition-transform duration-300 ${
                isDark
                  ? 'bg-amber-400/15 text-amber-400 group-hover:rotate-45'
                  : 'bg-emerald-500/15 text-emerald-600 group-hover:-rotate-12'
              }`}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-emerald-600 transition-transform" />
              )}
            </div>
            <span className="text-xs sm:text-sm font-bold tracking-tight hidden md:inline">
              {isDark ? 'Modo Claro' : 'Modo Oscuro'}
            </span>
          </button>

          <div className={`h-8 w-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

          <SenaLogo variant="full" className="scale-110 sm:scale-125 origin-left" />

          {/* Institutional Role Label */}
          <div className={`hidden md:flex flex-col border-l pl-3.5 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <span className="text-xs sm:text-sm font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${isInstructor ? 'bg-emerald-400' : 'bg-emerald-500 animate-pulse'}`} />
              {isInstructor ? 'Panel de Instructor SENA' : 'Inducción 2024-2026'}
            </span>
            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isInstructor ? 'Gestión y Seguimiento' : 'Reglamento Acuerdo 009/2024'}
            </span>
          </div>
        </div>



        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {isInstructor ? (
            /* Instructor privileged controls */
            <>
              {/* Share Apprentice Link Button */}
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all hover:scale-105 active:scale-95 shadow-xs ${
                  copiedLink
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : isDark
                    ? 'bg-slate-900 hover:bg-slate-800 text-emerald-400 border-emerald-500/40'
                    : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-300'
                }`}
                title="Copiar enlace directo para enviar a los aprendices"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>¡Enlace Copiado!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Compartir Enlace</span>
                  </>
                )}
              </button>

              {/* Google Sheets Modal Button (Instructor Only) */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onOpenGoogleSheets();
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all hover:scale-102 cursor-pointer ${
                    autoSync.status === 'syncing'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                      : autoSync.status === 'synced'
                      ? 'bg-[#39A900]/15 hover:bg-[#39A900]/25 text-emerald-300 border-[#39A900]/40'
                      : isDark
                      ? 'bg-[#39A900]/10 hover:bg-[#39A900]/20 text-emerald-300 border-[#39A900]/30'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-[#256e00] border-emerald-300'
                  }`}
                  title="Configuración de hoja en Google Drive"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#39A900]" />
                  <span className="hidden lg:inline">Google Sheets</span>
                  {autoSync.status === 'synced' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </button>

                {autoSync.spreadsheet?.url && (
                  <a
                    href={autoSync.spreadsheet.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-xl border transition-all hover:scale-105 shrink-0 ${
                      isDark
                        ? 'bg-slate-900/90 hover:bg-slate-800 text-emerald-400 border-slate-700/60'
                        : 'bg-white hover:bg-emerald-50 text-emerald-600 border-slate-200'
                    }`}
                    title="Abrir hoja de cálculo directamente en Google Drive / Sheets"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </>
          ) : (
            /* Aprendiz controls */
            <>
              {/* Plan Inducción button */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  onOpenPlan();
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                  isDark
                    ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/60'
                    : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-200 shadow-xs'
                }`}
                title="Ver Plan Estructurado de Inducción"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                <span className="hidden lg:inline">Plan Inducción</span>
              </button>

              {/* Tutor SENA */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  onOpenAssistant();
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all hover:scale-105 ${
                  isDark
                    ? 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/40'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 shadow-xs'
                }`}
                title="Preguntarle al Tutor IA de Inducción SENA"
              >
                <BotMessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Tutor SENA</span>
              </button>

              {/* Discreet AutoSync Indicator for Aprendiz (No modal button) */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-mono ${
                  autoSync.status === 'synced'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : autoSync.status === 'syncing'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
                title="Autoguardado institucional: Su avance se registra en la base de datos oficial"
              >
                {autoSync.status === 'syncing' ? (
                  <>
                    <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                    <span className="hidden xl:inline">Guardando...</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="hidden xl:inline">Autoguardado Activo</span>
                  </>
                )}
              </div>

              {/* Certificate button */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  onOpenCertificate();
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs shadow-md transition-all ${
                  gameState.evaluationCompleted
                    ? 'bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-500 hover:to-lime-500 text-white shadow-emerald-900/30 animate-pulse'
                    : isDark
                    ? 'bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-700/80'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
                }`}
                title="Ver o generar Certificado Oficial"
              >
                <GraduationCap className={`w-3.5 h-3.5 ${gameState.evaluationCompleted ? 'text-white' : 'text-amber-500'}`} />
                <span className="hidden sm:inline">Certificado</span>
              </button>

              {/* Profile button */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  onOpenProfile();
                }}
                className={`flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border text-left transition-all hover:border-emerald-500/50 ${
                  isDark
                    ? 'bg-slate-900 hover:bg-slate-850 border-slate-800'
                    : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
                }`}
                title="Mis datos de aprendiz"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-600/20 border border-emerald-500/50 flex items-center justify-center text-emerald-600 text-xs font-extrabold">
                  {learner.fullName.charAt(0)}
                </div>
                <div className="hidden xl:flex flex-col leading-none">
                  <span className={`text-[11px] font-semibold truncate max-w-[100px] ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {learner.fullName.split(' ')[0]}
                  </span>
                  <span className={`text-[9px] truncate max-w-[100px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Ficha {learner.numeroFicha}
                  </span>
                </div>
              </button>


            </>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => {
              soundManager.playClick();
              onToggleSound();
            }}
            className={`p-2 rounded-xl border transition-colors ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
                : 'bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border-slate-200'
            }`}
            title={gameState.soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
          >
            {gameState.soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>


        </div>
      </div>
    </header>
  );
};
