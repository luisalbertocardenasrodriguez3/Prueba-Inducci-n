import React from 'react';
import { X, CheckCircle2, BookOpen, Scale, Award, ShieldAlert, Sparkles, Clock, Target, FileCheck2 } from 'lucide-react';
import { STRUCTURED_INDUCTION_PLAN } from '../data/senaRegulationData';
import { SenaLogo } from './SenaLogo';

interface PlanEstructuradoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlanEstructuradoModal: React.FC<PlanEstructuradoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl shadow-emerald-950/50 my-8 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-950 px-6 py-5 border-b border-emerald-500/20 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <SenaLogo variant="shield" className="w-12 h-12 shrink-0 drop-shadow-md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                  Plan Institucional Oficial
                </span>
                <span className="text-xs text-slate-400">
                  {STRUCTURED_INDUCTION_PLAN.version}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white font-['Space_Grotesk'] mt-0.5">
                Plan Estructurado de Inducción Gamificada SENA
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Fundamentado en el <strong className="text-emerald-400">Acuerdo 009 de 2024</strong> (Nuevo Reglamento del Aprendiz) y la <strong className="text-emerald-400">Ley 2365 de 2024</strong>.
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

        {/* Content body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar text-slate-200">
          {/* Key metrics cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-center">
              <Clock className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <div className="text-lg font-black text-white">{STRUCTURED_INDUCTION_PLAN.totalHours} Horas</div>
              <div className="text-[11px] text-slate-400">Intensidad Acreditada</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-center">
              <Target className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <div className="text-lg font-black text-white">{STRUCTURED_INDUCTION_PLAN.passingScore}% Mínimo</div>
              <div className="text-[11px] text-slate-400">Umbral de Aprobación</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-center">
              <BookOpen className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <div className="text-lg font-black text-white">5 Módulos</div>
              <div className="text-[11px] text-slate-400">Estaciones Gamificadas</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-center">
              <Award className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <div className="text-lg font-black text-white">Certificado QR</div>
              <div className="text-[11px] text-slate-400">Validable Oficialmente</div>
            </div>
          </div>

          {/* Institutional Objectives */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 mb-2.5">
              <Sparkles className="w-4 h-4" />
              Objetivos Pedagógicos y de Apropiación
            </h3>
            <ul className="grid sm:grid-cols-2 gap-2 text-xs sm:text-sm">
              {STRUCTURED_INDUCTION_PLAN.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/70">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Module Roadmap & Deliverables */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              Matriz Formativa de Módulos y Horas
            </h3>
            <div className="space-y-2.5">
              {STRUCTURED_INDUCTION_PLAN.modulesMatrix.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-3.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-white text-sm">{item.module}</h4>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                        {item.hours}h
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 pl-8">{item.topics}</p>
                  </div>
                  <div className="sm:text-right shrink-0 pl-8 sm:pl-0">
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5">
                      <FileCheck2 className="w-3.5 h-3.5" />
                      {item.deliverable}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Normative & Gamification Architecture */}
          <div className="bg-gradient-to-r from-emerald-950/30 to-blue-950/30 border border-emerald-500/20 rounded-xl p-4 text-xs space-y-2">
            <h4 className="font-bold text-emerald-300 text-sm flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              Aspectos Destacados del Acuerdo 009 de 2024
            </h4>
            <p className="text-slate-300 leading-relaxed">
              El <strong>Acuerdo 009 de 2024</strong> del Consejo Directivo Nacional del SENA reemplazó formalmente al histórico Acuerdo 007 de 2012. Entre sus principales innovaciones destacan: el protocolo de prevención, atención y sanción del acoso en ambientes de aprendizaje acorde con la <strong>Ley 2365 de 2024</strong>; la regulación del entorno virtual (LMS Zajuna) y el uso ético de tecnologías; la definición transparente de novedades de matrícula y la priorización de medidas formativas pedagógicas antes de acudir al régimen disciplinario sancionatorio.
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Servicio Nacional de Aprendizaje SENA - Dirección de Formación Profesional
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition-all"
          >
            Entendido, Continuar la Inducción
          </button>
        </div>
      </div>
    </div>
  );
};
