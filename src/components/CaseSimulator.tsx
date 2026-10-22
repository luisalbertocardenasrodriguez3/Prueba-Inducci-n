import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, XCircle, ArrowRight, BookOpen, RotateCcw, Scale } from 'lucide-react';
import { CaseDilemma } from '../types/induction';
import { soundManager } from '../utils/soundEffects';

interface CaseSimulatorProps {
  dilemmas: CaseDilemma[];
  onComplete: (score: number) => void;
}

export const CaseSimulator: React.FC<CaseSimulatorProps> = ({ dilemmas, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [history, setHistory] = useState<{ dilemma: CaseDilemma; isCorrect: boolean }[]>([]);

  const currentDilemma = dilemmas[currentIndex];

  const handleSelectOption = (optId: string) => {
    if (selectedOptionId !== null) return;
    setSelectedOptionId(optId);

    const option = currentDilemma.options.find((o) => o.id === optId);
    const isCorrect = option?.isCorrect ?? false;

    if (isCorrect) {
      soundManager.playCorrect();
      setScore((prev) => prev + 35);
    } else {
      soundManager.playIncorrect();
    }

    setHistory((prev) => [...prev, { dilemma: currentDilemma, isCorrect }]);
  };

  const handleNext = () => {
    if (currentIndex + 1 < dilemmas.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
    } else {
      setIsFinished(true);
      const totalPossible = dilemmas.length * 35;
      const percentage = Math.round((score / Math.max(totalPossible, 1)) * 100);
      onComplete(percentage);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setScore(0);
    setIsFinished(false);
    setHistory([]);
  };

  if (isFinished) {
    const correctCount = history.filter((h) => h.isCorrect).length;
    const percentage = Math.round((correctCount / dilemmas.length) * 100);

    return (
      <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-6 text-center space-y-5 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 mx-auto flex items-center justify-center text-white shadow-lg shadow-purple-950/50">
          <Scale className="w-8 h-8" />
        </div>
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-purple-400 bg-purple-950/80 px-3 py-1 rounded-full border border-purple-500/30">
            ¡Simulador de Dilemas y Comité Superado!
          </span>
          <h3 className="text-2xl font-black text-white font-['Space_Grotesk'] mt-2">
            Puntaje Ético: {score} XP ({percentage}%)
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Resolviste {correctCount} de {dilemmas.length} casos disciplinarios y formativos aplicando el Acuerdo 009 de 2024.
          </p>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reintentar Casos
          </button>
        </div>
      </div>
    );
  }

  const selectedOption = currentDilemma.options.find((o) => o.id === selectedOptionId);
  const isAnswered = selectedOptionId !== null;

  return (
    <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-5 sm:p-6 space-y-5">
      {/* Top progress */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-purple-300 flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-purple-400" />
            Caso {currentIndex + 1} de {dilemmas.length}
          </span>
        </div>
        <span className="font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
          +{score} XP acumulados
        </span>
      </div>

      {/* Case scenario card */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
            {currentDilemma.title}
          </span>
          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-emerald-400" />
            {currentDilemma.legalBasis}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {currentDilemma.context}
        </p>
        <div className="bg-slate-900/90 border-l-4 border-amber-500 p-2.5 rounded-r-lg text-xs text-amber-200">
          <strong>Situación:</strong> {currentDilemma.scenario}
        </div>
        <div className="text-xs sm:text-sm font-bold text-white pt-1">
          {currentDilemma.question}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {currentDilemma.options.map((opt) => {
          let stateStyle = 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200';
          if (isAnswered) {
            if (opt.isCorrect) {
              stateStyle = 'bg-emerald-950/80 border-emerald-500 text-white shadow-lg shadow-emerald-950/50';
            } else if (opt.id === selectedOptionId && !opt.isCorrect) {
              stateStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
            } else {
              stateStyle = 'bg-slate-950/40 border-slate-900 opacity-50 text-slate-500';
            }
          }

          return (
            <button
              key={opt.id}
              disabled={isAnswered}
              onClick={() => handleSelectOption(opt.id)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs sm:text-sm flex items-start gap-3 ${stateStyle}`}
            >
              <div className="shrink-0 mt-0.5">
                {isAnswered && opt.isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isAnswered && opt.id === selectedOptionId && !opt.isCorrect ? (
                  <XCircle className="w-4 h-4 text-rose-400" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px]">
                    {opt.id.slice(-1)}
                  </div>
                )}
              </div>
              <span className="leading-snug">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback & Proceed */}
      {isAnswered && selectedOption && (
        <div
          className={`p-4 rounded-xl border animate-fadeIn space-y-2 ${
            selectedOption.isCorrect
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-bold">
            {selectedOption.isCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Dictamen Correcto según el Nuevo Reglamento</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>Dictamen No Ajustado al Procedimiento Oficial</span>
              </>
            )}
          </div>
          <p className="text-xs leading-relaxed text-slate-200">
            {selectedOption.feedback}
          </p>
          <div className="flex justify-end pt-2">
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-950 transition-all hover:scale-105"
            >
              <span>{currentIndex + 1 < dilemmas.length ? 'Siguiente Caso' : 'Finalizar Simulador'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
