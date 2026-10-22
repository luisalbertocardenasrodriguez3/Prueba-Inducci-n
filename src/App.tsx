/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Award,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  FileText,
  UserCheck,
  ArrowRight,
  RotateCcw,
  BotMessageSquare,
  Zap,
  HelpCircle,
  FileSpreadsheet,
  Lock,
  Eye,
  LayoutDashboard,
  Share2,
  LogOut,
} from 'lucide-react';
import { Header } from './components/Header';
import { ModuleList } from './components/ModuleList';
import { ModuleDetailModal } from './components/ModuleDetailModal';
import { PlanEstructuradoModal } from './components/PlanEstructuradoModal';
import { LearnerProfileModal } from './components/LearnerProfileModal';
import { BadgesModal } from './components/BadgesModal';
import { FinalEvaluation } from './components/FinalEvaluation';
import { CertificateView } from './components/CertificateView';
import { CertificateVerificationModal } from './components/CertificateVerificationModal';
import { SenaAiAssistant } from './components/SenaAiAssistant';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { InstructorDashboard } from './components/InstructorDashboard';
import { InstructorAccessModal } from './components/InstructorAccessModal';
import { RoleSelectionLanding } from './components/RoleSelectionLanding';
import { SenaLogo } from './components/SenaLogo';
import {
  DEFAULT_LEARNER,
  SENA_MODULES,
  SENA_BADGES,
  STRUCTURED_INDUCTION_PLAN,
} from './data/senaRegulationData';
import {
  LearnerProfile,
  ModuleData,
  UserGameState,
  UserRole,
  InstructorActiveTab,
} from './types/induction';
import { soundManager } from './utils/soundEffects';
import { triggerAutoSync, setAutoSyncUser } from './services/autoSyncService';
import { initAuth } from './services/googleAuth';

const INITIAL_GAME_STATE: UserGameState = {
  xp: 120,
  level: 1,
  streak: 3,
  completedModules: [],
  moduleScores: {},
  unlockedBadges: [],
  evaluationCompleted: false,
  evaluationScore: 0,
  lastActiveDate: new Date().toISOString(),
  soundEnabled: true,
};

export default function App() {
  // Role Detection: Check URL query param first (?role=aprendiz or ?role=instructor)
  const [role, setRole] = useState<UserRole>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRole = params.get('role');
      if (urlRole === 'aprendiz' || urlRole === 'instructor') {
        localStorage.setItem('sena_user_role', urlRole);
        return urlRole;
      }
      const savedRole = localStorage.getItem('sena_user_role');
      if (savedRole === 'aprendiz' || savedRole === 'instructor') {
        return savedRole;
      }
    }
    // Default to instructor so the user testing right now can manage the sheet & copy apprentice link
    return 'instructor';
  });

  // Landing Page display state
  const [isOnLandingPage, setIsOnLandingPage] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'landing') return true;
      if (params.get('role')) return true;
      const sessionActive = sessionStorage.getItem('sena_session_active');
      if (!sessionActive) return true;
    }
    return false;
  });

  // Default mode for Landing Page ('select' | 'aprendiz_form' | 'instructor_login')
  const [landingMode, setLandingMode] = useState<'select' | 'aprendiz_form' | 'instructor_login'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('role') === 'aprendiz') return 'aprendiz_form';
      if (params.get('role') === 'instructor') return 'instructor_login';
    }
    return 'select';
  });

  // Active view for instructor (dashboard vs induction preview)
  const [instructorTab, setInstructorTab] = useState<InstructorActiveTab>('dashboard');

  // Instructor access modal state
  const [isInstructorAccessOpen, setIsInstructorAccessOpen] = useState(false);

  // Persistent learner profile
  const [learner, setLearner] = useState<LearnerProfile>(() => {
    const saved = localStorage.getItem('sena_learner_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_LEARNER;
  });

  // Inspected certificate (when instructor inspects an apprentice from roster)
  const [inspectedCertificate, setInspectedCertificate] = useState<{
    learner: LearnerProfile;
    score: number;
  } | null>(null);

  // Persistent gamification state
  const [gameState, setGameState] = useState<UserGameState>(() => {
    const saved = localStorage.getItem('sena_induction_gamestate');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_GAME_STATE;
  });

  // Light / Dark mode theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('sena_theme');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  const isDark = theme === 'dark';
  const isInstructor = role === 'instructor';

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Modals visibility state
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isGoogleSheetsOpen, setIsGoogleSheetsOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<ModuleData | null>(null);
  const [isFinalExamOpen, setIsFinalExamOpen] = useState(false);
  const [showCertificateView, setShowCertificateView] = useState(false);
  const [isVerifierOpen, setIsVerifierOpen] = useState(false);
  const [verifierCode, setVerifierCode] = useState('');

  // Persist role
  useEffect(() => {
    localStorage.setItem('sena_user_role', role);
  }, [role]);

  // Persist theme
  useEffect(() => {
    localStorage.setItem('sena_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  // Persist learner
  useEffect(() => {
    localStorage.setItem('sena_learner_profile', JSON.stringify(learner));
  }, [learner]);

  // Persist game state
  useEffect(() => {
    localStorage.setItem('sena_induction_gamestate', JSON.stringify(gameState));
    soundManager.setMuted(!gameState.soundEnabled);
  }, [gameState]);

  // Synchronize Google Auth state for AutoSync
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setAutoSyncUser(user);
      },
      () => {
        setAutoSyncUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleToggleSound = () => {
    setGameState((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  };

  const handleModuleSelect = (mod: ModuleData) => {
    setSelectedModule(mod);
  };

  const handleModuleComplete = (moduleId: string, score: number) => {
    let nextState: UserGameState | null = null;
    setGameState((prev) => {
      const alreadyDone = prev.completedModules.includes(moduleId);
      const mod = SENA_MODULES.find((m) => m.id === moduleId);
      const newCompleted = alreadyDone
        ? prev.completedModules
        : [...prev.completedModules, moduleId];

      const gainedXp = alreadyDone ? Math.round(score / 2) : (mod?.xpReward || 150) + score;
      const totalXp = prev.xp + gainedXp;
      const newLevel = Math.floor(totalXp / 250) + 1;

      // Unlock module badge
      const newBadges = [...prev.unlockedBadges];
      if (mod?.badgeId && !newBadges.includes(mod.badgeId)) {
        newBadges.push(mod.badgeId);
        soundManager.playBadgeUnlock();
      }

      nextState = {
        ...prev,
        xp: totalXp,
        level: newLevel,
        completedModules: newCompleted,
        moduleScores: {
          ...prev.moduleScores,
          [moduleId]: Math.max(prev.moduleScores[moduleId] || 0, score),
        },
        unlockedBadges: newBadges,
      };
      return nextState;
    });

    if (nextState) {
      triggerAutoSync(learner, nextState);
    }

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#39A900', '#22C55E', '#FFFFFF'],
    });

    setSelectedModule(null);
  };

  const handleFinalExamSuccess = (scorePercentage: number) => {
    let nextState: UserGameState | null = null;
    setGameState((prev) => {
      const newBadges = [...prev.unlockedBadges];
      if (!newBadges.includes('badge_certificado')) {
        newBadges.push('badge_certificado');
      }
      nextState = {
        ...prev,
        xp: prev.xp + 300,
        level: Math.floor((prev.xp + 300) / 250) + 1,
        evaluationCompleted: true,
        evaluationScore: scorePercentage,
        unlockedBadges: newBadges,
      };
      return nextState;
    });

    if (nextState) {
      triggerAutoSync(learner, nextState);
    }
  };

  // Demo helper for instructor testing
  const handleQuickDemoFill = () => {
    soundManager.playCorrect();
    const demoState: UserGameState = {
      xp: 950,
      level: 4,
      streak: 5,
      completedModules: SENA_MODULES.map((m) => m.id),
      moduleScores: {
        m1_identidad: 100,
        m2_derechos: 95,
        m3_deberes: 90,
        m4_prohibiciones_faltas: 100,
        m5_etapas_novedades: 90,
      },
      unlockedBadges: SENA_BADGES.map((b) => b.id),
      evaluationCompleted: true,
      evaluationScore: 92,
      lastActiveDate: new Date().toISOString(),
      soundEnabled: true,
    };
    setGameState(demoState);
    triggerAutoSync(learner, demoState);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.5 },
    });
  };

  const handleResetProgress = () => {
    if (window.confirm('¿Deseas reiniciar todo el progreso de la inducción?')) {
      setGameState(INITIAL_GAME_STATE);
      setShowCertificateView(false);
    }
  };

  const completedCount = gameState.completedModules.length;
  const overallProgressPercentage = Math.round(
    ((completedCount + (gameState.evaluationCompleted ? 1 : 0)) /
      (SENA_MODULES.length + 1)) *
      100
  );

  const handleExitToLanding = () => {
    sessionStorage.removeItem('sena_session_active');
    if (typeof window !== 'undefined' && window.history) {
      window.history.replaceState({}, '', window.location.pathname);
    }
    setShowCertificateView(false);
    setInspectedCertificate(null);
    setSelectedModule(null);
    setIsFinalExamOpen(false);
    setIsPlanOpen(false);
    setIsProfileOpen(false);
    setIsBadgesOpen(false);
    setIsAssistantOpen(false);
    setIsGoogleSheetsOpen(false);
    setLandingMode('select');
    setIsOnLandingPage(true);
  };

  if (isOnLandingPage) {
    return (
      <RoleSelectionLanding
        initialLearner={learner}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        defaultMode={landingMode}
        onSelectAprendiz={(newProfile) => {
          setLearner(newProfile);
          setRole('aprendiz');
          setIsOnLandingPage(false);
          sessionStorage.setItem('sena_session_active', 'aprendiz');
          triggerAutoSync(newProfile, gameState);
        }}
        onSelectInstructor={() => {
          setRole('instructor');
          setInstructorTab('dashboard');
          setIsOnLandingPage(false);
          sessionStorage.setItem('sena_session_active', 'instructor');
        }}
      />
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'
      }`}
    >
      {/* Top Header */}
      <Header
        learner={learner}
        gameState={gameState}
        theme={theme}
        currentRole={role}
        activeInstructorTab={instructorTab}
        onToggleTheme={handleToggleTheme}
        onToggleSound={handleToggleSound}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenPlan={() => setIsPlanOpen(true)}
        onOpenBadges={() => setIsBadgesOpen(true)}
        onOpenGoogleSheets={() => setIsGoogleSheetsOpen(true)}
        onOpenInstructorAccess={() => setIsInstructorAccessOpen(true)}
        onSwitchToInstructorDashboard={() => {
          setInstructorTab('dashboard');
          setShowCertificateView(false);
          setInspectedCertificate(null);
        }}
        onSwitchToLearnerView={() => {
          setInstructorTab('induction_preview');
        }}
        onCopyApprenticeLink={() => {
          const url = `${window.location.origin}${window.location.pathname}?role=aprendiz`;
          navigator.clipboard.writeText(url);
        }}
        onOpenCertificate={() => {
          if (gameState.evaluationCompleted) {
            setShowCertificateView(true);
          } else {
            setIsFinalExamOpen(true);
          }
        }}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onExitToLanding={handleExitToLanding}
      />

      {/* Instructor Preview Bar: shown when instructor is previewing apprentice view */}
      {isInstructor && instructorTab === 'induction_preview' && (
        <div className="bg-emerald-700 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs sm:text-sm font-semibold sticky top-[69px] z-30">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-200" />
              <span>
                <strong>Modo Vista Previa de Aprendiz:</strong> Está viendo la inducción tal como la reciben sus aprendices.
              </span>
            </div>
            <button
              onClick={() => setInstructorTab('dashboard')}
              className="px-3 py-1 rounded-xl bg-white text-emerald-800 font-bold hover:bg-emerald-50 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Volver al Panel de Instructor</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* VIEW 1: Inspected certificate (instructor inspecting a student) */}
        {inspectedCertificate ? (
          <CertificateView
            learner={inspectedCertificate.learner}
            scorePercentage={inspectedCertificate.score}
            onBack={() => setInspectedCertificate(null)}
            onOpenVerifier={(code) => {
              setVerifierCode(code);
              setIsVerifierOpen(true);
            }}
            onEditProfile={() => {}}
          />
        ) : showCertificateView ? (
          /* VIEW 2: Learner's own Certificate View */
          <CertificateView
            learner={learner}
            scorePercentage={gameState.evaluationScore || 90}
            onBack={() => setShowCertificateView(false)}
            onOpenVerifier={(code) => {
              setVerifierCode(code);
              setIsVerifierOpen(true);
            }}
            onEditProfile={() => setIsProfileOpen(true)}
          />
        ) : isInstructor && instructorTab === 'dashboard' ? (
          /* VIEW 3: Instructor Dashboard (privileged oversight, live roster, Google Sheets) */
          <InstructorDashboard
            currentLearner={learner}
            currentGameState={gameState}
            theme={theme}
            onOpenGoogleSheetsModal={() => setIsGoogleSheetsOpen(true)}
            onSwitchToLearnerView={() => setInstructorTab('induction_preview')}
            onPreviewCertificate={(l, s) => {
              setInspectedCertificate({ learner: l, score: s });
            }}
            onExitToLanding={handleExitToLanding}
          />
        ) : (
          /* VIEW 4: Apprentice Induction View (Modules, challenges, exam) */
          <>
            {/* Hero Welcome Banner */}
            <div
              className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 transition-colors duration-300 shadow-2xl ${
                isDark
                  ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/80 border-emerald-500/30 shadow-emerald-950/40 text-white'
                  : 'bg-gradient-to-br from-white via-emerald-50/70 to-slate-50 border-emerald-500/30 shadow-emerald-950/5 text-slate-900'
              }`}
            >
              {/* Background watermark */}
              <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none">
                <SenaLogo className="w-80 h-80" />
              </div>

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs border ${
                        isDark
                          ? 'text-[#39A900] bg-emerald-950/90 border-emerald-500/40'
                          : 'text-[#39A900] bg-emerald-100/80 border-emerald-300'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Inducción Gamificada SENA 2024 - 2026
                    </span>
                    <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Acuerdo 009 de 2024
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                      Modo Aprendiz
                    </span>
                  </div>

                  <h1
                    className={`text-2xl sm:text-3xl md:text-4xl font-extrabold font-['Space_Grotesk'] leading-tight ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    ¡Bienvenido(a),{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-lime-500">
                      {learner.fullName}
                    </span>
                    !
                  </h1>

                  <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Apropia tus derechos, deberes y el nuevo reglamento institucional a través de retos interactivos, simuladores de dilemas éticos y evaluaciones gamificadas. Al superar la ruta, obtendrás tu <strong className="text-emerald-500">Certificado Oficial de Inducción con código QR</strong>.
                  </p>

                  <div className={`flex flex-wrap items-center gap-4 text-xs pt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <div className="flex items-center gap-1.5">
                      <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>Programa:</strong> {learner.programaFormacion}
                    </div>
                    <div className={`h-3 w-px hidden sm:block ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
                    <div className="flex items-center gap-1.5 font-mono">
                      <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>Ficha:</strong> {learner.numeroFicha}
                    </div>
                    <div className={`h-3 w-px hidden sm:block ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
                    <div className="flex items-center gap-1.5">
                      <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>Regional:</strong> {learner.regional}
                    </div>
                  </div>
                </div>

                {/* Progress Card on right */}
                <div
                  className={`border rounded-2xl p-5 shrink-0 w-full lg:w-80 space-y-4 shadow-xl transition-colors ${
                    isDark
                      ? 'bg-slate-900/90 border-emerald-500/30'
                      : 'bg-white border-emerald-500/30 shadow-slate-200/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Progreso de Inducción
                    </span>
                    <span className="text-base font-black text-emerald-500 font-mono">
                      {overallProgressPercentage}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className={`w-full h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                    <div
                      className="bg-gradient-to-r from-emerald-500 via-lime-400 to-emerald-400 h-full rounded-full transition-all duration-700 shadow-md shadow-emerald-500/40"
                      style={{ width: `${overallProgressPercentage}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className={`p-2 rounded-xl border ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {completedCount}/{SENA_MODULES.length}
                      </div>
                      <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Módulos Listos</div>
                    </div>
                    <div className={`p-2 rounded-xl border ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="font-bold text-amber-500 text-sm">
                        {gameState.evaluationCompleted ? 'Aprobado' : 'Pendiente'}
                      </div>
                      <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Evaluación Final</div>
                    </div>
                  </div>


                </div>
              </div>

              {/* Developer / Instructor Quick Bar: ONLY shown if instructor is previewing, NEVER shown to apprentice */}
              {isInstructor ? (
                <div
                  className={`mt-6 pt-4 border-t flex flex-wrap items-center justify-between gap-3 text-xs ${
                    isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold text-emerald-500`}>Herramientas de Instructor:</span>
                    <button
                      onClick={handleQuickDemoFill}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                        isDark
                          ? 'bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/30'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                      title="Completa todos los retos instantáneamente para verificar el certificado"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>Completar Ruta de Prueba (Demo 100%)</span>
                    </button>
                    <button
                      onClick={() => setIsGoogleSheetsOpen(true)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                        isDark
                          ? 'bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border-emerald-500/40'
                          : 'bg-emerald-100/90 hover:bg-emerald-200 text-emerald-900 border-emerald-400'
                      }`}
                      title="Configuración de hoja en Google Drive"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Google Sheets (Drive)</span>
                    </button>
                    <button
                      onClick={handleResetProgress}
                      className={`px-2 py-1 rounded-lg border text-[11px] transition-colors ${
                        isDark
                          ? 'bg-slate-900 hover:bg-rose-950/50 hover:text-rose-300 text-slate-400 border-slate-800'
                          : 'bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-600 border-slate-200'
                      }`}
                    >
                      <RotateCcw className="w-3 h-3 inline mr-1" />
                      Reiniciar
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsAssistantOpen(true)}
                      className="text-emerald-500 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <BotMessageSquare className="w-3.5 h-3.5" />
                      Tutor Virtual SENA
                    </button>
                  </div>
                </div>
              ) : (
                /* Apprentice info bar */
                <div
                  className={`mt-6 pt-4 border-t flex flex-wrap items-center justify-between gap-3 text-xs ${
                    isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px]">
                      Tus avances se guardan automáticamente y son reportados al instructor de tu ficha.
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsAssistantOpen(true)}
                      className="text-emerald-500 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <BotMessageSquare className="w-3.5 h-3.5" />
                      ¿Dudas sobre el Acuerdo 009? Pregunta al Tutor SENA
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Induction Roadmap / Modules */}
            <div className="space-y-4">
              <div
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 ${
                  isDark ? 'border-slate-800/80' : 'border-slate-200'
                }`}
              >
                <div>
                  <h2
                    className={`text-xl sm:text-2xl font-black font-['Space_Grotesk'] flex items-center gap-2 ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    <BookOpen className="w-6 h-6 text-emerald-500" />
                    <span>Estaciones Formativas (Reglamento del Aprendiz)</span>
                  </h2>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Supera los retos de cada estación para desbloquear la evaluación final y tu certificado.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => setIsBadgesOpen(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                      isDark
                        ? 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>Ver Insignias ({gameState.unlockedBadges.length}/6)</span>
                  </button>
                </div>
              </div>

              {/* Module Cards Grid */}
              {/* Apprentice View Header Banner */}
          <div className="bg-amber-600 text-white px-4 py-2 rounded-2xl shadow-md flex items-center justify-between text-xs font-semibold mb-6 sticky top-20 z-30">
            <div className="flex items-center gap-2">
              <span className="opacity-90">Estás en Modo Aprendiz (Ficha {learner.numeroFicha})</span>
            </div>
            <button
              onClick={handleExitToLanding}
              className="px-3 py-1 rounded-xl bg-white text-amber-700 font-bold hover:bg-amber-50 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>

          <ModuleList
                modules={SENA_MODULES}
                completedModules={gameState.completedModules}
                moduleScores={gameState.moduleScores}
                onSelectModule={handleModuleSelect}
                onOpenFinalExam={() => setIsFinalExamOpen(true)}
                evaluationCompleted={gameState.evaluationCompleted}
                evaluationScore={gameState.evaluationScore}
                theme={theme}
              />
            </div>
          </>
        )}
      </main>





      {/* MODALS */}
      {/* 1. Module detail & challenge modal */}
      {selectedModule && (
        <ModuleDetailModal
          module={selectedModule}
          isOpen={Boolean(selectedModule)}
          onClose={() => setSelectedModule(null)}
          onModuleComplete={handleModuleComplete}
          isCompleted={gameState.completedModules.includes(selectedModule.id)}
        />
      )}

      {/* 2. Structured Plan modal */}
      <PlanEstructuradoModal
        isOpen={isPlanOpen}
        onClose={() => setIsPlanOpen(false)}
      />

      {/* 3. Learner Profile modal */}
      <LearnerProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        learner={learner}
        onSave={(updated) => {
          setLearner(updated);
          triggerAutoSync(updated, gameState);
        }}
      />

      {/* 4. Badges modal */}
      <BadgesModal
        isOpen={isBadgesOpen}
        onClose={() => setIsBadgesOpen(false)}
        unlockedBadgeIds={gameState.unlockedBadges}
      />

      {/* 5. Final Comprehensive Evaluation modal */}
      <FinalEvaluation
        isOpen={isFinalExamOpen}
        onClose={() => setIsFinalExamOpen(false)}
        onSuccess={handleFinalExamSuccess}
        onOpenCertificate={() => {
          setIsFinalExamOpen(false);
          setShowCertificateView(true);
        }}
        previouslyPassed={gameState.evaluationCompleted}
        previousScore={gameState.evaluationScore}
      />

      {/* 6. Certificate Verification modal */}
      <CertificateVerificationModal
        isOpen={isVerifierOpen}
        onClose={() => setIsVerifierOpen(false)}
        initialCode={verifierCode}
        learner={learner}
        scorePercentage={gameState.evaluationScore || 90}
      />

      {/* 7. AI Assistant modal */}
      <SenaAiAssistant
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onOpenGoogleSheets={() => {
          setIsAssistantOpen(false);
          if (isInstructor) {
            setIsGoogleSheetsOpen(true);
          }
        }}
      />

      {/* 8. Google Sheets (Drive) integration modal (Instructor only) */}
      <GoogleSheetsModal
        isOpen={isGoogleSheetsOpen}
        onClose={() => setIsGoogleSheetsOpen(false)}
        learner={learner}
        gameState={gameState}
        theme={theme}
      />

      {/* 9. Instructor Access PIN modal */}
      <InstructorAccessModal
        isOpen={isInstructorAccessOpen}
        onClose={() => setIsInstructorAccessOpen(false)}
        onSuccess={() => {
          setRole('instructor');
          setInstructorTab('dashboard');
        }}
        theme={theme}
      />
    </div>
  );
}
