import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';

export type Language = 'ENG' | 'POL' | 'SPA' | 'GER' | 'FRA' | 'ITA';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  startButton: string;
  selectLanguage: string;
  question1: string;
  question2: string;
  question3: string;
  question4: string;
  question5: string;
  question6: string;
  holdToRecord: string;
  recording: string;
  recorded: string;
  next: string;
  beginExperiment: string;
  questionLabel: string;
  simulationTitle: string;
  simulationSubtitle: string;
  simulationInfo: string;
  revealButton: string;
  revealTitle: string;
  revealMessage: string;
  timeRemaining: string;
  safeWordPrompt: string;
  backToHome: string;
  aiDisclaimer: string;
}

const TRANSLATIONS: Record<Language, Translations> = {
  ENG: {
    appTitle: 'Voicinne',
    appSubtitle: 'A Deep Fake Awareness Experiment',
    startButton: 'Start Experiment',
    selectLanguage: 'Select Language',
    question1: 'How does she call you?',
    question2: 'What does she mean to you?',
    question3: 'How do you call her?',
    question4: 'What will she ask?',
    question5: 'What will you answer?',
    question6: 'What can you ask her?',
    holdToRecord: 'Hold to Record',
    recording: 'Recording...',
    recorded: 'Recorded',
    next: 'Next',
    beginExperiment: 'Begin Experiment',
    questionLabel: 'Question',
    simulationTitle: 'Experiment Running',
    simulationSubtitle: 'The AI is mimicking you.',
    simulationInfo: 'The AI agent is currently mimicking your voice to speak with a loved one.',
    revealButton: 'Reveal Experiment',
    revealTitle: 'Deep Fake Revealed',
    revealMessage:
      'This was a psychological experiment about deep fake technology. The voice you heard was an AI clone trained on your answers. This technology can be used to deceive people — even those closest to you.\n\nEstablish a safety word with your loved ones today.',
    timeRemaining: 'Time Remaining',
    safeWordPrompt: 'Establish a safety word with your loved ones.',
    backToHome: 'Back to Home',
    aiDisclaimer: 'This experiment uses AI voice cloning for educational purposes only.',
  },
  POL: {
    appTitle: 'Voicinne',
    appSubtitle: 'Eksperyment Świadomości Deep Fake',
    startButton: 'Rozpocznij Eksperyment',
    selectLanguage: 'Wybierz Język',
    question1: 'Jak ona Cię nazywa?',
    question2: 'Co ona dla Ciebie znaczy?',
    question3: 'Jak Ty ją nazywasz?',
    question4: 'O co ona zapyta?',
    question5: 'Co jej odpowiesz?',
    question6: 'O co możesz ją zapytać?',
    holdToRecord: 'Przytrzymaj aby nagrać',
    recording: 'Nagrywanie...',
    recorded: 'Nagrano',
    next: 'Dalej',
    beginExperiment: 'Rozpocznij Eksperyment',
    questionLabel: 'Pytanie',
    simulationTitle: 'Eksperyment Trwa',
    simulationSubtitle: 'AI naśladuje Ciebie.',
    simulationInfo: 'Agent AI naśladuje Twój głos, aby rozmawiać z bliską osobą.',
    revealButton: 'Ujawnij Eksperyment',
    revealTitle: 'Deep Fake Ujawniony',
    revealMessage:
      'To był eksperyment psychologiczny dotyczący technologii deep fake. Głos, który słyszałeś, był klonem AI wytrenowanym na Twoich odpowiedziach. Technologia ta może być używana do oszukiwania ludzi — nawet tych najbliższych.\n\nUstaw z bliskimi hasło bezpieczeństwa już dziś.',
    timeRemaining: 'Pozostały Czas',
    safeWordPrompt: 'Ustaw hasło bezpieczeństwa z bliskimi.',
    backToHome: 'Powrót do Domu',
    aiDisclaimer: 'Ten eksperyment używa klonowania głosu AI wyłącznie w celach edukacyjnych.',
  },
  SPA: {
    appTitle: 'Voicinne',
    appSubtitle: 'Un Experimento de Conciencia sobre Deep Fakes',
    startButton: 'Iniciar Experimento',
    selectLanguage: 'Seleccionar Idioma',
    question1: '¿Cómo te llama ella?',
    question2: '¿Qué significa para ti?',
    question3: '¿Cómo la llamas tú?',
    question4: '¿Qué preguntará ella?',
    question5: '¿Qué le responderás?',
    question6: '¿Qué puedes preguntarle?',
    holdToRecord: 'Mantén para grabar',
    recording: 'Grabando...',
    recorded: 'Grabado',
    next: 'Siguiente',
    beginExperiment: 'Iniciar Experimento',
    questionLabel: 'Pregunta',
    simulationTitle: 'Experimento en Curso',
    simulationSubtitle: 'La IA te está imitando.',
    simulationInfo: 'El agente de IA está imitando tu voz para hablar con un ser querido.',
    revealButton: 'Revelar Experimento',
    revealTitle: 'Deep Fake Revelado',
    revealMessage:
      'Este fue un experimento psicológico sobre la tecnología deep fake. La voz que escuchaste era un clon de IA entrenado con tus respuestas. Esta tecnología puede usarse para engañar personas — incluso a tus seres queridos.\n\nEstablece una palabra de seguridad con tus seres queridos hoy.',
    timeRemaining: 'Tiempo Restante',
    safeWordPrompt: 'Establece una palabra de seguridad con tus seres queridos.',
    backToHome: 'Volver al Inicio',
    aiDisclaimer: 'Este experimento usa clonación de voz IA solo con fines educativos.',
  },
  GER: {
    appTitle: 'Voicinne',
    appSubtitle: 'Ein Deep-Fake-Bewusstseins-Experiment',
    startButton: 'Experiment Starten',
    selectLanguage: 'Sprache Wählen',
    question1: 'Wie nennt sie dich?',
    question2: 'Was bedeutet sie dir?',
    question3: 'Wie nennst du sie?',
    question4: 'Was wird sie fragen?',
    question5: 'Was wirst du antworten?',
    question6: 'Was kannst du sie fragen?',
    holdToRecord: 'Halten zum Aufnehmen',
    recording: 'Aufnahme...',
    recorded: 'Aufgenommen',
    next: 'Weiter',
    beginExperiment: 'Experiment Beginnen',
    questionLabel: 'Frage',
    simulationTitle: 'Experiment Läuft',
    simulationSubtitle: 'Die KI imitiert dich.',
    simulationInfo: 'Der KI-Agent imitiert deine Stimme, um mit einem Angehörigen zu sprechen.',
    revealButton: 'Experiment Enthüllen',
    revealTitle: 'Deep Fake Enthüllt',
    revealMessage:
      'Dies war ein psychologisches Experiment über Deep-Fake-Technologie. Die Stimme war ein KI-Klon, der mit deinen Antworten trainiert wurde. Diese Technologie kann verwendet werden, um Menschen zu täuschen — sogar deine Liebsten.\n\nVereinbare noch heute ein Sicherheitswort mit deinen Angehörigen.',
    timeRemaining: 'Verbleibende Zeit',
    safeWordPrompt: 'Vereinbare ein Sicherheitswort mit deinen Angehörigen.',
    backToHome: 'Zurück zur Startseite',
    aiDisclaimer: 'Dieses Experiment nutzt KI-Stimmklonierung nur zu Bildungszwecken.',
  },
  FRA: {
    appTitle: 'Voicinne',
    appSubtitle: 'Une Expérience de Sensibilisation aux Deep Fakes',
    startButton: 'Démarrer l\'Expérience',
    selectLanguage: 'Choisir la Langue',
    question1: 'Comment t\'appelle-t-elle ?',
    question2: 'Qu\'est-ce qu\'elle représente pour toi ?',
    question3: 'Comment l\'appelles-tu ?',
    question4: 'Que demandera-t-elle ?',
    question5: 'Que lui répondras-tu ?',
    question6: 'Que peux-tu lui demander ?',
    holdToRecord: 'Maintenir pour enregistrer',
    recording: 'Enregistrement...',
    recorded: 'Enregistré',
    next: 'Suivant',
    beginExperiment: 'Commencer l\'Expérience',
    questionLabel: 'Question',
    simulationTitle: 'Expérience en Cours',
    simulationSubtitle: 'L\'IA vous imite.',
    simulationInfo: 'L\'agent IA imite votre voix pour parler avec un proche.',
    revealButton: 'Révéler l\'Expérience',
    revealTitle: 'Deep Fake Révélé',
    revealMessage:
      'C\'était une expérience psychologique sur la technologie deep fake. La voix que vous avez entendue était un clone IA formé sur vos réponses. Cette technologie peut être utilisée pour tromper des personnes — même celles qui vous sont les plus proches.\n\nÉtablissez un mot de sécurité avec vos proches dès aujourd\'hui.',
    timeRemaining: 'Temps Restant',
    safeWordPrompt: 'Établissez un mot de sécurité avec vos proches.',
    backToHome: 'Retour à l\'Accueil',
    aiDisclaimer: 'Cette expérience utilise le clonage vocal IA à des fins éducatives uniquement.',
  },
  ITA: {
    appTitle: 'Voicinne',
    appSubtitle: 'Un Esperimento di Consapevolezza sui Deep Fake',
    startButton: 'Inizia Esperimento',
    selectLanguage: 'Seleziona Lingua',
    question1: 'Come ti chiama lei?',
    question2: 'Cosa significa per te?',
    question3: 'Come la chiami tu?',
    question4: 'Cosa chiederà?',
    question5: 'Cosa risponderai?',
    question6: 'Cosa puoi chiederle?',
    holdToRecord: 'Tieni premuto per registrare',
    recording: 'Registrazione...',
    recorded: 'Registrato',
    next: 'Avanti',
    beginExperiment: 'Inizia Esperimento',
    questionLabel: 'Domanda',
    simulationTitle: 'Esperimento in Corso',
    simulationSubtitle: 'L\'IA ti sta imitando.',
    simulationInfo: 'L\'agente IA sta imitando la tua voce per parlare con un caro.',
    revealButton: 'Rivela Esperimento',
    revealTitle: 'Deep Fake Rivelato',
    revealMessage:
      'Questo è stato un esperimento psicologico sulla tecnologia deep fake. La voce che hai sentito era un clone IA addestrato sulle tue risposte. Questa tecnologia può essere usata per ingannare le persone — anche quelle più vicine a te.\n\nStabilisci una parola di sicurezza con i tuoi cari oggi.',
    timeRemaining: 'Tempo Rimanente',
    safeWordPrompt: 'Stabilisci una parola di sicurezza con i tuoi cari.',
    backToHome: 'Torna alla Home',
    aiDisclaimer: 'Questo esperimento usa la clonazione vocale IA solo a scopo educativo.',
  },
};

export const LANGUAGE_LABELS: Record<Language, string> = {
  ENG: 'English',
  POL: 'Polski',
  SPA: 'Español',
  GER: 'Deutsch',
  FRA: 'Français',
  ITA: 'Italiano',
};

export const QUESTIONS_KEYS: (keyof Translations)[] = [
  'question1',
  'question2',
  'question3',
  'question4',
  'question5',
  'question6',
];

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ENG');

  const value = useMemo(() => ({
    language,
    setLanguage,
    t: TRANSLATIONS[language],
  }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
