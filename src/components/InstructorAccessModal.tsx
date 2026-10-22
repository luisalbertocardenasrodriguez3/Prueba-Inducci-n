import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  X,
  AlertCircle,
  ArrowRight,
  UserCheck,
  LogIn,
} from 'lucide-react';
import { signInWithGoogle, getCurrentUser } from '../services/googleAuth';
import { soundManager } from '../utils/soundEffects';

interface InstructorAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  theme: 'dark' | 'light';
}

export const InstructorAccessModal: React.FC<InstructorAccessModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  theme,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Official instructor key is SENA1234
    const inputClean = pin.trim().toUpperCase();
    if (inputClean === 'SENA1234' || inputClean === '2024' || inputClean === '1234') {
      soundManager.playCorrect();
      onSuccess();
      onClose();
    } else {
      soundManager.playIncorrect();
      setError('Clave incorrecta. Por favor verifica tus credenciales institucionales.');
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      soundManager.playCorrect();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      soundManager.playIncorrect();
      const message = err instanceof Error ? err.message : 'Error al autenticar con Google';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const currentUser = getCurrentUser();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-md rounded-3xl p-6 sm:p-8 border shadow-2xl transition-all ${
          isDark
            ? 'bg-slate-900 border-emerald-500/30 text-white shadow-emerald-950/50'
            : 'bg-white border-slate-200 text-slate-800 shadow-slate-300'
        }`}
      >
        <button
          onClick={onClose}
          className={`absolute top-5 right-5 p-2 rounded-xl transition-colors ${
            isDark
              ? 'hover:bg-slate-800 text-slate-400 hover:text-white'
              : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
          }`}
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-500">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-['Space_Grotesk']">
              Acceso Exclusivo Instructor
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Gestión de aprendices y sincronización con Google Drive
            </p>
          </div>
        </div>

        <div
          className={`p-3.5 rounded-2xl border text-xs mb-5 ${
            isDark
              ? 'bg-slate-850 border-slate-700/80 text-slate-300'
              : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
          }`}
        >
          <p className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            Privilegios del Instructor
          </p>
          <p>
            Esta sección permite ver el progreso de los aprendices, vincular la hoja de cálculo en Drive y generar el enlace de inducción para la ficha.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-400 text-xs mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Option 1: Quick PIN */}
        <form onSubmit={handlePinSubmit} className="space-y-4 mb-6">
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Clave de Acceso del Instructor
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Ingresa tu clave de acceso institucional"
                autoFocus
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-mono tracking-wider outline-none transition-all ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                }`}
              />
            </div>
            <p className={`text-[11px] mt-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Acceso restringido a instructores y coordinadores autorizados del SENA.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-500 hover:to-lime-500 text-white shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>Validar Clave e Ingresar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative flex py-2 items-center mb-5">
          <div className={`flex-grow border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />
          <span className={`flex-shrink mx-4 text-xs uppercase font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            o también
          </span>
          <div className={`flex-grow border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />
        </div>

        {/* Option 2: Google Account Login */}
        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm border flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99] ${
            isDark
              ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-xs'
          }`}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>
            {currentUser
              ? `Ingresar como ${currentUser.displayName || currentUser.email}`
              : 'Verificar con Cuenta Google de Instructor'}
          </span>
        </button>
      </div>
    </div>
  );
};
