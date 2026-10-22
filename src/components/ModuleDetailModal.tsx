import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Gamepad2,
  CheckCircle2,
  Award,
  ChevronLeft,
  ChevronRight,
  Shield,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { ModuleData } from '../types/induction';
import { GameClassifier } from './GameClassifier';
import { CaseSimulator } from './CaseSimulator';
import { ModuleQuiz } from './ModuleQuiz';
import { soundManager } from '../utils/soundEffects';

interface ModuleDetailModalProps {
  module: ModuleData | null;
  isOpen: boolean;
  onClose: () => void;
  onModuleComplete: (moduleId: string, score: number) => void;
  isCompleted: boolean;
}

export const ModuleDetailModal: React.FC<ModuleDetailModalProps> = ({
  module,
  isOpen,
  onClose,
  onModuleComplete,
  isCompleted,
}) => {
  const [activeTab, setActiveTab] = useState<'learn' | 'challenge'>('learn');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('learn');
      setCurrentCardIndex(0);
    }
  }, [module?.id, isOpen]);

  if (!isOpen || !module) return null;

  const currentCard = module.learningCards[currentCardIndex];

  const handleChallengeFinished = (score: number) => {
    onModuleComplete(module.id, score);
  };

  const startChallenge = () => {
    soundManager.playClick();
    setActiveTab('challenge');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl shadow-emerald-950/50 my-6 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 px-5 sm:px-6 py-4 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black">
              {module.number}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                  Módulo de Inducción #{module.number}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {module.estimatedMinutes} min
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white font-['Space_Grotesk']">
                {module.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 pt-2">
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('learn');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'learn'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            1. Fundamentos Clave ({module.learningCards.length} conceptos)
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('challenge');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'challenge'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-amber-400" />
            2. Reto Gamificado (+{module.xpReward} XP)
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 max-h-[72vh] overflow-y-auto custom-scrollbar">
          {activeTab === 'learn' ? (
            <div className="space-y-4">
              {/* Card slider indicators */}
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                <span>Concepto {currentCardIndex + 1} de {module.learningCards.length}</span>
                <div className="flex items-center gap-1.5">
                  {module.learningCards.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentCardIndex(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        i === currentCardIndex ? 'bg-emerald-400 w-6' : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Learning Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-inner">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950 px-2.5 py-0.5 rounded-md border border-emerald-500/30">
                      {currentCard.tag}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {currentCard.title}
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                    {currentCard.legalReference}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {currentCard.summary}
                </p>

                {/* Practical Example */}
                <div className="p-3 rounded-xl bg-slate-900/90 border-l-4 border-emerald-500 text-xs text-slate-300 space-y-1">
                  <span className="font-bold text-emerald-400 uppercase tracking-wide text-[10px] block">
                    Ejemplo Práctico en la Cotidianidad SENA:
                  </span>
                  <p>{currentCard.practicalExample}</p>
                </div>

                {/* Key Points */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Aspectos Clave a Recordar:
                  </span>
                  <ul className="space-y-1">
                    {currentCard.keyPoints.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Navigation between cards & launch game */}
              <div className="flex items-center justify-between pt-2">
                <button
                  disabled={currentCardIndex === 0}
                  onClick={() => setCurrentCardIndex((prev) => Math.max(0, prev - 1))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 disabled:opacity-40 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>

                {currentCardIndex < module.learningCards.length - 1 ? (
                  <button
                    onClick={() => setCurrentCardIndex((prev) => prev + 1)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                  >
                    Siguiente Concepto
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={startChallenge}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-500 hover:to-lime-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-950 animate-bounce"
                  >
                    <Gamepad2 className="w-4 h-4" />
                    ¡Comenzar Reto Gamificado!
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div>
              {/* Gamified challenge rendering */}
              {module.gameType === 'classifier' && module.classifierItems && (
                <GameClassifier
                  items={module.classifierItems}
                  onComplete={handleChallengeFinished}
                />
              )}

              {module.gameType === 'dilemma' && module.dilemmas && (
                <CaseSimulator
                  dilemmas={module.dilemmas}
                  onComplete={handleChallengeFinished}
                />
              )}

              {module.gameType === 'quiz' && module.quizQuestions && (
                <ModuleQuiz
                  questions={module.quizQuestions}
                  onComplete={handleChallengeFinished}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
