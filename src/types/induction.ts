export type DocumentType = 'CC' | 'TI' | 'CE' | 'PEP' | 'PPT';

export type UserRole = 'aprendiz' | 'instructor';
export type InstructorActiveTab = 'dashboard' | 'induction_preview';

export interface LearnerProfile {
  fullName: string;
  documentType: DocumentType;
  documentNumber: string;
  regional: string;
  centroFormacion: string;
  programaFormacion: string;
  numeroFicha: string;
  modalidad: 'Presencial' | 'Virtual' | 'Distancia';
  avatarSeed: string;
  isVoceroCandidate: boolean;
}

export type CategoryType = 'derecho' | 'deber' | 'prohibicion' | 'medida_formativa';

export interface MicroLearningCard {
  id: string;
  title: string;
  legalReference: string; // e.g. "Acuerdo 009 de 2024, Art. 7"
  tag: string;
  summary: string;
  practicalExample: string;
  keyPoints: string[];
  category: CategoryType;
}

export interface ClassifierItem {
  id: string;
  statement: string;
  category: 'derecho' | 'deber' | 'prohibicion';
  explanation: string;
  legalRef: string;
}

export interface CaseDilemma {
  id: string;
  title: string;
  context: string;
  scenario: string;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    feedback: string;
  }[];
  legalBasis: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  legalBasis: string;
}

export interface ModuleData {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  description: string;
  iconName: string;
  estimatedMinutes: number;
  xpReward: number;
  badgeId: string;
  learningCards: MicroLearningCard[];
  gameType: 'classifier' | 'dilemma' | 'quiz';
  classifierItems?: ClassifierItem[];
  dilemmas?: CaseDilemma[];
  quizQuestions?: QuizQuestion[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: string;
  color: string;
}

export interface InductionCertificate {
  certificateId: string;
  learner: LearnerProfile;
  issueDate: string;
  completedHours: number;
  scorePercentage: number;
  verificationCode: string;
  qrPayload: string;
  signers: {
    subdirector: {
      name: string;
      title: string;
      center: string;
    };
    coordinador: {
      name: string;
      title: string;
    };
  };
}

export interface UserGameState {
  xp: number;
  level: number;
  streak: number;
  completedModules: string[]; // module ids
  moduleScores: Record<string, number>;
  unlockedBadges: string[];
  evaluationCompleted: boolean;
  evaluationScore: number;
  lastActiveDate: string;
  soundEnabled: boolean;
}
