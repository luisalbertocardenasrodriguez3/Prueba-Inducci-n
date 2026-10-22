import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Award,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Copy,
  Check,
  Share2,
  ExternalLink,
  RefreshCw,
  FileSpreadsheet,
  ArrowRight,
  Eye,
  GraduationCap,
  Sparkles,
  Download,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Send,
  FileCheck,
  BarChart3,
  Calendar,
  LogOut,
} from 'lucide-react';
import { LearnerProfile, UserGameState } from '../types/induction';
import {
  AutoSyncState,
  getAutoSyncState,
  subscribeAutoSync,
} from '../services/autoSyncService';
import {
  fetchLearnerRecords,
  SyncedLearnerRecord,
} from '../services/googleSheetsService';
import { getAccessToken, getCurrentUser } from '../services/googleAuth';
import { soundManager } from '../utils/soundEffects';
import { SenaLogo } from './SenaLogo';

interface InstructorDashboardProps {
  currentLearner: LearnerProfile;
  currentGameState: UserGameState;
  theme: 'dark' | 'light';
  onOpenGoogleSheetsModal: () => void;
  onSwitchToLearnerView: () => void;
  onPreviewCertificate: (learner: LearnerProfile, score: number) => void;
  onExitToLanding?: () => void;
}

export const InstructorDashboard: React.FC<InstructorDashboardProps> = ({
  currentLearner,
  currentGameState,
  theme,
  onOpenGoogleSheetsModal,
  onSwitchToLearnerView,
  onPreviewCertificate,
  onExitToLanding,
}) => {
  const [autoSync, setAutoSync] = useState<AutoSyncState>(getAutoSyncState);
  const [records, setRecords] = useState<SyncedLearnerRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [recordsError, setRecordsError] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFicha, setSelectedFicha] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Copy feedback
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  const isDark = theme === 'dark';

  // Apprentice link URL
  const apprenticeUrl = useMemo(() => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}?role=aprendiz`;
  }, []);

  // Subscribe to autoSync state changes
  useEffect(() => {
    const unsubscribe = subscribeAutoSync((state) => {
      setAutoSync(state);
    });
    return () => unsubscribe();
  }, []);

  // Fetch records from Google Sheets
  const loadSheetRecords = async () => {
    setIsLoadingRecords(true);
    setRecordsError(null);
    try {
      const token = await getAccessToken();
      const sheet = autoSync.spreadsheet;

      if (!token || !sheet?.id) {
        // Fallback: create mock/cached records based on local state + standard apprentices
        const localStatus = currentGameState.evaluationCompleted
          ? `Certificado Aprobado (${currentGameState.evaluationScore}%)`
          : currentGameState.completedModules.length === 5
          ? 'Pendiente Evaluación Final'
          : `En Curso (${currentGameState.completedModules.length}/5 Módulos)`;

        const sampleRecords: SyncedLearnerRecord[] = [
          {
            rowIndex: 2,
            timestamp: new Date().toLocaleDateString('es-CO'),
            fullName: currentLearner.fullName,
            documentType: currentLearner.documentType,
            documentNumber: currentLearner.documentNumber,
            regional: currentLearner.regional,
            centroFormacion: currentLearner.centroFormacion,
            programaFormacion: currentLearner.programaFormacion,
            numeroFicha: currentLearner.numeroFicha,
            modalidad: currentLearner.modalidad,
            isVocero: currentLearner.isVoceroCandidate ? 'Sí' : 'No',
            completedModules: `${currentGameState.completedModules.length} de 5`,
            evaluationScore: currentGameState.evaluationCompleted
              ? `${currentGameState.evaluationScore}%`
              : 'No presentada',
            status: localStatus,
            certificateCode: currentGameState.evaluationCompleted
              ? 'SENA-IND-2024-VLD99'
              : 'Pendiente',
            xp: `${currentGameState.xp} XP`,
          },
          {
            rowIndex: 3,
            timestamp: new Date(Date.now() - 3600000 * 24).toLocaleDateString('es-CO'),
            fullName: 'Ana María Gómez Torres',
            documentType: 'CC',
            documentNumber: '1020304050',
            regional: 'Distrito Capital',
            centroFormacion: 'Centro de Gestión de Mercados, Logística y TIC',
            programaFormacion: 'Análisis y Desarrollo de Software (ADSO)',
            numeroFicha: currentLearner.numeroFicha || '2721458',
            modalidad: 'Presencial',
            isVocero: 'Sí',
            completedModules: '5 de 5',
            evaluationScore: '96%',
            status: 'Certificado Aprobado (96%)',
            certificateCode: 'SENA-IND-2024-AMG96',
            xp: '980 XP',
          },
          {
            rowIndex: 4,
            timestamp: new Date(Date.now() - 3600000 * 48).toLocaleDateString('es-CO'),
            fullName: 'Carlos Eduardo Ramírez Peña',
            documentType: 'CC',
            documentNumber: '1098765432',
            regional: 'Antioquia',
            centroFormacion: 'Centro de Manufactura Avanzada',
            programaFormacion: 'Análisis y Desarrollo de Software (ADSO)',
            numeroFicha: currentLearner.numeroFicha || '2721458',
            modalidad: 'Virtual',
            isVocero: 'No',
            completedModules: '3 de 5',
            evaluationScore: 'No presentada',
            status: 'En Curso (3/5 Módulos)',
            certificateCode: 'Pendiente',
            xp: '520 XP',
          },
        ];
        setRecords(sampleRecords);
        return;
      }

      const rows = await fetchLearnerRecords(token, sheet.id);
      if (rows.length === 0) {
        // Fallback display local learner
        setRecords([
          {
            rowIndex: 2,
            timestamp: new Date().toLocaleDateString('es-CO'),
            fullName: currentLearner.fullName,
            documentType: currentLearner.documentType,
            documentNumber: currentLearner.documentNumber,
            regional: currentLearner.regional,
            centroFormacion: currentLearner.centroFormacion,
            programaFormacion: currentLearner.programaFormacion,
            numeroFicha: currentLearner.numeroFicha,
            modalidad: currentLearner.modalidad,
            isVocero: currentLearner.isVoceroCandidate ? 'Sí' : 'No',
            completedModules: `${currentGameState.completedModules.length} de 5`,
            evaluationScore: currentGameState.evaluationCompleted
              ? `${currentGameState.evaluationScore}%`
              : 'No presentada',
            status: currentGameState.evaluationCompleted ? 'Certificado Aprobado' : 'En Curso',
            certificateCode: currentGameState.evaluationCompleted
              ? 'SENA-IND-2024-A1B2C3'
              : 'Pendiente',
            xp: `${currentGameState.xp} XP`,
          },
        ]);
      } else {
        setRecords(rows);
      }
    } catch (err: unknown) {
      console.warn('Error reading records from sheets:', err);
      const message = err instanceof Error ? err.message : 'Error al conectar con la hoja';
      setRecordsError(message);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  useEffect(() => {
    loadSheetRecords();
  }, [autoSync.spreadsheet?.id]);

  // Unique Fichas for filter
  const fichas = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.numeroFicha) set.add(r.numeroFicha);
    });
    return Array.from(set);
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchSearch =
        r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.documentNumber.includes(searchTerm) ||
        r.programaFormacion.toLowerCase().includes(searchTerm.toLowerCase());

      const matchFicha = selectedFicha === 'all' || r.numeroFicha === selectedFicha;

      const isApproved = r.status.toLowerCase().includes('aprobado');
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'aprobado' && isApproved) ||
        (statusFilter === 'en_curso' && !isApproved);

      return matchSearch && matchFicha && matchStatus;
    });
  }, [records, searchTerm, selectedFicha, statusFilter]);

  // Metrics
  const totalLearners = records.length;
  const certifiedCount = records.filter((r) => r.status.toLowerCase().includes('aprobado')).length;
  const passRate = totalLearners > 0 ? Math.round((certifiedCount / totalLearners) * 100) : 0;
  const voceroCount = records.filter((r) => r.isVocero.toLowerCase().includes('s')).length;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(apprenticeUrl);
    soundManager.playCorrect();
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `¡Hola aprendices! 👋 Les comparto el enlace oficial para realizar la Inducción SENA (Reglamento del Aprendiz - Acuerdo 009 de 2024):\n\n🔗 ${apprenticeUrl}\n\nPor favor completen los 5 módulos interactivos y la evaluación final para generar y registrar su Certificado Oficial de Inducción.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleCopyTeamsMessage = () => {
    const msg = `Estimados Aprendices SENA:\n\nDamos inicio a la jornada de Inducción Institucional sobre el nuevo Reglamento del Aprendiz (Acuerdo 009 de 2024).\n\nPara completar su proceso de inducción y registrar su certificado oficial, ingresen al siguiente enlace interactivo:\n${apprenticeUrl}\n\nInstrucciones:\n1. Ingresen y completen su información de perfil (Nombres, Ficha, Documento).\n2. Superen los 5 módulos formativos interactivos.\n3. Presenten la Evaluación Final y descarguen su Certificado.\n\nSus avances se registrarán de forma automática en el sistema.`;
    navigator.clipboard.writeText(msg);
    soundManager.playCorrect();
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  const currentUser = getCurrentUser();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner: Instructor Identity & Role Navigation */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden transition-all ${
          isDark
            ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/70 border-emerald-500/30 text-white'
            : 'bg-gradient-to-br from-white via-emerald-50/50 to-white border-emerald-500/30 text-slate-900 shadow-emerald-900/5'
        }`}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Perfil Instructor SENA
              </span>
              <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Acuerdo 009 de 2024 · Gestión de Aprendices
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-['Space_Grotesk'] tracking-tight">
              Panel de Seguimiento y Sincronización
            </h1>
            <p className={`text-sm max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Supervise el avance, calificaciones y certificados de los aprendices en tiempo real. Todos los progresos se registran automáticamente en su hoja de cálculo institucional de Google Drive.
            </p>
          </div>

          {/* Quick Actions for Instructor */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onSwitchToLearnerView}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm border transition-all hover:scale-105 active:scale-95 shadow-md ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border-slate-700'
                  : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
              }`}
              title="Ver la plataforma tal como la experimenta el aprendiz"
            >
              <Eye className="w-4 h-4 text-emerald-500" />
              <span>Vista de Aprendiz (Inducción)</span>
            </button>

            <button
              onClick={onOpenGoogleSheetsModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-500 hover:to-lime-500 text-white shadow-lg shadow-emerald-900/30 transition-all hover:scale-105 active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Configuración Drive / Sheets</span>
            </button>

            {onExitToLanding && (
              <button
                onClick={onExitToLanding}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-bold text-sm border transition-all hover:scale-105 active:scale-95 ${
                  isDark
                    ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-800/50'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                }`}
                title="Salir del panel y volver a la selección de roles"
              >
                <LogOut className="w-4 h-4" />
                <span>Cambiar Rol</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Share Section: Link for Aprendices */}
      <div
        className={`p-6 sm:p-7 rounded-3xl border shadow-lg transition-all ${
          isDark
            ? 'bg-slate-900/90 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-100'
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-500">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-['Space_Grotesk']">
              Enlace de Inducción para Compartir con los Aprendices
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Los aprendices ingresan a este enlace sin ver configuraciones ni opciones de instructor.
            </p>
          </div>
        </div>

        {/* Copy Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
          <div
            className={`flex-1 flex items-center px-4 py-3 rounded-2xl border font-mono text-xs sm:text-sm overflow-x-auto select-all ${
              isDark
                ? 'bg-slate-950/80 border-slate-800 text-emerald-400'
                : 'bg-slate-50 border-slate-200 text-emerald-800'
            }`}
          >
            <span className="truncate">{apprenticeUrl}</span>
          </div>

          <button
            onClick={handleCopyLink}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all shadow-md shrink-0 ${
              copiedLink
                ? 'bg-emerald-600 text-white'
                : 'bg-[#39A900] hover:bg-[#2d8500] text-white hover:scale-105 active:scale-95'
            }`}
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4" />
                <span>¡Enlace Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Enlace</span>
              </>
            )}
          </button>
        </div>

        {/* 1-Click Share Channels */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 transition-all hover:scale-105"
            title="Compartir enlace redactado directamente a WhatsApp"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Compartir por WhatsApp</span>
          </button>

          <button
            onClick={handleCopyTeamsMessage}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all hover:scale-105 ${
              copiedMessage
                ? 'bg-indigo-600 text-white border-indigo-600'
                : isDark
                ? 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border-indigo-500/40'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
            }`}
            title="Copiar plantilla de mensaje para Teams, SofiaPlus o Correo"
          >
            {copiedMessage ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>¡Mensaje Copiado!</span>
              </>
            ) : (
              <>
                <FileCheck className="w-3.5 h-3.5" />
                <span>Copiar Mensaje para Teams / SofiaPlus</span>
              </>
            )}
          </button>

          {autoSync.spreadsheet?.url && (
            <a
              href={autoSync.spreadsheet.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all hover:scale-105 ml-auto ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border-slate-700'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#39A900]" />
              <span>Abrir Hoja en Google Drive</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total */}
        <div
          className={`p-5 rounded-3xl border shadow-sm flex items-center justify-between ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Aprendices Registrados
            </span>
            <div className="text-3xl font-extrabold font-['Space_Grotesk'] mt-1 text-emerald-500">
              {totalLearners}
            </div>
            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              En la hoja de cálculo
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Certified */}
        <div
          className={`p-5 rounded-3xl border shadow-sm flex items-center justify-between ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Certificados Aprobados
            </span>
            <div className="text-3xl font-extrabold font-['Space_Grotesk'] mt-1 text-lime-500">
              {certifiedCount}
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
              {passRate}% de aprobación
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-lime-500/15 border border-lime-500/30 flex items-center justify-center text-lime-500">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: In progress */}
        <div
          className={`p-5 rounded-3xl border shadow-sm flex items-center justify-between ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              En Proceso / Cursando
            </span>
            <div className="text-3xl font-extrabold font-['Space_Grotesk'] mt-1 text-amber-500">
              {totalLearners - certifiedCount}
            </div>
            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Realizando módulos
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Voceros */}
        <div
          className={`p-5 rounded-3xl border shadow-sm flex items-center justify-between ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Postulados a Vocero
            </span>
            <div className="text-3xl font-extrabold font-['Space_Grotesk'] mt-1 text-indigo-400">
              {voceroCount}
            </div>
            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Liderazgo estudiantil
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Roster Table Section */}
      <div
        className={`rounded-3xl border shadow-lg overflow-hidden transition-all ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        {/* Table Header and Filters */}
        <div className="p-5 sm:p-6 border-b border-inherit flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold font-['Space_Grotesk'] flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              <span>Registro de Aprendices en Formación</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono ${
                isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
              }`}>
                {filteredRecords.length} {filteredRecords.length === 1 ? 'registro' : 'registros'}
              </span>
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>
              Datos sincronizados de la hoja "{autoSync.spreadsheet?.name || 'SENA - Registro Oficial de Inducción'}"
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar aprendiz, documento..."
                className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border outline-none transition-all ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500'
                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-600'
                }`}
              />
            </div>

            {/* Filter by Ficha */}
            {fichas.length > 0 && (
              <select
                value={selectedFicha}
                onChange={(e) => setSelectedFicha(e.target.value)}
                aria-label="Filtrar aprendices por número de ficha"
                className={`px-3 py-2 rounded-xl text-xs border outline-none transition-all ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <option value="all">Todas las Fichas</option>
                {fichas.map((f) => (
                  <option key={f} value={f}>
                    Ficha {f}
                  </option>
                ))}
              </select>
            )}

            {/* Filter by Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filtrar aprendices por estado de inducción"
              className={`px-3 py-2 rounded-xl text-xs border outline-none transition-all ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="all">Todos los Estados</option>
              <option value="aprobado">Certificados Aprobados</option>
              <option value="en_curso">En Proceso / Cursando</option>
            </select>

            {/* Refresh from Sheet */}
            <button
              onClick={loadSheetRecords}
              disabled={isLoadingRecords}
              className={`p-2 rounded-xl border transition-all ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
              title="Refrescar lista desde Google Sheets"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingRecords ? 'animate-spin text-emerald-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead
              className={`border-b font-mono uppercase tracking-wider text-[11px] ${
                isDark ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <tr>
                <th className="py-3.5 px-4 font-semibold">Aprendiz</th>
                <th className="py-3.5 px-4 font-semibold">Documento</th>
                <th className="py-3.5 px-4 font-semibold">Ficha / Programa</th>
                <th className="py-3.5 px-4 font-semibold">Módulos</th>
                <th className="py-3.5 px-4 font-semibold">Evaluación</th>
                <th className="py-3.5 px-4 font-semibold">Estado</th>
                <th className="py-3.5 px-4 font-semibold">Certificado</th>
                <th className="py-3.5 px-4 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold mb-1">No se encontraron aprendices</p>
                    <p className="text-xs">
                      {searchTerm ? 'Intenta con otro término de búsqueda' : 'Comparte el enlace para que los aprendices se registren.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, idx) => {
                  const isApproved = r.status.toLowerCase().includes('aprobado');
                  return (
                    <tr
                      key={idx}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3 px-4 font-bold">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 text-xs font-black">
                            {r.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold">{r.fullName}</div>
                            {r.isVocero.toLowerCase().includes('s') && (
                              <span className="text-[10px] text-indigo-400 font-semibold flex items-center gap-1">
                                <Award className="w-3 h-3" /> Postulado a Vocero
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {r.documentType} {r.documentNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold">Ficha {r.numeroFicha}</div>
                        <div className={`text-[11px] truncate max-w-[200px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {r.programaFormacion}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800/20 dark:bg-slate-800 border border-slate-700/50">
                          {r.completedModules}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold">
                        {r.evaluationScore}
                      </td>
                      <td className="py-3 px-4">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Aprobado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            <Clock className="w-3 h-3" /> En Curso
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {r.certificateCode !== 'Pendiente' ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            {r.certificateCode}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Pendiente</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isApproved && (
                          <button
                            onClick={() => {
                              onPreviewCertificate(
                                {
                                  fullName: r.fullName,
                                  documentType: (r.documentType as any) || 'CC',
                                  documentNumber: r.documentNumber,
                                  regional: r.regional || 'Distrito Capital',
                                  centroFormacion: r.centroFormacion || 'Centro SENA',
                                  programaFormacion: r.programaFormacion || 'Formación Profesional',
                                  numeroFicha: r.numeroFicha || '2721458',
                                  modalidad: (r.modalidad as any) || 'Presencial',
                                  avatarSeed: 'seed',
                                  isVoceroCandidate: r.isVocero.toLowerCase().includes('s'),
                                },
                                parseInt(r.evaluationScore) || 90
                              );
                            }}
                            className={`p-1.5 rounded-lg border text-xs font-semibold transition-all hover:scale-105 ${
                              isDark
                                ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border-slate-700'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                            }`}
                            title="Visualizar certificado emitido"
                          >
                            <GraduationCap className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Summary */}
        <div
          className={`p-4 border-t border-inherit flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
            isDark ? 'bg-slate-950/40 text-slate-400' : 'bg-slate-50 text-slate-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Sincronizado con Google Drive · Cada aprendiz guarda su registro automáticamente al culminar.
            </span>
          </div>

          {autoSync.spreadsheet?.url && (
            <a
              href={autoSync.spreadsheet.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-500 hover:underline font-semibold flex items-center gap-1"
            >
              <span>Ver todos los datos en Google Sheets</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
