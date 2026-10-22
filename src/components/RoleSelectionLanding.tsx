import React, { useState } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Lock,
  ArrowRight,
  User,
  KeyRound,
  AlertCircle,
  Sparkles,
  BookOpen,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  Sun,
  Moon,
  ChevronRight,
  Eye,
  EyeOff,
  Building,
  Hash,
  Award,
  Play,
  Film,
} from 'lucide-react';
import { TutorialVideoModal } from './TutorialVideoModal';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '../context/LanguageContext';
import { SenaLogo } from './SenaLogo';
import { LearnerProfile, DocumentType } from '../types/induction';
import {
  SENA_REGIONALES,
  SENA_PROGRAMS_SAMPLE,
} from '../data/senaRegulationData';
import { soundManager } from '../utils/soundEffects';

interface RoleSelectionLandingProps {
  initialLearner: LearnerProfile;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onSelectAprendiz: (profile: LearnerProfile) => void;
  onSelectInstructor: () => void;
  defaultMode?: 'select' | 'aprendiz_form' | 'instructor_login';
}

export const RoleSelectionLanding: React.FC<RoleSelectionLandingProps> = ({
  initialLearner,
  theme,
  onToggleTheme,
  onSelectAprendiz,
  onSelectInstructor,
  defaultMode = 'select',
}) => {
  const { t, language } = useLanguage();
  const [mode, setMode] = useState<'select' | 'aprendiz_form' | 'instructor_login'>(defaultMode);

  // Instructor Password state
  const [instructorPassword, setInstructorPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [instructorError, setInstructorError] = useState<string | null>(null);
  
  // Tutorial Modal
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Aprendiz Characterization Form state
  const [formData, setFormData] = useState<LearnerProfile>(initialLearner);
  const [formError, setFormError] = useState<string | null>(null);

  const isDark = theme === 'dark';

  // Handle Instructor password submission
  const handleInstructorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInstructorError(null);

    // Clave requerida: SENA1234
    if (instructorPassword.trim() === 'SENA1234') {
      soundManager.playCorrect();
      onSelectInstructor();
    } else {
      soundManager.playIncorrect();
      setInstructorError('Clave incorrecta. Por favor verifica tus credenciales de instructor.');
    }
  };

  // Handle Aprendiz characterization submission
  const handleAprendizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.fullName.trim()) {
      setFormError('Por favor ingresa tus nombres y apellidos completos.');
      soundManager.playIncorrect();
      return;
    }

    if (!formData.documentNumber.trim()) {
      setFormError('Por favor ingresa tu número de documento de identidad.');
      soundManager.playIncorrect();
      return;
    }

    if (!formData.numeroFicha.trim()) {
      setFormError('Por favor ingresa el número de ficha de caracterización.');
      soundManager.playIncorrect();
      return;
    }

    soundManager.playCorrect();
    onSelectAprendiz(formData);
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 font-['Plus_Jakarta_Sans',sans-serif] ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
      }`}
    >
      {/* Top Navbar */}
      <header
        className={`w-full border-b backdrop-blur-xl px-4 sm:px-8 py-3.5 sticky top-0 z-40 transition-colors ${
          isDark
            ? 'bg-slate-950/80 border-emerald-500/20'
            : 'bg-white/80 border-slate-200 shadow-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SenaLogo variant="full" className="scale-110 sm:scale-125 origin-left" />
            <div className={`hidden md:flex flex-col border-l pl-3.5 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {t('portal_title')}
              </span>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('portal_subtitle')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Bilingual Switcher Button (ES | EN) */}
            <LanguageToggle theme={theme} variant="full" />

            {/* Theme Toggle */}
            <button
              onClick={() => {
                soundManager.playClick();
                onToggleTheme();
              }}
              className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all hover:scale-105 ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-amber-400 hover:border-amber-400/50'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-500 shadow-xs'
              }`}
              title={isDark ? t('theme_light') : t('theme_dark')}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-emerald-600" />}
              <span className="hidden sm:inline">{isDark ? t('theme_light') : t('theme_dark')}</span>
            </button>

            {/* Tutorial Video Button */}
            <button
              onClick={() => {
                soundManager.playClick();
                setIsTutorialOpen(true);
              }}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 shadow-sm cursor-pointer ${
                isDark
                  ? 'bg-emerald-950/70 hover:bg-emerald-900/80 border-emerald-500/50 text-emerald-300'
                  : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
              }`}
              title={t('watch_tutorial')}
            >
              <span className="w-5 h-5 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Play className="w-2.5 h-2.5 fill-white ml-0.5" />
              </span>
              <span className="hidden sm:inline">{t('watch_tutorial')}</span>
              <span className="sm:hidden">{t('watch_tutorial_short')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
        {mode === 'select' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Hero Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                {t('hero_badge')}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-['Space_Grotesk'] tracking-tight leading-tight">
                {t('hero_title')}
              </h1>

              <p className={`text-sm sm:text-base ${isDark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed`}>
                {t('hero_desc')}
              </p>
            </div>

            {/* Video Tutorial Interactive Banner */}
            <div
              onClick={() => {
                soundManager.playClick();
                setIsTutorialOpen(true);
              }}
              className={`max-w-4xl mx-auto w-full p-4 sm:p-5 rounded-3xl border-2 transition-all duration-300 cursor-pointer shadow-xl hover:shadow-2xl hover:-translate-y-0.5 flex flex-col sm:flex-row items-center justify-between gap-4 ${
                isDark
                  ? 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border-emerald-500/40 text-white hover:border-emerald-400'
                  : 'bg-gradient-to-r from-emerald-50 via-white to-lime-50/60 border-emerald-500/30 text-slate-800 hover:border-emerald-500 shadow-emerald-900/5'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-lime-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-900/30 group">
                  <Play className="w-7 h-7 fill-white ml-1 animate-pulse" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-lime-500"></span>
                  </span>
                </div>
                <div className="text-left space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                      <Film className="w-3 h-3" />
                      {t('tutorial_badge')}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                      1:37 min
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black font-['Space_Grotesk'] leading-tight">
                    {t('tutorial_banner_title')}
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {t('tutorial_banner_desc')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="shrink-0 w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-500 hover:to-lime-500 text-white font-black text-xs shadow-md shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                <span>{t('play_video')}</span>
              </button>
            </div>

            {/* 2 Big Role Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
              {/* Role 1: Aprendiz */}
              <div
                onClick={() => {
                  soundManager.playClick();
                  setMode('aprendiz_form');
                }}
                className={`group cursor-pointer rounded-3xl p-6 sm:p-8 border-2 transition-all duration-300 relative overflow-hidden shadow-xl hover:-translate-y-1.5 flex flex-col justify-between ${
                  isDark
                    ? 'bg-slate-900/90 hover:bg-slate-850 border-emerald-500/40 hover:border-emerald-400 shadow-emerald-950/30'
                    : 'bg-white hover:bg-emerald-50/40 border-emerald-500/30 hover:border-emerald-600 shadow-emerald-900/10'
                }`}
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#39A900] to-lime-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30 group-hover:scale-110 transition-transform">
                      <GraduationCap className="w-8 h-8" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                      {t('role_learner_badge')}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-2xl font-black font-['Space_Grotesk'] text-emerald-500">
                      {t('role_learner_title')}
                    </h2>
                    <p className={`text-xs sm:text-sm mt-2 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {t('role_learner_desc')}
                    </p>
                  </div>

                  <ul className={`space-y-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{t('role_learner_feat1')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{t('role_learner_feat2')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{t('role_learner_feat3')}</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-inherit">
                  <button className="w-full py-3 px-5 rounded-2xl bg-[#39A900] hover:bg-[#2d8500] text-white font-bold text-sm shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 group-hover:gap-3 transition-all">
                    <span>{t('role_learner_btn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Role 2: Instructor */}
              <div
                onClick={() => {
                  soundManager.playClick();
                  setMode('instructor_login');
                }}
                className={`group cursor-pointer rounded-3xl p-6 sm:p-8 border-2 transition-all duration-300 relative overflow-hidden shadow-xl hover:-translate-y-1.5 flex flex-col justify-between ${
                  isDark
                    ? 'bg-slate-900/90 hover:bg-slate-850 border-slate-700 hover:border-emerald-400 shadow-slate-950/40'
                    : 'bg-white hover:bg-slate-50 border-slate-300 hover:border-emerald-600 shadow-slate-200/60'
                }`}
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-8 h-8 text-emerald-500" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      {t('role_instructor_badge')}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-2xl font-black font-['Space_Grotesk'] text-slate-800 dark:text-white">
                      {t('role_instructor_title')}
                    </h2>
                    <p className={`text-xs sm:text-sm mt-2 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {t('role_instructor_desc')}
                    </p>
                  </div>

                  <ul className={`space-y-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{t('role_instructor_feat1')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{t('role_instructor_feat2')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{t('role_instructor_feat3')}</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-inherit">
                  <button className="w-full py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 group-hover:gap-3 transition-all border border-slate-700">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>{t('role_instructor_btn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODE: APRENDIZ CHARACTERIZATION FORM */}
        {mode === 'aprendiz_form' && (
          <div className="max-w-2xl mx-auto w-full animate-fadeIn">
            <div
              className={`rounded-3xl p-6 sm:p-8 border-2 shadow-2xl transition-all ${
                isDark
                  ? 'bg-slate-900 border-emerald-500/30 text-white'
                  : 'bg-white border-emerald-500/30 text-slate-900 shadow-emerald-900/10'
              }`}
            >
              {/* Back button & Tutorial link */}
              <div className="flex items-center justify-between gap-3 mb-5">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setMode('select');
                  }}
                  className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t('char_back')}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setIsTutorialOpen(true);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all hover:scale-105 cursor-pointer shadow-xs ${
                    isDark
                      ? 'bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-300 border-emerald-500/40'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}
                  title="Ver cómo llenar la caracterización y completar la inducción"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{t('char_tutorial_btn')}</span>
                </button>
              </div>

              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#39A900]/20 border border-[#39A900]/40 flex items-center justify-center text-[#39A900]">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-black font-['Space_Grotesk'] text-[#39A900]">
                    {t('char_title')}
                  </h2>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {t('char_subtitle')}
                  </p>
                </div>
              </div>

              {formError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-400 text-xs mb-5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleAprendizSubmit} className="space-y-4">
                {/* Full name */}
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {t('char_fullname')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder={t('char_fullname_ph')}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500'
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-600'
                    }`}
                  />
                </div>

                {/* Document Type & Number */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {t('char_doctype')}
                    </label>
                    <select
                      value={formData.documentType}
                      onChange={(e) => setFormData({ ...formData, documentType: e.target.value as DocumentType })}
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                        isDark
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <option value="CC">Cédula de Ciudadanía (CC)</option>
                      <option value="TI">Tarjeta de Identidad (TI)</option>
                      <option value="CE">Cédula de Extranjería (CE)</option>
                      <option value="PEP">Permiso Especial (PEP)</option>
                      <option value="PPT">Permiso por Protección Temporal (PPT)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {t('char_docnum')}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.documentNumber}
                      onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                      placeholder="Ej. 1020485921"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono outline-none transition-all ${
                        isDark
                          ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500'
                          : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-600'
                      }`}
                    />
                  </div>
                </div>

                {/* Regional & Ficha */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {t('char_regional')}
                    </label>
                    <select
                      value={formData.regional}
                      onChange={(e) => setFormData({ ...formData, regional: e.target.value })}
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                        isDark
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      {SENA_REGIONALES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {t('char_ficha')}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.numeroFicha}
                      onChange={(e) => setFormData({ ...formData, numeroFicha: e.target.value })}
                      placeholder="Ej. 2721458"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono outline-none transition-all ${
                        isDark
                          ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500'
                          : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-600'
                      }`}
                    />
                  </div>
                </div>

                {/* Centro de Formacion */}
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {t('char_center')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.centroFormacion}
                    onChange={(e) => setFormData({ ...formData, centroFormacion: e.target.value })}
                    placeholder="Ej. Centro de Gestión de Mercados, Logística y TIC"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500'
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-600'
                    }`}
                  />
                </div>

                {/* Programa de Formación & Modalidad */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {t('char_program')}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.programaFormacion}
                      onChange={(e) => setFormData({ ...formData, programaFormacion: e.target.value })}
                      placeholder="Ej. Tecnólogo en Análisis y Desarrollo de Software (ADSO)"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                        isDark
                          ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500'
                          : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-600'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {t('char_modality')}
                    </label>
                    <select
                      value={formData.modalidad}
                      onChange={(e) => setFormData({ ...formData, modalidad: e.target.value as any })}
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                        isDark
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <option value="Presencial">{t('char_mod_presencial')}</option>
                      <option value="Virtual">{t('char_mod_virtual')}</option>
                      <option value="Distancia">{t('char_mod_distancia')}</option>
                    </select>
                  </div>
                </div>

                {/* Vocero Candidate Toggle */}
                <div
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-4 ${
                    isDark ? 'bg-slate-805 border-slate-800' : 'bg-emerald-50/70 border-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-indigo-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">{t('char_vocero_q')}</p>
                      <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {t('char_vocero_desc')}
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isVoceroCandidate}
                    onChange={(e) => setFormData({ ...formData, isVoceroCandidate: e.target.checked })}
                    className="w-5 h-5 accent-[#39A900] cursor-pointer rounded"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-2xl font-black text-sm bg-gradient-to-r from-[#39A900] to-lime-600 hover:from-[#2f8800] hover:to-lime-500 text-white shadow-xl shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <span>{t('char_submit')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className={`text-center text-[11px] mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {t('char_note')}
                  </p>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODE: INSTRUCTOR LOGIN */}
        {mode === 'instructor_login' && (
          <div className="max-w-md mx-auto w-full animate-fadeIn">
            <div
              className={`rounded-3xl p-6 sm:p-8 border-2 shadow-2xl transition-all ${
                isDark
                  ? 'bg-slate-900 border-emerald-500/30 text-white'
                  : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/80'
              }`}
            >
              {/* Back button */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  setMode('select');
                }}
                className={`flex items-center gap-1.5 text-xs font-semibold mb-5 transition-colors ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t('char_back')}
              </button>

              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Lock className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-black font-['Space_Grotesk']">
                    {t('inst_title')}
                  </h2>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {t('inst_subtitle')}
                  </p>
                </div>
              </div>

              {instructorError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-400 text-xs mb-5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{instructorError}</span>
                </div>
              )}

              <form onSubmit={handleInstructorSubmit} className="space-y-5">
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {t('inst_key_label')}
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoFocus
                      value={instructorPassword}
                      onChange={(e) => setInstructorPassword(e.target.value)}
                      placeholder={t('inst_key_ph')}
                      className={`w-full pl-10 pr-11 py-3 rounded-xl border text-sm font-mono tracking-wider outline-none transition-all ${
                        isDark
                          ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                          : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <p className={`mt-2 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {t('inst_key_note')}
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-2xl font-black text-sm bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-500 hover:to-lime-500 text-white shadow-xl shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t('inst_submit')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className={`border-t py-6 text-xs text-center transition-colors ${
          isDark ? 'border-slate-900 bg-slate-950 text-slate-500' : 'border-slate-200 bg-white text-slate-500 shadow-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SenaLogo className="w-5 h-5" monochrome />
            <span>Servicio Nacional de Aprendizaje SENA — Dirección General</span>
          </div>
          <span className="font-mono text-[11px]">Acuerdo 009 de 2024 · Inducción Institucional</span>
        </div>
      </footer>
      {/* Video Tutorial Floating Window */}
      <TutorialVideoModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onStartInduction={() => {
          setMode('aprendiz_form');
        }}
        theme={theme}
      />
    </div>
  );
};
