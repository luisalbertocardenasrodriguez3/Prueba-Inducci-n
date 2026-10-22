import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  LogOut,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  logout,
  getAccessToken,
  initAuth,
} from '../services/googleAuth';
import {
  findOrCreateInductionSpreadsheet,
  fetchLearnerRecords,
  syncLearnerToSheet,
  SpreadsheetInfo,
  SyncedLearnerRecord,
} from '../services/googleSheetsService';
import {
  setAutoSyncSpreadsheet,
  setAutoSyncUser,
  triggerAutoSync,
} from '../services/autoSyncService';
import { LearnerProfile, UserGameState } from '../types/induction';
import { soundManager } from '../utils/soundEffects';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  learner: LearnerProfile;
  gameState: UserGameState;
  theme?: 'dark' | 'light';
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  learner,
  gameState,
  theme = 'dark',
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [spreadsheet, setSpreadsheet] = useState<SpreadsheetInfo | null>(() => {
    const saved = localStorage.getItem('sena_spreadsheet_info');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [records, setRecords] = useState<SyncedLearnerRecord[]>([]);
  const [isLoadingSpreadsheet, setIsLoadingSpreadsheet] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const isDark = theme === 'dark';

  const handleCopyLink = () => {
    if (!spreadsheet?.url) return;
    navigator.clipboard.writeText(spreadsheet.url);
    setCopiedLink(true);
    soundManager.playCorrect();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Listen for auth state on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
        setAutoSyncUser(user);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
        setAutoSyncUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Save spreadsheet info
  useEffect(() => {
    if (spreadsheet) {
      localStorage.setItem('sena_spreadsheet_info', JSON.stringify(spreadsheet));
    }
  }, [spreadsheet]);

  // Load records if spreadsheet is connected and token is present
  useEffect(() => {
    if (isOpen && accessToken && spreadsheet) {
      handleRefreshRecords(accessToken, spreadsheet.id);
    }
  }, [isOpen, accessToken, spreadsheet?.id]);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    try {
      setIsAuthenticating(true);
      setSyncMessage(null);
      soundManager.playClick();
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
        soundManager.playCorrect();
        // Automatically check/create spreadsheet
        await handleConnectSpreadsheet(res.accessToken);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido al iniciar sesión';
      setSyncMessage({
        type: 'error',
        text: `No se pudo iniciar sesión con Google: ${message}`,
      });
      soundManager.playIncorrect();
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    soundManager.playClick();
    await logout();
    setCurrentUser(null);
    setAccessToken(null);
    setRecords([]);
    setAutoSyncUser(null);
    setAutoSyncSpreadsheet(null);
    setSyncMessage({
      type: 'info',
      text: 'Sesión de Google cerrada correctamente.',
    });
  };

  const handleConnectSpreadsheet = async (token?: string) => {
    const activeToken = token || accessToken;
    if (!activeToken) return;

    try {
      setIsLoadingSpreadsheet(true);
      setSyncMessage(null);
      const sheet = await findOrCreateInductionSpreadsheet(activeToken);
      setSpreadsheet(sheet);
      setAutoSyncSpreadsheet(sheet);
      soundManager.playCorrect();
      setSyncMessage({
        type: 'success',
        text: sheet.createdNow
          ? '¡Nueva hoja de cálculo creada en tu Google Drive con formato institucional SENA!'
          : '¡Hoja de cálculo existente encontrada y conectada con éxito desde Google Drive!',
      });
      await handleRefreshRecords(activeToken, sheet.id);
      // Run automatic sync in background with current learner progress
      triggerAutoSync(learner, gameState);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al conectar con Google Sheets';
      setSyncMessage({
        type: 'error',
        text: message,
      });
      soundManager.playIncorrect();
    } finally {
      setIsLoadingSpreadsheet(false);
    }
  };

  const handleRefreshRecords = async (token: string, sheetId: string) => {
    try {
      const list = await fetchLearnerRecords(token, sheetId);
      setRecords(list);
    } catch (err) {
      console.warn('Error al obtener registros:', err);
    }
  };

  const handleSyncCurrentLearner = async () => {
    if (!accessToken || !spreadsheet) {
      return;
    }

    // MANDATORY USER CONFIRMATION FOR MUTATION/CREATION OF DATA
    const confirmed = window.confirm(
      `¿Confirmas el envío y registro de los datos de ${learner.fullName} (Ficha ${learner.numeroFicha}, Programa: ${learner.programaFormacion}) a la hoja de cálculo en Google Drive?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsSyncing(true);
      setSyncMessage(null);
      soundManager.playClick();

      const result = await syncLearnerToSheet(
        accessToken,
        spreadsheet.id,
        learner,
        gameState
      );

      soundManager.playCorrect();
      setSyncMessage({
        type: 'success',
        text:
          result.action === 'created'
            ? `¡Registro creado con éxito en la fila ${result.rowNumber} de Google Sheets!`
            : `¡Registro de ${learner.fullName} actualizado exitosamente en la fila ${result.rowNumber}!`,
      });

      await handleRefreshRecords(accessToken, spreadsheet.id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al sincronizar datos';
      setSyncMessage({
        type: 'error',
        text: `Error al sincronizar: ${message}`,
      });
      soundManager.playIncorrect();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div
        className={`relative w-full max-w-4xl border rounded-3xl shadow-2xl overflow-hidden my-6 transition-colors ${
          isDark
            ? 'bg-slate-900 border-emerald-500/30 shadow-emerald-950/50 text-slate-100'
            : 'bg-white border-emerald-500/40 shadow-slate-300/60 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-5 border-b flex items-center justify-between ${
            isDark
              ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 border-emerald-500/20'
              : 'bg-gradient-to-r from-emerald-50 via-white to-emerald-50 border-emerald-500/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#39A900]/15 border border-[#39A900]/40 flex items-center justify-center text-[#39A900]">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider bg-[#39A900]/20 text-[#39A900] border border-[#39A900]/40 px-2.5 py-0.5 rounded-full">
                  Google Workspace
                </span>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Drive & Sheets API v4
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold font-['Space_Grotesk'] mt-0.5">
                Almacenamiento de Aprendices en Google Drive
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isDark
                ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                : 'bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status message banner */}
        {syncMessage && (
          <div
            className={`px-6 py-3 border-b flex items-center gap-3 text-xs sm:text-sm font-medium ${
              syncMessage.type === 'success'
                ? isDark
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : syncMessage.type === 'error'
                ? isDark
                  ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                  : 'bg-rose-50 border-rose-300 text-rose-800'
                : isDark
                ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                : 'bg-slate-100 border-slate-300 text-slate-700'
            }`}
          >
            {syncMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
            {syncMessage.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
            <span>{syncMessage.text}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto custom-scrollbar">
          {/* STEP 1: Google Authentication */}
          {!currentUser ? (
            <div
              className={`p-6 sm:p-8 rounded-2xl border text-center space-y-4 ${
                isDark
                  ? 'bg-slate-950/70 border-slate-800'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#39A900] to-lime-400 mx-auto flex items-center justify-center text-white shadow-lg">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold">
                  Conectar con tu cuenta de Google
                </h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Inicia sesión para que la plataforma pueda crear y actualizar automáticamente la hoja de cálculo de inducción en tu unidad de Google Drive.
                </p>
              </div>

              {/* Official Google Sign-In Button */}
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  disabled={isAuthenticating}
                  onClick={handleSignIn}
                  className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs sm:text-sm border border-slate-300 shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>
                    {isAuthenticating ? 'Conectando con Google...' : 'Iniciar sesión con Google'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* Authenticated User Status */
            <div className="space-y-6">
              {/* User profile & connected spreadsheet bar */}
              <div
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || ''}
                      className="w-10 h-10 rounded-full border border-emerald-500/40"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-600/30 flex items-center justify-center text-emerald-400 font-bold">
                      {currentUser.displayName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{currentUser.displayName}</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                        Conectado
                      </span>
                    </div>
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {currentUser.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLogout}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                      isDark
                        ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>

              {/* Spreadsheet Card */}
              <div
                className={`p-5 rounded-2xl border space-y-4 ${
                  isDark
                    ? 'bg-slate-950/90 border-emerald-500/30 shadow-lg'
                    : 'bg-emerald-50/50 border-emerald-500/40 shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#39A900] text-white flex items-center justify-center shrink-0 shadow-md">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Hoja de Cálculo en Google Drive
                      </span>
                      <h4 className="font-bold text-sm sm:text-base line-clamp-1">
                        {spreadsheet?.name || 'SENA - Registro Oficial de Inducción'}
                      </h4>
                    </div>
                  </div>

                  {spreadsheet ? (
                    <a
                      href={spreadsheet.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#39A900] hover:bg-[#2e8800] text-white font-bold text-xs shadow-md transition-all hover:scale-105 shrink-0"
                    >
                      <span>Abrir en Google Drive</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <button
                      disabled={isLoadingSpreadsheet}
                      onClick={() => handleConnectSpreadsheet()}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>{isLoadingSpreadsheet ? 'Creando...' : 'Crear Hoja en Drive'}</span>
                    </button>
                  )}
                </div>

                {spreadsheet && (
                  <div
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs ${
                      isDark
                        ? 'bg-slate-900/90 border-slate-800'
                        : 'bg-white border-emerald-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                      <span className="text-[10px] uppercase font-bold text-emerald-500 shrink-0 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Enlace Directo
                      </span>
                      <a
                        href={spreadsheet.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-xs font-mono text-emerald-400 hover:text-emerald-300 hover:underline"
                        title={spreadsheet.url}
                      >
                        {spreadsheet.url}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                          copiedLink
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : isDark
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {copiedLink ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copiar Enlace</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Apprentice sync trigger */}
                <div
                  className={`pt-4 border-t flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isDark ? 'border-slate-800' : 'border-emerald-200'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-500" />
                      Aprendiz en Turno: <strong className="text-emerald-500">{learner.fullName}</strong>
                    </span>
                    <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Ficha {learner.numeroFicha} • {gameState.completedModules.length}/5 Módulos • {gameState.evaluationCompleted ? `Aprobado (${gameState.evaluationScore}%)` : 'Pendiente de examen'}
                    </p>
                  </div>

                  <button
                    disabled={isSyncing || !spreadsheet}
                    onClick={handleSyncCurrentLearner}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-500 hover:to-lime-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-950/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <UploadCloud className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
                    <span>
                      {isSyncing ? 'Guardando en Drive...' : 'Sincronizar Manualmente'}
                    </span>
                  </button>
                </div>

                {/* Continuous AutoSync Info Banner */}
                <div
                  className={`mt-3 p-3 rounded-xl border flex items-center gap-3 text-xs ${
                    isDark
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  }`}
                >
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <div className="space-y-0.5">
                    <div className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Autoguardado Continuo en Segundo Plano Activo</span>
                    </div>
                    <p className={`text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Cada vez que apruebes un módulo interactivo o superes la evaluación final con tu certificado, la plataforma actualizará automáticamente tu fila en Google Drive sin que tengas que abrir este modal ni hacer clic.
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Records Table Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-[#39A900]" />
                      Registros Almacenados en la Hoja ({records.length})
                    </h4>
                  </div>
                  {spreadsheet && (
                    <button
                      onClick={() => accessToken && handleRefreshRecords(accessToken, spreadsheet.id)}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                        isDark
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                      }`}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Actualizar</span>
                    </button>
                  )}
                </div>

                <div
                  className={`rounded-2xl border overflow-hidden ${
                    isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="overflow-x-auto max-h-60 custom-scrollbar">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead
                        className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                          isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <tr>
                          <th className="py-2.5 px-3">Fecha</th>
                          <th className="py-2.5 px-3">Aprendiz</th>
                          <th className="py-2.5 px-3">Documento</th>
                          <th className="py-2.5 px-3">Ficha</th>
                          <th className="py-2.5 px-3">Módulos</th>
                          <th className="py-2.5 px-3">Estado</th>
                          <th className="py-2.5 px-3">Certificado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {records.length === 0 ? (
                          <tr>
                            <td
                              colSpan={7}
                              className={`py-8 text-center text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                            >
                              No hay registros sincronizados aún en esta hoja. Haz clic en &ldquo;Sincronizar Aprendiz a Google Sheets&rdquo; para agregar el primer registro.
                            </td>
                          </tr>
                        ) : (
                          records.map((rec, i) => (
                            <tr
                              key={i}
                              className={`transition-colors ${
                                isDark ? 'hover:bg-slate-900/60' : 'hover:bg-slate-50'
                              }`}
                            >
                              <td className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap">
                                {rec.timestamp}
                              </td>
                              <td className="py-2.5 px-3 font-semibold whitespace-nowrap">
                                {rec.fullName}
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                {rec.documentType} {rec.documentNumber}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-emerald-500 font-bold whitespace-nowrap">
                                {rec.numeroFicha}
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                {rec.completedModules}
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                    rec.status.includes('Certificado')
                                      ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
                                      : 'bg-amber-500/20 text-amber-500 border-amber-500/30'
                                  }`}
                                >
                                  {rec.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap">
                                {rec.certificateCode}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-4 border-t flex flex-wrap items-center justify-between gap-3 text-xs ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Integración certificada con Google Drive y Google Sheets • SENA 2024-2026
          </span>

          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-white'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
            }`}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
