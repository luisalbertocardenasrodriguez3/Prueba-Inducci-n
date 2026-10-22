import React from 'react';
import {
  Building2,
  Shield,
  ClipboardCheck,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Lock,
  Play,
  Award,
  Sparkles,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';
import { ModuleData } from '../types/induction';
import { soundManager } from '../utils/soundEffects';

interface ModuleListProps {
  modules: ModuleData[];
  completedModules: string[];
  moduleScores: Record<string, number>;
  onSelectModule: (module: ModuleData) => void;
  onOpenFinalExam: () => void;
  evaluationCompleted: boolean;
  evaluationScore: number;
  theme?: 'dark' | 'light';
}

export const ModuleList: React.FC<ModuleListProps> = ({
  modules,
  completedModules,
  moduleScores,
  onSelectModule,
  onOpenFinalExam,
  evaluationCompleted,
  evaluationScore,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  const getIcon = (name: string) => {
    switch (name) {
      case 'Building2':
        return Building2;
      case 'Shield':
        return Shield;
      case 'ClipboardCheck':
        return ClipboardCheck;
      case 'AlertTriangle':
        return AlertTriangle;
      case 'TrendingUp':
      default:
        return TrendingUp;
    }
  };

  const allModulesDone = modules.every((m) => completedModules.includes(m.id));

  return (
    <div className="space-y-6">
      {/* Module Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod, index) => {
          const isDone = completedModules.includes(mod.id);
          const score = moduleScores[mod.id];
          const IconComp = getIcon(mod.iconName);

          return (
            <div
              key={mod.id}
              className={`group relative rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between ${
                isDone
                  ? isDark
                    ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-950/30 hover:border-emerald-500/70'
                    : 'bg-white border-emerald-500/50 shadow-md shadow-emerald-900/5 hover:border-emerald-600'
                  : isDark
                  ? 'bg-slate-900/60 border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900/80 shadow-md'
                  : 'bg-white border-slate-200 hover:border-emerald-500/50 hover:bg-slate-50 shadow-sm'
              }`}
            >
              {/* Badge & XP indicator */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-md ${
                        isDone
                          ? 'bg-gradient-to-tr from-emerald-600 to-lime-500 text-slate-950'
                          : isDark
                          ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Estación #{mod.number}
                      </span>
                      <h3 className={`font-bold text-sm line-clamp-1 transition-colors ${
                        isDark ? 'text-white group-hover:text-emerald-300' : 'text-slate-900 group-hover:text-emerald-700'
                      }`}>
                        {mod.shortTitle}
                      </h3>
                    </div>
                  </div>

                  {isDone ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {score ? `${score}%` : 'Listo'}
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-full">
                      +{mod.xpReward} XP
                    </span>
                  )}
                </div>

                <p className={`text-xs line-clamp-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {mod.description}
                </p>

                {/* Micro tags */}
                <div className="flex items-center gap-2 text-[10px] pt-1">
                  <span className={`px-2 py-0.5 rounded border ${isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {mod.learningCards.length} conceptos
                  </span>
                  <span className={`px-2 py-0.5 rounded border ${isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {mod.gameType === 'classifier' && 'Juego Clasificador'}
                    {mod.gameType === 'dilemma' && 'Simulador Casos'}
                    {mod.gameType === 'quiz' && 'Trivia / Cuestionario'}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className={`pt-4 mt-3 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onSelectModule(mod);
                  }}
                  className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    isDone
                      ? isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/20 hover:scale-102'
                  }`}
                >
                  {isDone ? (
                    <>
                      <span>Repasar o Mejorar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Ingresar a Estación</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Final Exam Callout */}
      <div
        className={`relative rounded-2xl p-6 border transition-all ${
          evaluationCompleted
            ? isDark
              ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/60 border-emerald-500/50 shadow-xl'
              : 'bg-gradient-to-r from-emerald-50 via-white to-emerald-50 border-emerald-500/50 shadow-lg'
            : allModulesDone
            ? isDark
              ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border-amber-500/50 shadow-xl shadow-amber-950/20'
              : 'bg-gradient-to-r from-amber-50 via-white to-amber-50 border-amber-400/50 shadow-md'
            : isDark
            ? 'bg-slate-900/70 border-slate-800'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                evaluationCompleted
                  ? 'bg-gradient-to-tr from-emerald-500 to-lime-400 text-slate-950'
                  : 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950'
              }`}
            >
              <GraduationCap className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className={`text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-emerald-400' : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                }`}>
                  Evaluación Integral Reglamentaria
                </span>
                {evaluationCompleted && (
                  <span className="text-xs font-bold text-white bg-emerald-600 px-2.5 py-0.5 rounded-full">
                    Aprobado con {evaluationScore}%
                  </span>
                )}
              </div>
              <h3 className={`text-lg sm:text-xl font-extrabold font-['Space_Grotesk'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Evaluación Final y Emisión del Certificado SENA
              </h3>
              <p className={`text-xs max-w-xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Demuestra tu apropiación del <strong>Acuerdo 009 de 2024</strong> (10 preguntas de selección múltiple con casos prácticos). Requiere un mínimo del <strong>80%</strong> para emitir el certificado oficial de inducción con código QR de verificación.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenFinalExam();
            }}
            className={`w-full md:w-auto px-6 py-3 rounded-xl font-extrabold text-xs shadow-xl transition-all flex items-center justify-center gap-2 shrink-0 ${
              evaluationCompleted
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950 hover:scale-105'
                : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black shadow-amber-950 hover:scale-105'
            }`}
          >
            {evaluationCompleted ? (
              <>
                <GraduationCap className="w-4 h-4" />
                <span>Revisar Evaluación / Certificado</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Iniciar Evaluación Integral</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
