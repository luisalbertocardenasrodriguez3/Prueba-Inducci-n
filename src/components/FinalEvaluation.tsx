import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  GraduationCap,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FINAL_EVALUATION_QUESTIONS } from '../data/senaRegulationData';
import { soundManager } from '../utils/soundEffects';

interface FinalEvaluationProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (scorePercentage: number) => void;
  onOpenCertificate: () => void;
  previouslyPassed: boolean;
  previousScore: number;
}

export const FinalEvaluation: React.FC<FinalEvaluationProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenCertificate,
  previouslyPassed,
  previousScore,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(previouslyPassed);
  const [scorePercentage, setScorePercentage] = useState(previousScore || 0);

  useEffect(() => {
    if (isOpen) {
      if (previouslyPassed) {
        setIsSubmitted(true);
        setScorePercentage(previousScore);
      }
    }
  }, [isOpen, previouslyPassed, previousScore]);

  if (!isOpen) return null;

  const questions = FINAL_EVALUATION_QUESTIONS;
  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (isSubmitted) return;
    soundManager.playClick();
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIdx]: optIdx,
    }));
  };

  const calculateResults = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correct += 1;
      }
    });

    const percentage = Math.round((correct / questions.length) * 100);
    setScorePercentage(percentage);
    setIsSubmitted(true);

    if (percentage >= 80) {
      soundManager.playCertificateFanfare();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#39A900', '#FCD34D', '#FFFFFF', '#0284C7'],
      });
      onSuccess(percentage);
    } else {
      soundManager.playIncorrect();
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setIsSubmitted(false);
  };

  const isCurrentAnswered = selectedAnswers[currentIndex] !== undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl shadow-emerald-950/50 my-6 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 px-6 py-4 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                  Prueba Oficial de Conocimientos
                </span>
                <span className="text-xs text-slate-400">
                  Acuerdo 009 de 2024
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white font-['Space_Grotesk']">
                Evaluación Integral de Inducción SENA
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

        {/* Content */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto custom-scrollbar space-y-6">
          {!isSubmitted ? (
            <>
              {/* Question progress pills */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Pregunta <strong className="text-white">{currentIndex + 1}</strong> de {questions.length}
                  </span>
                  <span>
                    Respondidas: <strong className="text-emerald-400">{answeredCount}</strong> / {questions.length}
                  </span>
                </div>
                <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
                  {questions.map((_, i) => {
                    const isAnswered = selectedAnswers[i] !== undefined;
                    const isCurrent = i === currentIndex;
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`h-7 rounded-lg text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-emerald-500 text-slate-950 scale-105 shadow-md shadow-emerald-500/30'
                            : isAnswered
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question card */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-inner">
                <div className="flex items-center justify-between gap-2 border-b border-slate-850 pb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Pregunta #{currentIndex + 1}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-emerald-400" />
                    {currentQ.legalBasis}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                  {currentQ.question}
                </h3>

                {/* Options list */}
                <div className="space-y-2.5 pt-1">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[currentIndex] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(currentIndex, optIdx)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm flex items-start gap-3 transition-all ${
                          isSelected
                            ? 'bg-emerald-950/70 border-emerald-500 text-white font-medium shadow-md shadow-emerald-950/40'
                            : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 ${
                            isSelected
                              ? 'border-emerald-400 bg-emerald-500 text-slate-950'
                              : 'border-slate-600 text-slate-400'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </div>
                        <span className="leading-snug">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation and Final Submit */}
              <div className="flex items-center justify-between pt-2">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2 rounded-xl bg-slate-800 disabled:opacity-40 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Anterior
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                  >
                    Siguiente
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    disabled={answeredCount < questions.length}
                    onClick={calculateResults}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-500 hover:to-lime-500 disabled:opacity-50 text-white text-xs font-extrabold shadow-lg shadow-emerald-950 animate-pulse transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Finalizar y Calificar
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Result Screen */
            <div className="space-y-6 text-center animate-fadeIn">
              <div
                className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-2xl ${
                  scorePercentage >= 80
                    ? 'bg-gradient-to-tr from-emerald-500 to-lime-400 text-slate-950 shadow-emerald-950'
                    : 'bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-rose-950'
                }`}
              >
                {scorePercentage >= 80 ? (
                  <Award className="w-10 h-10" />
                ) : (
                  <ShieldAlert className="w-10 h-10" />
                )}
              </div>

              <div>
                <span
                  className={`text-xs uppercase font-extrabold tracking-widest px-3 py-1 rounded-full border ${
                    scorePercentage >= 80
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {scorePercentage >= 80 ? '¡Inducción Aprobada!' : 'Umbral No Alcanzado'}
                </span>
                <h3 className="text-3xl font-black text-white font-['Space_Grotesk'] mt-2">
                  Calificación: {scorePercentage}%
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto">
                  {scorePercentage >= 80
                    ? 'Felicitaciones. Has demostrado pleno conocimiento del Acuerdo 009 de 2024, tus derechos, deberes y el debido proceso institucional.'
                    : 'Para expedir tu certificado oficial del SENA necesitas un puntaje mínimo del 80%. Revisa las preguntas incorrectas a continuación y reinténtalo.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {scorePercentage >= 80 && (
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onOpenCertificate();
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-500 hover:to-lime-500 text-white font-extrabold text-xs shadow-xl shadow-emerald-950 transition-all hover:scale-105"
                  >
                    <GraduationCap className="w-5 h-5" />
                    <span>Ver y Descargar Certificado Oficial</span>
                  </button>
                )}

                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Repetir Evaluación
                </button>
              </div>

              {/* Detailed Breakdown */}
              <div className="text-left space-y-3 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Revisión Detallada de Preguntas y Fundamento Legal:
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar p-1">
                  {questions.map((q, idx) => {
                    const userOpt = selectedAnswers[idx];
                    const isCorrect = userOpt === q.correctIndex;
                    return (
                      <div
                        key={q.id}
                        className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                          isCorrect
                            ? 'bg-emerald-950/30 border-emerald-500/30 text-slate-200'
                            : 'bg-rose-950/30 border-rose-500/30 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            {isCorrect ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            )}
                            Pregunta #{idx + 1}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {q.legalBasis}
                          </span>
                        </div>
                        <p className="text-slate-300 font-medium">{q.question}</p>
                        <p className="text-[11px] text-slate-400">
                          Respuesta correcta: <strong className="text-emerald-400">{q.options[q.correctIndex]}</strong>
                        </p>
                        <p className="text-[11px] text-slate-400 italic">
                          Fundamento: {q.explanation}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
