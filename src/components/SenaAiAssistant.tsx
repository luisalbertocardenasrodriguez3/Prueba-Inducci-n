import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  BotMessageSquare,
  Sparkles,
  User,
  HelpCircle,
  BookOpen,
  FileSpreadsheet,
  ExternalLink,
  UploadCloud,
  CheckCircle2,
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { soundManager } from '../utils/soundEffects';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  legalReference?: string;
  actionType?: 'google-sheets';
  spreadsheetUrl?: string;
  spreadsheetName?: string;
}

interface SenaAiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGoogleSheets?: () => void;
}

const FAQ_SUGGESTIONS = [
  '📊 Ver enlace a la hoja de cálculo en Google Drive',
  '¿En qué cambia el nuevo Acuerdo 009 de 2024 respecto al anterior?',
  '¿Cuáles son mis derechos si no estoy de acuerdo con una calificación?',
  '¿Qué alternativas tengo para hacer la Etapa Productiva?',
  '¿Cuántos días tengo para radicar una incapacidad médica?',
  '¿Cómo protege el SENA frente al acoso según la Ley 2365 de 2024?',
  '¿Cuáles son las funciones del Vocero de Ficha?',
];

const PRESET_ANSWERS: Record<string, { answer: string; ref: string }> = {
  acuerdo: {
    answer: 'El nuevo Acuerdo 009 de 2024 derogó al histórico Acuerdo 007 de 2012. Sus principales cambios son: 1) Armonización con la Ley 2365 de 2024 sobre prevención del acoso sexual en entornos laborales y formativos tipificándolo como falta gravísima; 2) Regulación formal del entorno virtual de aprendizaje (LMS Zajuna/SofiaPlus) y el uso ético de la tecnología; 3) Fortalecimiento de las medidas formativas pedagógicas previas a sanciones formales; y 4) Clarificación de novedades de matrícula y trámites de deserción.',
    ref: 'Acuerdo 009 de 2024 - Consejo Directivo Nacional',
  },
  calificacion: {
    answer: 'Si tienes inconformidad con la evaluación de una evidencia: 1) Tienes derecho a solicitar revisión respetuosa al instructor dentro de los términos reglamentarios; 2) Si la discrepancia persiste, puedes solicitar formalmente ante el Coordinador Académico la designación de un SEGUNDO EVALUADOR idóneo, quien emitirá un juicio definitivo garantizando tu debido proceso.',
    ref: 'Acuerdo 009 de 2024 - Derecho de Contradicción y Segundo Evaluador',
  },
  productiva: {
    answer: 'Para tu Etapa Productiva puedes optar por 5 modalidades avaladas: 1) Contrato de Aprendizaje (con patrocinio económico de empresa y afiliaciones a EPS y ARL); 2) Vínculo Laboral o contractual; 3) Proyecto Productivo institucional o iniciativa de emprendimiento apoyada por Fondo Emprender; 4) Pasantía en entidades públicas, ONGs o pymes; y 5) Monitoría oficial en el SENA.',
    ref: 'Acuerdo 009 de 2024 - Alternativas Etapa Productiva',
  },
  incapacidad: {
    answer: 'Si sufres una enfermedad o calamidad, debes radicar el soporte médico formal emitido por tu EPS ante tu instructor y coordinación académica dentro de los TRES (3) DÍAS HÁBILES siguientes al inicio de la inasistencia. Si faltas tres días continuos sin justificación, se iniciará el trámite de Deserción.',
    ref: 'Acuerdo 009 de 2024 - Deberes de Asistencia y Deserción',
  },
  acoso: {
    answer: 'El SENA aplica una estricta política de TOLERANCIA CERO frente al acoso y la discriminación. En armonía con la Ley 2365 de 2024, el reglamento tipifica el acoso sexual, laboral y la violencia basada en género como FALTAS DISCIPLINARIAS GRAVÍSIMAS. Se activan de inmediato medidas cautelares de protección para la víctima y remisión urgente al Comité de Evaluación y Seguimiento.',
    ref: 'Ley 2365 de 2024 y Acuerdo 009 de 2024 - Prevención del Acoso',
  },
  vocero: {
    answer: 'El Vocero de Ficha es elegido democráticamente por sus compañeros durante el primer mes de formación. Sus funciones incluyen: 1) Ser puente de comunicación entre el grupo, los instructores y la coordinación; 2) Promover la convivencia pacífica y el cumplimiento del reglamento; 3) Participar en reuniones de voceros y comités cuando sea convocado; y 4) Velar por los derechos y el bienestar de sus compañeros.',
    ref: 'Acuerdo 009 de 2024 - Representación y Liderazgo de Aprendices',
  },
};

export const SenaAiAssistant: React.FC<SenaAiAssistantProps> = ({
  isOpen,
  onClose,
  onOpenGoogleSheets,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-welcome',
      sender: 'ai',
      text: '¡Hola, futuro técnico/tecnólogo SENA! Soy tu Tutor Virtual de Inducción. Conozco a profundidad el nuevo Reglamento del Aprendiz (Acuerdo 009 de 2024), tus derechos, deberes y la sincronización con Google Drive. ¿Qué duda deseas resolver hoy?',
      timestamp: 'Ahora',
      legalReference: 'Acuerdo 009 de 2024',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    soundManager.playClick();
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const lower = query.toLowerCase();

    // Check if the user is asking about the Google Sheets / Drive spreadsheet
    const isSpreadsheetQuery =
      lower.includes('hoja') ||
      lower.includes('calculo') ||
      lower.includes('cálculo') ||
      lower.includes('drive') ||
      lower.includes('sheet') ||
      lower.includes('excel') ||
      lower.includes('guardó') ||
      lower.includes('guardo') ||
      lower.includes('guardada') ||
      lower.includes('guardado') ||
      lower.includes('enlace') ||
      lower.includes('link') ||
      lower.includes('registro');

    if (isSpreadsheetQuery) {
      let savedSpreadsheet: { id: string; name: string; url: string } | null = null;
      try {
        const raw = localStorage.getItem('sena_spreadsheet_info');
        if (raw) savedSpreadsheet = JSON.parse(raw);
      } catch {
        savedSpreadsheet = null;
      }

      const sheetUrl = savedSpreadsheet?.url || 'https://docs.google.com/spreadsheets/';
      const sheetName = savedSpreadsheet?.name || 'SENA - Registro Oficial de Inducción (Acuerdo 009 de 2024)';

      let sheetText = '';
      if (savedSpreadsheet?.url) {
        sheetText = `📄 **Hoja de Cálculo en Google Drive vinculada:**\n**Nombre:** ${sheetName}\n**Enlace directo:**\n${sheetUrl}\n\nLos datos de inducción del aprendiz se almacenan y actualizan en esta hoja oficial en tu cuenta de Google. Puedes pulsar el botón verde a continuación para abrirla en una pestaña nueva o abrir el Gestor para verificar y sincronizar.`;
      } else {
        sheetText = `📄 **Registro en Google Drive (Google Sheets):**\n\nPara revisar o almacenar los datos en Google Drive:\n1. Haz clic en **"Abrir Gestor de Google Sheets"** (o en el botón verde en la barra superior).\n2. Inicia sesión con tu cuenta de Google.\n3. La plataforma buscará o creará automáticamente la hoja oficial:\n**"SENA - Registro Oficial de Inducción (Acuerdo 009 de 2024)"**\n4. Podrás abrir el enlace directo a tu hoja en Google Drive y verificar cada fila guardada.\n\nTambién puedes consultar tus hojas en: https://docs.google.com/spreadsheets/`;
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: sheetText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        legalReference: 'Google Drive & Sheets API - Registro Oficial de Aprendices',
        actionType: 'google-sheets',
        spreadsheetUrl: sheetUrl,
        spreadsheetName: sheetName,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
      return;
    }

    // Check if we can use Gemini via @google/genai
    const apiKey = import.meta.env?.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '');
    
    let answerText = '';
    let legalRef = 'Acuerdo 009 de 2024';

    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Eres el Tutor Oficial de Inducción del SENA (Servicio Nacional de Aprendizaje de Colombia).
Responde la siguiente pregunta de un aprendiz de manera motivadora, precisa, concisa (máximo 140 palabras) y fundamentándote en el NUEVO REGLAMENTO DEL APRENDIZ (Acuerdo 009 de 2024 del SENA que derogó el Acuerdo 007 de 2012) y la Ley 2365 de 2024 (prevención y sanción del acoso).
Cita los principios de formación profesional integral, derechos, deberes, prohibiciones o medidas formativas según aplique.
Pregunta del aprendiz: "${query}"`,
        });
        answerText = response.text || '';
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local regulation knowledge base:', err);
      }
    }

    if (!answerText) {
      // Local intelligent response matcher
      if (lower.includes('acuerdo') || lower.includes('cambia') || lower.includes('007') || lower.includes('009') || lower.includes('nuevo')) {
        answerText = PRESET_ANSWERS.acuerdo.answer;
        legalRef = PRESET_ANSWERS.acuerdo.ref;
      } else if (lower.includes('califica') || lower.includes('nota') || lower.includes('evalua') || lower.includes('segundo evaluador')) {
        answerText = PRESET_ANSWERS.calificacion.answer;
        legalRef = PRESET_ANSWERS.calificacion.ref;
      } else if (lower.includes('productiv') || lower.includes('etapa') || lower.includes('contrato') || lower.includes('pasant')) {
        answerText = PRESET_ANSWERS.productiva.answer;
        legalRef = PRESET_ANSWERS.productiva.ref;
      } else if (lower.includes('incapacidad') || lower.includes('medica') || lower.includes('falta') || lower.includes('dias') || lower.includes('desercion')) {
        answerText = PRESET_ANSWERS.incapacidad.answer;
        legalRef = PRESET_ANSWERS.incapacidad.ref;
      } else if (lower.includes('acoso') || lower.includes('discrimina') || lower.includes('violencia') || lower.includes('ley 2365')) {
        answerText = PRESET_ANSWERS.acoso.answer;
        legalRef = PRESET_ANSWERS.acoso.ref;
      } else if (lower.includes('vocero') || lower.includes('representante') || lower.includes('lider')) {
        answerText = PRESET_ANSWERS.vocero.answer;
        legalRef = PRESET_ANSWERS.vocero.ref;
      } else {
        answerText = `Como aprendiz SENA, tu formación está respaldada por el Acuerdo 009 de 2024. Cuentas con derecho a una inducción integral, ambientes seguros, retroalimentación respetuosa y acceso a los servicios de Bienestar. A su vez, debes portar visiblemente tu carné, asistir puntualmente a las actividades pactadas, cuidar las instalaciones y actuar con honestidad académica sin incurrir en plagio ni faltas de convivencia.`;
        legalRef = 'Acuerdo 009 de 2024 - Principios de la Formación Profesional';
      }
    }

    const aiMsg: Message = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: answerText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      legalReference: legalRef,
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl shadow-emerald-950/50 flex flex-col h-[85vh] max-h-[680px] overflow-hidden my-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 px-5 py-4 border-b border-emerald-500/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-lime-400 flex items-center justify-center text-slate-950 shadow-md">
              <BotMessageSquare className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                  Tutor Inteligente
                </span>
                <span className="text-[11px] text-slate-400">
                  Acuerdo 009 de 2024
                </span>
              </div>
              <h2 className="text-base font-bold text-white font-['Space_Grotesk']">
                Consultor de Inducción y Reglamento SENA
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

        {/* Quick FAQ Pills */}
        <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 shrink-0 overflow-x-auto custom-scrollbar flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Preguntas Rápidas:
          </span>
          {FAQ_SUGGESTIONS.map((faq, i) => (
            <button
              key={i}
              onClick={() => handleSend(faq)}
              className="text-[11px] shrink-0 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-950/80 text-slate-300 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/40 transition-colors"
            >
              {faq}
            </button>
          ))}
        </div>

        {/* Messages scroll area */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3.5 bg-slate-950/40">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <BotMessageSquare className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm space-y-1.5 shadow-md ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                {m.actionType === 'google-sheets' && (
                  <div className="mt-3 pt-3 border-t border-emerald-500/30 space-y-2">
                    {m.spreadsheetUrl && (
                      <div className="flex items-center gap-2">
                        <a
                          href={m.spreadsheetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#39A900] hover:bg-[#2e8800] text-white font-bold text-xs shadow-md transition-all hover:scale-102"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>Abrir Hoja en Google Drive</span>
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      </div>
                    )}
                    {onOpenGoogleSheets && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenGoogleSheets();
                        }}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Abrir Gestor y Sincronizar Aprendiz</span>
                      </button>
                    )}
                  </div>
                )}
                {m.legalReference && (
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono pt-1 border-t border-slate-800/60">
                    <BookOpen className="w-3 h-3" />
                    <span>{m.legalReference}</span>
                  </div>
                )}
                <span className={`block text-[9px] text-right ${m.sender === 'user' ? 'text-emerald-200' : 'text-slate-500'}`}>
                  {m.timestamp}
                </span>
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Consultando Acuerdo 009 de 2024...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu consulta sobre el reglamento SENA..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold transition-all shadow-md shadow-emerald-950"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
