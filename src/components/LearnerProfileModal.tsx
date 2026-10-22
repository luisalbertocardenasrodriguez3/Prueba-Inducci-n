import React, { useState, useEffect } from 'react';
import { X, UserCheck, RefreshCw, Sparkles, Building, IdCard, GraduationCap } from 'lucide-react';
import { LearnerProfile, DocumentType } from '../types/induction';
import { SENA_REGIONALES, SENA_PROGRAMS_SAMPLE } from '../data/senaRegulationData';

interface LearnerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  learner: LearnerProfile;
  onSave: (updated: LearnerProfile) => void;
}

export const LearnerProfileModal: React.FC<LearnerProfileModalProps> = ({
  isOpen,
  onClose,
  learner,
  onSave,
}) => {
  const [formData, setFormData] = useState<LearnerProfile>(learner);

  useEffect(() => {
    if (isOpen) {
      setFormData(learner);
    }
  }, [learner, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const loadPreset = (presetNumber: number) => {
    if (presetNumber === 1) {
      setFormData({
        fullName: 'Carlos Eduardo Gómez Pardo',
        documentType: 'CC',
        documentNumber: '1019283746',
        regional: 'Regional Distrito Capital',
        centroFormacion: 'Centro de Tecnologías de la Información y las Comunicaciones - CTIC',
        programaFormacion: 'Tecnólogo en Análisis y Desarrollo de Software (ADSO)',
        numeroFicha: '2983110',
        modalidad: 'Presencial',
        avatarSeed: 'Carlos',
        isVoceroCandidate: true,
      });
    } else if (presetNumber === 2) {
      setFormData({
        fullName: 'Mariana Sofia Henao Jaramillo',
        documentType: 'TI',
        documentNumber: '1035928174',
        regional: 'Regional Antioquia',
        centroFormacion: 'Centro de Servicios y Gestión Empresarial',
        programaFormacion: 'Tecnólogo en Gestión Empresarial',
        numeroFicha: '2891045',
        modalidad: 'Virtual',
        avatarSeed: 'Mariana',
        isVoceroCandidate: false,
      });
    } else {
      setFormData({
        fullName: 'Andrés Felipe Caicedo Riascos',
        documentType: 'CC',
        documentNumber: '1114920485',
        regional: 'Regional Valle del Cauca',
        centroFormacion: 'Centro de Electricidad y Automatización Industrial - CEAI',
        programaFormacion: 'Tecnólogo en Animación Digital',
        numeroFicha: '2774921',
        modalidad: 'Presencial',
        avatarSeed: 'Andres',
        isVoceroCandidate: true,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl shadow-emerald-950/50 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 to-emerald-950 px-6 py-4 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <IdCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Space_Grotesk']">
                Perfil del Aprendiz SENA
              </h2>
              <p className="text-xs text-slate-400">
                Estos datos se reflejarán oficialmente en tu Certificado de Inducción
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

        {/* Quick presets */}
        <div className="px-6 pt-4 pb-1 bg-slate-950/40 border-b border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Perfiles Rápidos de Prueba:
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            <button
              type="button"
              onClick={() => loadPreset(1)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-950/80 hover:text-emerald-300 text-slate-300 border border-slate-700 hover:border-emerald-500/40 transition-all"
            >
              ADSO Bogotá (Presencial)
            </button>
            <button
              type="button"
              onClick={() => loadPreset(2)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-950/80 hover:text-emerald-300 text-slate-300 border border-slate-700 hover:border-emerald-500/40 transition-all"
            >
              Gestión Medellín (Virtual)
            </button>
            <button
              type="button"
              onClick={() => loadPreset(3)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-950/80 hover:text-emerald-300 text-slate-300 border border-slate-700 hover:border-emerald-500/40 transition-all"
            >
              Animación Cali (Presencial)
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          {/* Nombre completo */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nombres y Apellidos Completos *
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="Ej: Valentina Restrepo Morales"
            />
          </div>

          {/* Documento */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tipo Doc.
              </label>
              <select
                value={formData.documentType}
                onChange={(e) => setFormData({ ...formData, documentType: e.target.value as DocumentType })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="CC">C.C. (Cédula)</option>
                <option value="TI">T.I. (Tarjeta)</option>
                <option value="CE">C.E. (Extranjería)</option>
                <option value="PEP">PEP</option>
                <option value="PPT">PPT</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Número de Documento *
              </label>
              <input
                type="text"
                required
                value={formData.documentNumber}
                onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="Ej: 1020485921"
              />
            </div>
          </div>

          {/* Regional & Centro */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Regional SENA
              </label>
              <select
                value={formData.regional}
                onChange={(e) => setFormData({ ...formData, regional: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                {SENA_REGIONALES.map((reg) => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Centro de Formación
              </label>
              <input
                type="text"
                required
                value={formData.centroFormacion}
                onChange={(e) => setFormData({ ...formData, centroFormacion: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="Centro de Tecnologías..."
              />
            </div>
          </div>

          {/* Programa y Ficha */}
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Programa de Formación
              </label>
              <input
                type="text"
                required
                value={formData.programaFormacion}
                onChange={(e) => setFormData({ ...formData, programaFormacion: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="Nombre del programa técnico o tecnólogo"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                No. Ficha Caracterización
              </label>
              <input
                type="text"
                required
                value={formData.numeroFicha}
                onChange={(e) => setFormData({ ...formData, numeroFicha: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="2874192"
              />
            </div>
          </div>

          {/* Modalidad & Vocero */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-300 font-semibold">Modalidad:</span>
              {(['Presencial', 'Virtual', 'Distancia'] as const).map((mod) => (
                <label key={mod} className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-300">
                  <input
                    type="radio"
                    name="modalidad"
                    checked={formData.modalidad === mod}
                    onChange={() => setFormData({ ...formData, modalidad: mod })}
                    className="accent-emerald-500"
                  />
                  <span>{mod}</span>
                </label>
              ))}
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <input
                type="checkbox"
                checked={formData.isVoceroCandidate}
                onChange={(e) => setFormData({ ...formData, isVoceroCandidate: e.target.checked })}
                className="accent-emerald-500 rounded"
              />
              <span className="font-medium text-emerald-400">Postulado a Vocero de Ficha</span>
            </label>
          </div>

          {/* Submit */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 flex items-center gap-2 transition-all"
            >
              <UserCheck className="w-4 h-4" />
              Guardar y Actualizar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
