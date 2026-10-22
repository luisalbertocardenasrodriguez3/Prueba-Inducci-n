import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, HelpCircle, BookOpen } from 'lucide-react';
import { QuizQuestion } from '../types/induction';
import { soundManager } from '../utils/soundEffects';

interface ModuleQuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
}

export const ModuleQuiz: React.FC<ModuleQuizProps> = ({ questions, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = questions[currentIndex];

  const handleSelect = (idx: number) => {
    if (selectedIdx !== null) return;
    setSelectedIdx(idx);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      soundManager.playCorrect();
      setCorrectAnswers((prev) => prev + 1);
    } else {
      soundManager.playIncorrect();
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedIdx(null);
    } else {
      setIsFinished(true);
      const percentage = Math.round((correctAnswers / questions.length) * 100);
      onComplete(percentage);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedIdx(null);
    setCorrectAnswers(0);
    setIsFinished(false);
  };

  if (isFinished) {
    const percentage = Math.round((correctAnswers / questions.length) * 100);
    return (
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-4 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 mx-auto flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30">
            ¡Cuestionario Completado!
          </span>
          <h3 className="text-2xl font-black text-white font-['Space_Grotesk'] mt-2">
            Resultado: {percentage}% ({correctAnswers}/{questions.length} correctas)
          </h3>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Repetir Desafío
          </button>
        </div>
      </div>
    );
  }

  const isAnswered = selectedIdx !== null;

  return (
    <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-5 sm:p-6 space-y-5">
      {/* Top progress */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-400">
          Pregunta {currentIndex + 1} de {questions.length}
        </span>
        <span className="font-bold text-emerald-400">
          {correctAnswers} aciertos
        </span>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-2">
        <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed">
          {currentQ.question}
        </h3>
        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
          <BookOpen className="w-3 h-3 text-emerald-400" />
          {currentQ.legalBasis}
        </span>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {currentQ.options.map((opt, idx) => {
          let style = 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200';
          if (isAnswered) {
            if (idx === currentQ.correctIndex) {
              style = 'bg-emerald-950/90 border-emerald-500 text-white font-medium';
            } else if (idx === selectedIdx && idx !== currentQ.correctIndex) {
              style = 'bg-rose-950/80 border-rose-500 text-rose-200';
            } else {
              style = 'bg-slate-950/40 border-slate-900 opacity-50 text-slate-500';
            }
          }

          return (
            <button
              key={idx}
              disabled={isAnswered}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs sm:text-sm flex items-center justify-between gap-3 ${style}`}
            >
              <span>{opt}</span>
              {isAnswered && idx === currentQ.correctIndex && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              {isAnswered && idx === selectedIdx && idx !== currentQ.correctIndex && (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 animate-fadeIn space-y-2">
          <p className="text-xs text-slate-300">
            <strong className="text-emerald-400">Fundamento: </strong>
            {currentQ.explanation}
          </p>
          <div className="flex justify-end pt-1">
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition-all hover:scale-105"
            >
              <span>{currentIndex + 1 < questions.length ? 'Siguiente Pregunta' : 'Completar Módulo'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
