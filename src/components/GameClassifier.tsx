import React, { useState } from 'react';
import { Shield, ClipboardCheck, AlertOctagon, CheckCircle, XCircle, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { ClassifierItem } from '../types/induction';
import { soundManager } from '../utils/soundEffects';

interface GameClassifierProps {
  items: ClassifierItem[];
  onComplete: (score: number) => void;
}

export const GameClassifier: React.FC<GameClassifierProps> = ({ items, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [answersHistory, setAnswersHistory] = useState<{ isCorrect: boolean; item: ClassifierItem; chosen: string }[]>([]);
  const [streak, setStreak] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentItem = items[currentIndex];

  const handleClassify = (category: 'derecho' | 'deber' | 'prohibicion') => {
    if (selectedCategory !== null) return; // already answering this card

    setSelectedCategory(category);
    const isCorrect = category === currentItem.category;

    if (isCorrect) {
      soundManager.playCorrect();
      const points = 20 + streak * 5;
      setScore((prev) => prev + points);
      setStreak((prev) => prev + 1);
    } else {
      soundManager.playIncorrect();
      setStreak(0);
    }

    setAnswersHistory((prev) => [
      ...prev,
      { isCorrect, item: currentItem, chosen: category },
    ]);
  };

  const handleNext = () => {
    if (currentIndex + 1 < items.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedCategory(null);
    } else {
      setIsFinished(true);
      const totalPossible = items.length * 20;
      const finalPercentage = Math.round((score / Math.max(totalPossible, 1)) * 100);
      onComplete(finalPercentage);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedCategory(null);
    setScore(0);
    setAnswersHistory([]);
    setStreak(0);
    setIsFinished(false);
  };

  if (isFinished) {
    const correctCount = answersHistory.filter((a) => a.isCorrect).length;
    const percentage = Math.round((correctCount / items.length) * 100);

    return (
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-5 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-lime-400 mx-auto flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-950/50">
          <Sparkles className="w-8 h-8 text-slate-950" />
        </div>
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30">
            ¡Desafío de Clasificación Completado!
          </span>
          <h3 className="text-2xl font-black text-white font-['Space_Grotesk'] mt-2">
            Puntuación: {score} XP ({percentage}%)
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Acertaste {correctCount} de {items.length} situaciones reglamentarias del SENA.
          </p>
        </div>

        {/* Answers summary */}
        <div className="text-left space-y-2 max-h-48 overflow-y-auto custom-scrollbar p-2 bg-slate-950/60 rounded-xl border border-slate-800">
          {answersHistory.map((ans, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
              {ans.isCorrect ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-slate-200 font-medium">{ans.item.statement}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Respuesta correcta: <strong className="text-emerald-300 uppercase">{ans.item.category}</strong>. {ans.item.explanation}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reintentar para Mejorar
          </button>
        </div>
      </div>
    );
  }

  const isAnswered = selectedCategory !== null;
  const isCorrect = isAnswered && selectedCategory === currentItem.category;

  return (
    <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-5 sm:p-6 space-y-5">
      {/* Top bar with progress and streak */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-400">
            Situación {currentIndex + 1} de {items.length}
          </span>
          <div className="w-24 sm:w-32 bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {streak > 1 && (
            <span className="text-xs font-bold text-amber-400 animate-pulse flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Racha x{streak}
            </span>
          )}
          <span className="font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            +{score} XP
          </span>
        </div>
      </div>

      {/* Card to classify */}
      <div className="bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-700 rounded-2xl p-6 shadow-inner text-center space-y-3 min-h-[140px] flex flex-col justify-center">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
          ¿A qué categoría reglamentaria corresponde?
        </span>
        <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
          &ldquo;{currentItem.statement}&rdquo;
        </p>
      </div>

      {/* Classification buttons */}
      {!isAnswered ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleClassify('derecho')}
            className="group flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-950 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500 text-slate-200 transition-all hover:scale-102 active:scale-98 shadow-md"
          >
            <Shield className="w-6 h-6 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="font-extrabold text-sm text-emerald-300 uppercase">DERECHO</span>
            <span className="text-[10px] text-slate-400">Garantía / Prerrogativa</span>
          </button>

          <button
            onClick={() => handleClassify('deber')}
            className="group flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-950 hover:bg-blue-950/60 border border-slate-800 hover:border-blue-500 text-slate-200 transition-all hover:scale-102 active:scale-98 shadow-md"
          >
            <ClipboardCheck className="w-6 h-6 text-blue-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="font-extrabold text-sm text-blue-300 uppercase">DEBER</span>
            <span className="text-[10px] text-slate-400">Obligación / Compromiso</span>
          </button>

          <button
            onClick={() => handleClassify('prohibicion')}
            className="group flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-950 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500 text-slate-200 transition-all hover:scale-102 active:scale-98 shadow-md"
          >
            <AlertOctagon className="w-6 h-6 text-rose-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="font-extrabold text-sm text-rose-300 uppercase">PROHIBICIÓN</span>
            <span className="text-[10px] text-slate-400">Conducta Vetada / Falta</span>
          </button>
        </div>
      ) : (
        /* Feedback Card after choosing */
        <div
          className={`p-4 rounded-xl border animate-fadeIn space-y-3 ${
            isCorrect
              ? 'bg-emerald-950/40 border-emerald-500/50'
              : 'bg-rose-950/40 border-rose-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <>
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="font-extrabold text-sm text-emerald-300">
                    ¡Correcto! Es un {currentItem.category.toUpperCase()}
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-400" />
                  <span className="font-extrabold text-sm text-rose-300">
                    Atención: Corresponde a {currentItem.category.toUpperCase()}
                  </span>
                </>
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded">
              {currentItem.legalRef}
            </span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed">{currentItem.explanation}</p>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition-all hover:scale-105"
            >
              <span>{currentIndex + 1 < items.length ? 'Siguiente Situación' : 'Ver Resultados'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
