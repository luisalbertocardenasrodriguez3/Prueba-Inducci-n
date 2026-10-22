import React from 'react';
import { X, Award, ShieldCheck, Scale, Sparkles, Compass, GraduationCap, Lock, Check } from 'lucide-react';
import { SENA_BADGES } from '../data/senaRegulationData';
import { Badge } from '../types/induction';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedBadgeIds: string[];
}

export const BadgesModal: React.FC<BadgesModalProps> = ({
  isOpen,
  onClose,
  unlockedBadgeIds,
}) => {
  if (!isOpen) return null;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck':
        return ShieldCheck;
      case 'Scale':
        return Scale;
      case 'Award':
        return Award;
      case 'Sparkles':
        return Sparkles;
      case 'Compass':
        return Compass;
      case 'GraduationCap':
      default:
        return GraduationCap;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl shadow-emerald-950/50 overflow-hidden my-6">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 px-6 py-4 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Space_Grotesk']">
                Insignias y Logros Institucionales
              </h2>
              <p className="text-xs text-slate-400">
                Has desbloqueado {unlockedBadgeIds.length} de {SENA_BADGES.length} insignias oficiales
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

        <div className="p-6 grid sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {SENA_BADGES.map((badge: Badge) => {
            const isUnlocked = unlockedBadgeIds.includes(badge.id);
            const IconComponent = getIcon(badge.icon);

            return (
              <div
                key={badge.id}
                className={`relative rounded-xl p-4 border transition-all ${
                  isUnlocked
                    ? 'bg-slate-950/80 border-emerald-500/40 shadow-lg shadow-emerald-950/30'
                    : 'bg-slate-950/30 border-slate-800/80 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                      isUnlocked
                        ? `bg-gradient-to-br ${badge.color} text-white`
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isUnlocked ? (
                      <IconComponent className="w-6 h-6" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-sm text-white">{badge.title}</h4>
                      {isUnlocked && (
                        <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                          <Check className="w-3 h-3" /> Desbloqueada
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-snug">{badge.description}</p>
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                      <span className="text-slate-500 font-medium">Requisito: </span>
                      {badge.requirement}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
