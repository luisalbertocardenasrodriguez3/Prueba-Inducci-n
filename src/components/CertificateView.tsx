import React, { useRef } from 'react';
import {
  Printer,
  ShieldCheck,
  Download,
  Share2,
  CheckCircle2,
  Calendar,
  Building,
  QrCode,
  Sparkles,
  Award,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import { LearnerProfile, InductionCertificate } from '../types/induction';
import { SenaLogo } from './SenaLogo';
import { soundManager } from '../utils/soundEffects';

interface CertificateViewProps {
  learner: LearnerProfile;
  scorePercentage: number;
  onBack: () => void;
  onOpenVerifier: (code: string) => void;
  onEditProfile: () => void;
}

export const CertificateView: React.FC<CertificateViewProps> = ({
  learner,
  scorePercentage,
  onBack,
  onOpenVerifier,
  onEditProfile,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  // Generate unique verification code based on learner document and ficha
  const hash = Math.abs(
    (learner.documentNumber + learner.numeroFicha).split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0)
  )
    .toString(36)
    .toUpperCase()
    .padStart(6, 'X')
    .slice(0, 6);

  const verificationCode = `SENA-IND-2024-${hash}`;

  const issueDateFormatted = new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const handlePrint = () => {
    soundManager.playClick();
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fadeIn">
      {/* Action Toolbar (Hidden in Print) */}
      <div className="print:hidden bg-slate-900/90 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Tablero</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:inline">
            ¿Necesitas cambiar algún dato o ficha?
          </span>
          <button
            onClick={onEditProfile}
            className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-950 hover:text-emerald-300 text-slate-300 border border-slate-700 transition-colors"
          >
            Editar Datos del Aprendiz
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenVerifier(verificationCode)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-semibold transition-all"
            title="Validar código de autenticidad"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verificar Código</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-500 hover:to-lime-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-950 transition-all hover:scale-105"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Guardar en PDF</span>
          </button>
        </div>
      </div>

      {/* CERTIFICATE CONTAINER (Optimized for Screen & Print) */}
      <div
        ref={certificateRef}
        id="printable-certificate"
        className="relative bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-10 md:p-14 border-[10px] border-[#00324D] print:border-none print:shadow-none print:rounded-none print:p-8"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          minHeight: '720px',
        }}
      >
        {/* Decorative Guilloche Border in SENA Green & Gold */}
        <div className="absolute inset-2 border-2 border-[#39A900] pointer-events-none rounded-2xl print:rounded-none" />
        <div className="absolute inset-3 border border-amber-400/50 pointer-events-none rounded-xl print:rounded-none" />

        {/* Watermark Logo Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none select-none">
          <SenaLogo className="w-96 h-96" />
        </div>

        {/* Certificate Content */}
        <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
          {/* Header section */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-4 mb-2">
              <SenaLogo className="w-14 h-14 drop-shadow-sm" />
            </div>

            <div className="space-y-0.5">
              <h4 className="text-xs sm:text-sm font-extrabold tracking-[0.25em] text-[#00324D] uppercase font-['Space_Grotesk']">
                República de Colombia
              </h4>
              <h5 className="text-[11px] sm:text-xs font-semibold tracking-widest text-slate-500 uppercase">
                Ministerio del Trabajo
              </h5>
              <h2 className="text-base sm:text-lg font-black tracking-wider text-[#39A900] uppercase font-['Space_Grotesk']">
                Servicio Nacional de Aprendizaje — SENA
              </h2>
            </div>

            <div className="pt-2">
              <span className="inline-block text-[10px] sm:text-[11px] uppercase tracking-widest text-slate-500 font-bold border-b-2 border-amber-400 pb-1">
                El Subdirector del Centro de Formación y la Coordinación Académica Certifican que:
              </span>
            </div>
          </div>

          {/* Recipient Full Name */}
          <div className="text-center py-2 space-y-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#00324D] font-['Space_Grotesk'] tracking-tight">
              {learner.fullName.toUpperCase()}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Identificado(a) con <strong className="text-slate-800">{learner.documentType} No. {learner.documentNumber}</strong>
            </p>
          </div>

          {/* Statement of Completion */}
          <div className="max-w-3xl mx-auto text-center space-y-2">
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Cumplió y aprobó satisfactoriamente la totalidad de las actividades, dilemas de convivencia y evaluación integral correspondientes a la:
            </p>
            <div className="p-3 bg-emerald-50/80 border border-emerald-500/30 rounded-xl text-center">
              <h3 className="text-sm sm:text-base font-black text-[#00324D] tracking-wide uppercase">
                INDUCCIÓN A LA FORMACIÓN PROFESIONAL INTEGRAL Y APROPIACIÓN DEL REGLAMENTO DEL APRENDIZ
              </h3>
              <p className="text-[11px] font-semibold text-[#39A900] mt-0.5">
                Conforme al Acuerdo 009 de 2024 del Consejo Directivo Nacional y Ley 2365 de 2024
              </p>
            </div>
          </div>

          {/* Details table / grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Regional
              </span>
              <span className="font-semibold text-slate-800">{learner.regional}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Ficha de Formación
              </span>
              <span className="font-mono font-bold text-slate-800">{learner.numeroFicha}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Intensidad Horaria
              </span>
              <span className="font-semibold text-slate-800">40 Horas Acreditadas</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Aprobación Evaluación
              </span>
              <span className="font-bold text-emerald-700">{scorePercentage}% (Satisfactorio)</span>
            </div>

            <div className="col-span-2 sm:col-span-3 pt-1 border-t border-slate-200/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Programa de Formación
              </span>
              <span className="font-semibold text-slate-800">{learner.programaFormacion}</span>
            </div>
            <div className="pt-1 border-t border-slate-200/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Modalidad
              </span>
              <span className="font-semibold text-slate-800">{learner.modalidad}</span>
            </div>
          </div>

          {/* Signatures & QR Verification Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 items-end gap-6 pt-4 border-t border-slate-200">
            {/* Signature 1: Subdirector */}
            <div className="text-center space-y-1">
              <div className="h-12 flex items-center justify-center">
                {/* Stylized digital signature vector */}
                <svg viewBox="0 0 160 40" className="w-36 h-10 stroke-[#00324D] fill-none">
                  <path d="M10 28 C 30 10, 45 35, 65 18 C 85 8, 100 32, 120 15 C 135 25, 145 10, 155 20" strokeWidth="2" strokeLinecap="round" />
                  <path d="M40 32 L 140 32" strokeWidth="1.2" strokeDasharray="3 3" />
                </svg>
              </div>
              <div className="border-t border-slate-400 pt-1">
                <span className="font-bold text-xs text-slate-900 block">
                  Dra. Stella Morales Quintana
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Subdirectora de Centro de Formación
                </span>
                <span className="text-[9px] text-slate-400 block truncate">
                  {learner.centroFormacion}
                </span>
              </div>
            </div>

            {/* Official Stamp & QR Code */}
            <div className="flex flex-col items-center justify-center text-center space-y-1.5 py-1">
              {/* QR Code representation */}
              <div className="relative p-2 bg-white border-2 border-[#39A900] rounded-xl shadow-sm">
                <svg viewBox="0 0 80 80" className="w-16 h-16 fill-[#00324D]">
                  {/* Stylized authentic QR matrix */}
                  <rect x="5" y="5" width="22" height="22" fill="#00324D" />
                  <rect x="8" y="8" width="16" height="16" fill="white" />
                  <rect x="11" y="11" width="10" height="10" fill="#00324D" />

                  <rect x="53" y="5" width="22" height="22" fill="#00324D" />
                  <rect x="56" y="8" width="16" height="16" fill="white" />
                  <rect x="59" y="11" width="10" height="10" fill="#00324D" />

                  <rect x="5" y="53" width="22" height="22" fill="#00324D" />
                  <rect x="8" y="56" width="16" height="16" fill="white" />
                  <rect x="11" y="59" width="10" height="10" fill="#00324D" />

                  <rect x="32" y="10" width="8" height="6" fill="#39A900" />
                  <rect x="36" y="24" width="8" height="6" fill="#00324D" />
                  <rect x="32" y="36" width="14" height="14" fill="#39A900" />
                  <rect x="50" y="36" width="6" height="6" fill="#00324D" />
                  <rect x="60" y="44" width="8" height="8" fill="#00324D" />
                  <rect x="36" y="56" width="8" height="8" fill="#00324D" />
                  <rect x="48" y="60" width="12" height="6" fill="#39A900" />
                </svg>
              </div>

              <div className="space-y-0.5">
                <span className="font-mono text-[9px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 block">
                  {verificationCode}
                </span>
                <span className="text-[8px] text-slate-400 block">
                  Escanee para validar autenticidad
                </span>
              </div>
            </div>

            {/* Signature 2: Coordinación Académica */}
            <div className="text-center space-y-1">
              <div className="h-12 flex items-center justify-center">
                {/* Stylized digital signature vector */}
                <svg viewBox="0 0 160 40" className="w-36 h-10 stroke-[#00324D] fill-none">
                  <path d="M15 15 C 35 32, 50 12, 70 25 C 95 38, 115 10, 140 22" strokeWidth="2" strokeLinecap="round" />
                  <path d="M20 32 L 145 32" strokeWidth="1.2" strokeDasharray="3 3" />
                </svg>
              </div>
              <div className="border-t border-slate-400 pt-1">
                <span className="font-bold text-xs text-slate-900 block">
                  Ing. Mauricio Cárdenas Silva
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Coordinador de Formación Profesional Integral
                </span>
                <span className="text-[9px] text-slate-400 block">
                  Bienestar y Éxito del Aprendiz SENA
                </span>
              </div>
            </div>
          </div>

          {/* Certificate footer note */}
          <div className="flex flex-wrap items-center justify-between text-[9px] text-slate-500 pt-2 border-t border-slate-100">
            <span>
              Expedido en Colombia el {issueDateFormatted}. Documento digital legalmente válido.
            </span>
            <span className="font-semibold text-[#00324D]">
              Sistema Integrado de Gestión SENA - Código F004-P006
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
