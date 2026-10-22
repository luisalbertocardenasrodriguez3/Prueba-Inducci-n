import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'es' | 'en';

export interface Translations {
  [key: string]: {
    es: string;
    en: string;
  };
}

export const translations: Translations = {
  // Theme & Language
  theme_light: { es: 'Modo Claro', en: 'Light Mode' },
  theme_dark: { es: 'Modo Oscuro', en: 'Dark Mode' },
  lang_label: { es: 'Español', en: 'English' },
  lang_badge: { es: 'ES', en: 'EN' },
  lang_switch_tooltip: {
    es: 'Switch to English (Cambiar a Inglés)',
    en: 'Cambiar a Español (Switch to Spanish)',
  },

  // Navbar & Landing
  portal_title: { es: 'Portal Oficial de Inducción', en: 'Official Induction Portal' },
  portal_subtitle: {
    es: 'Reglamento del Aprendiz · Acuerdo 009 de 2024',
    en: 'Apprentice Regulations · Agreement 009 of 2024',
  },
  watch_tutorial: { es: 'Ver Video Tutorial', en: 'Watch Video Tutorial' },
  watch_tutorial_short: { es: 'Tutorial (1:37)', en: 'Tutorial (1:37)' },
  hero_badge: {
    es: 'Plataforma de Inducción Gamificada SENA 2024 - 2026',
    en: 'SENA Gamified Induction Platform 2024 - 2026',
  },
  hero_title: {
    es: 'Bienvenido al Portal de Inducción del Aprendiz',
    en: 'Welcome to the Apprentice Induction Portal',
  },
  hero_desc: {
    es: 'Para garantizar la privacidad y funciones correspondientes a cada usuario, selecciona cómo deseas ingresar a la plataforma:',
    en: 'To ensure privacy and features corresponding to each user, select how you wish to enter the platform:',
  },

  // Tutorial Banner
  tutorial_badge: { es: 'Video Tutorial Oficial', en: 'Official Video Tutorial' },
  tutorial_banner_title: {
    es: '¿Primera vez aquí? Mira el Video Tutorial antes de comenzar',
    en: 'First time here? Watch the Video Tutorial before starting',
  },
  tutorial_banner_desc: {
    es: 'Aprende paso a paso cómo ingresar, realizar la caracterización sin errores y obtener tu Certificado con QR.',
    en: 'Learn step by step how to log in, complete characterization without errors, and obtain your QR Certificate.',
  },
  play_video: { es: 'Reproducir Video', en: 'Play Video' },

  // Learner Card
  role_learner_title: { es: 'Soy Aprendiz', en: 'I am an Apprentice' },
  role_learner_badge: { es: 'Sin Clave · Ingreso Libre', en: 'No Password · Free Access' },
  role_learner_desc: {
    es: 'Inicia tu proceso de inducción interactivo sobre el nuevo Reglamento del Aprendiz (Acuerdo 009 de 2024). Llena tus datos de caracterización una sola vez y supera los módulos para obtener tu Certificado Oficial.',
    en: 'Start your interactive induction process on the new Apprentice Regulations (Agreement 009 of 2024). Fill in your characterization details once and pass the modules to obtain your Official Certificate.',
  },
  role_learner_feat1: {
    es: '5 Estaciones formativas gamificadas con retos y dilemas',
    en: '5 gamified training stations with challenges and dilemmas',
  },
  role_learner_feat2: {
    es: 'Evaluación final y Certificado con código QR verificable',
    en: 'Final evaluation and Certificate with verifiable QR code',
  },
  role_learner_feat3: {
    es: 'Tus notas y avance se guardan automáticamente en Drive',
    en: 'Your grades and progress are automatically saved to Drive',
  },
  role_learner_btn: {
    es: 'Ingresar como Aprendiz (Caracterización)',
    en: 'Enter as Apprentice (Characterization)',
  },

  // Instructor Card
  role_instructor_title: { es: 'Soy Instructor', en: 'I am an Instructor' },
  role_instructor_badge: { es: 'Acceso Privado con Clave', en: 'Private Access with Key' },
  role_instructor_desc: {
    es: 'Espacio exclusivo para instructores y coordinadores. Gestiona y revisa las notas de tus fichas en tiempo real, vincula hojas de cálculo en Google Drive y genera el enlace para tus aprendices.',
    en: 'Exclusive space for instructors and coordinators. Manage and review grades of your groups in real-time, link spreadsheets in Google Drive, and generate the link for your apprentices.',
  },
  role_instructor_feat1: {
    es: 'Dashboard analítico de notas, aprobación y estadísticas de fichas',
    en: 'Analytical dashboard of grades, passing rates, and cohort statistics',
  },
  role_instructor_feat2: {
    es: 'Generador de enlace oficial de inducción para compartir por WhatsApp/Teams',
    en: 'Official induction link generator to share via WhatsApp/Teams',
  },
  role_instructor_feat3: {
    es: 'Sincronización directa con Google Drive / Sheets',
    en: 'Direct synchronization with Google Drive / Sheets',
  },
  role_instructor_btn: {
    es: 'Ingresar como Instructor (Validar Clave)',
    en: 'Enter as Instructor (Validate Key)',
  },

  // Characterization Form
  char_back: { es: '← Volver a selección de rol', en: '← Back to role selection' },
  char_tutorial_btn: { es: 'Ver Video Tutorial (1:37)', en: 'Watch Video Tutorial (1:37)' },
  char_title: { es: 'Caracterización del Aprendiz', en: 'Apprentice Characterization' },
  char_subtitle: {
    es: 'Ingresa tus datos institucionales. Estos datos aparecerán en tu Certificado Oficial de Inducción.',
    en: 'Enter your institutional data. These details will appear on your Official Induction Certificate.',
  },
  char_fullname: { es: 'Nombres y Apellidos Completos *', en: 'Full Name *' },
  char_fullname_ph: { es: 'Ej. Juan Carlos Pérez Gómez', en: 'E.g. John Carlos Perez Gomez' },
  char_doctype: { es: 'Tipo de Doc. *', en: 'Doc Type *' },
  char_docnum: { es: 'Número de Documento *', en: 'Document Number *' },
  char_regional: { es: 'Regional SENA *', en: 'SENA Regional Office *' },
  char_ficha: { es: 'Número de Ficha *', en: 'Cohort Number (Ficha) *' },
  char_center: { es: 'Centro de Formación *', en: 'Training Center *' },
  char_program: { es: 'Programa de Formación *', en: 'Training Program *' },
  char_modality: { es: 'Modalidad', en: 'Modality' },
  char_mod_presencial: { es: 'Presencial', en: 'On-campus (Presencial)' },
  char_mod_virtual: { es: 'Virtual', en: 'Virtual / Online' },
  char_mod_distancia: { es: 'A Distancia', en: 'Hybrid / Distance' },
  char_vocero_q: {
    es: '¿Deseas postularte como Vocero de Aprendices?',
    en: 'Do you want to run for Apprentice Representative (Vocero)?',
  },
  char_vocero_desc: {
    es: 'Liderazgo estudiantil regulado en el Art. 62 del Acuerdo 009 de 2024.',
    en: 'Student leadership regulated in Art. 62 of Agreement 009 of 2024.',
  },
  char_submit: { es: 'Comenzar Mi Inducción SENA', en: 'Start My SENA Induction' },
  char_note: {
    es: 'Ingreso directo sin contraseña para aprendices',
    en: 'Direct access without password for apprentices',
  },

  // Instructor Login
  inst_title: { es: 'Acceso de Instructor', en: 'Instructor Access' },
  inst_subtitle: {
    es: 'Ingresa la clave institucional para acceder al panel de control.',
    en: 'Enter the institutional key to access the control panel.',
  },
  inst_key_label: { es: 'Clave de Acceso del Instructor *', en: 'Instructor Access Key *' },
  inst_key_ph: {
    es: 'Ingresa tu clave de acceso institucional',
    en: 'Enter your institutional access key',
  },
  inst_key_note: {
    es: 'Acceso restringido únicamente a instructores y coordinadores autorizados del SENA.',
    en: 'Restricted access only to authorized SENA instructors and coordinators.',
  },
  inst_submit: {
    es: 'Ingresar al Panel de Instructor',
    en: 'Enter Instructor Dashboard',
  },

  // Header Inside App
  header_induction_title: { es: 'Inducción 2024-2026', en: 'Induction 2024-2026' },
  header_induction_sub: {
    es: 'Reglamento Acuerdo 009/2024',
    en: 'Regulations Agreement 009/2024',
  },
  header_instructor_title: { es: 'Panel de Instructor SENA', en: 'SENA Instructor Panel' },
  header_instructor_sub: { es: 'Gestión y Seguimiento', en: 'Management & Tracking' },
  header_plan: { es: 'Plan Inducción', en: 'Induction Plan' },
  header_tutor: { es: 'Tutor SENA', en: 'SENA AI Tutor' },
  header_cert: { es: 'Certificado', en: 'Certificate' },
  header_exit: { es: 'Salir', en: 'Exit' },
  header_exit_tooltip: {
    es: 'Salir y volver al portal de selección de rol',
    en: 'Exit and return to role selection portal',
  },
  header_autosync_active: { es: 'Autoguardado Activo', en: 'Autosave Active' },
  header_autosync_saving: { es: 'Guardando...', en: 'Saving...' },
  header_dash: { es: 'Panel de Control', en: 'Dashboard' },
  header_preview: { es: 'Vista de Inducción', en: 'Induction View' },
  header_share: { es: 'Compartir Enlace', en: 'Share Link' },
  header_link_copied: { es: '¡Enlace Copiado!', en: 'Link Copied!' },
  header_sheets: { es: 'Google Sheets', en: 'Google Sheets' },

  // Apprentice Induction View
  apprentice_banner_text: {
    es: 'Estás en Modo Aprendiz (Ficha {ficha})',
    en: 'You are in Apprentice Mode (Ficha {ficha})',
  },
  welcome_greeting: { es: '¡Bienvenido(a),', en: 'Welcome,' },
  welcome_lead: {
    es: 'Apropia tus derechos, deberes y el nuevo reglamento institucional a través de retos interactivos, simuladores de dilemas éticos y evaluaciones gamificadas. Al superar la ruta, obtendrás tu Certificado Oficial de Inducción con código QR.',
    en: 'Master your rights, duties, and the new institutional regulations through interactive challenges, ethical dilemma simulators, and gamified assessments. Upon completing the path, you will obtain your Official Induction Certificate with QR code.',
  },
  progress_title: { es: 'Progreso de Inducción', en: 'Induction Progress' },
  progress_modules_label: { es: 'Módulos Listos', en: 'Modules Ready' },
  progress_exam_label: { es: 'Evaluación Final', en: 'Final Evaluation' },
  status_passed: { es: 'Aprobado', en: 'Passed' },
  status_pending: { es: 'Pendiente', en: 'Pending' },

  // Video Tutorial Modal
  modal_video_title: {
    es: 'Video Tutorial: Inducción Institucional SENA',
    en: 'Video Tutorial: Official SENA Induction',
  },
  modal_video_sub: {
    es: 'Guía visual oficial: Caracterización sin errores, 5 módulos y descarga del Certificado con QR',
    en: 'Official visual guide: Error-free characterization, 5 modules, and QR Certificate download',
  },
  modal_video_duration: { es: '1:37 min', en: '1:37 min' },
  modal_video_close: { es: 'Cerrar', en: 'Close' },
  modal_video_start: { es: 'Comenzar Mi Inducción', en: 'Start My Induction' },
  modal_step1: { es: '1. Ingreso Aprendiz', en: '1. Apprentice Login' },
  modal_step2: { es: '2. Caracterización', en: '2. Characterization' },
  modal_step3: { es: '3. 5 Módulos + Test', en: '3. 5 Modules + Test' },
  modal_step4: { es: '4. Certificado QR', en: '4. QR Certificate' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sena_language') as Language;
      if (stored === 'es' || stored === 'en') return stored;
    }
    return 'es';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sena_language', lang);
    }
  };

  const toggleLanguage = () => {
    const nextLang: Language = language === 'es' ? 'en' : 'es';
    setLanguage(nextLang);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const entry = translations[key];
    let text = entry ? entry[language] || entry.es : key;

    if (params) {
      Object.entries(params).forEach(([paramKey, val]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
