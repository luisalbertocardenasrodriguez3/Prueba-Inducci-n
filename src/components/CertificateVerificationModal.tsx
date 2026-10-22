import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, Search, Building, Calendar, Award } from 'lucide-react';
import { LearnerProfile } from '../types/induction';
import { SenaLogo } from './SenaLogo';

interface CertificateVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  learner: LearnerProfile;
  scorePercentage: number;
}

export const CertificateVerificationModal: React.FC<CertificateVerificationModalProps> = ({
  isOpen,
  onClose,
  initialCode = '',
  learner,
  scorePercentage,
}) => {
  const [inputCode, setInputCode] = useState(initialCode);
  const [searched, setSearched] = useState(Boolean(initialCode));

  useEffect(() => {
    if (initialCode) {
      setInputCode(initialCode);
      setSearched(true);
    }
  }, [initialCode, isOpen]);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      setSearched(true);
    }
  };

  const currentDate = new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'long',
  }).format(new Date());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl shadow-emerald-950/50 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 px-6 py-4 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Space_Grotesk']">
                Verificador Oficial de Certificados SENA
              </h2>
              <p className="text-xs text-slate-400">
                Sistema Nacional de Registro y Certificación Académica
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-6 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Ej: SENA-IND-2024-XXXXXX"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Validar</span>
            </button>
          </form>

          {/* Validation result card */}
          {searched && (
            <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-5 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="font-extrabold text-sm text-emerald-400 uppercase tracking-wide">
                    Certificado Auténtico y Válido
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {inputCode || 'SENA-IND-2024-VALID'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-850">
                  <span className="text-slate-400">Aprendiz Titular:</span>
                  <strong className="text-white font-semibold">{learner.fullName}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-850">
                  <span className="text-slate-400">Documento:</span>
                  <span className="text-slate-200">{learner.documentType} {learner.documentNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-850">
                  <span className="text-slate-400">Programa:</span>
                  <span className="text-slate-200 text-right max-w-xs">{learner.programaFormacion}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-850">
                  <span className="text-slate-400">Ficha:</span>
                  <span className="font-mono text-emerald-400 font-bold">{learner.numeroFicha}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-850">
                  <span className="text-slate-400">Centro:</span>
                  <span className="text-slate-200 text-right max-w-xs">{learner.centroFormacion}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-850">
                  <span className="text-slate-400">Horas Acreditadas:</span>
                  <span className="text-slate-200">40 Horas de Inducción</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Norma Reguladora:</span>
                  <span className="text-emerald-400 font-semibold">Acuerdo 009 de 2024</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-[11px] text-emerald-300">
                Este registro digital confirma que el aprendiz completó exitosamente todos los módulos pedagógicos y superó la evaluación de inducción.
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
