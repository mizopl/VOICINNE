import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';

export type Language = 'ENG' | 'POL' | 'SPA' | 'GER' | 'FRA' | 'ITA';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  startButton: string;
  selectLanguage: string;
  roleplayTitle: string;
  roleplayInstructions: string;
  roleplayExample: string;
  tapToRecord: string;
  stopRecording: string;
  holdToRecord: string;
  recording: string;
  recorded: string;
  beginExperiment: string;
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
  processingVoice: string;
  micPermissionTitle: string;
  micPermissionDenied: string;
}

const TRANSLATIONS: Record<Language, Translations> = {
  ENG: {
    appTitle: 'Voicinne',
    appSubtitle: 'A Deep Fake Awareness Experiment',
    startButton: 'Start Experiment',
    selectLanguage: 'Select Language',
    roleplayTitle: 'Prepare for the Simulation',
    roleplayInstructions: "Let's roleplay! You have 60 seconds. Pretend you're having a phone call with your loved one. Start as yourself, then switch and play their voice too — back and forth.",
    roleplayExample: "E.g.: 'Hey grandma!' → 'Oh hi sweetheart, what's up?'",
    tapToRecord: 'Tap to start recording',
    stopRecording: 'Tap to stop',
    holdToRecord: 'Tap to Record',
    recording: 'Recording...',
    recorded: 'Recorded',
    beginExperiment: 'Begin Experiment',
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
    processingVoice: 'Processing voice profile...',
    micPermissionTitle: 'Microphone Access Required',
    micPermissionDenied: 'Voicinne needs microphone access to record your voice. Please enable it in Settings.',
  },
  POL: {
    appTitle: 'Voicinne',
    appSubtitle: 'Eksperyment Świadomości Deep Fake',
    startButton: 'Rozpocznij Eksperyment',
    selectLanguage: 'Wybierz Język',
    roleplayTitle: 'Przygotowanie do symulacji',
    roleplayInstructions: 'Odgrywamy scenkę! Masz 60 sekund. Udawaj, że prowadzisz rozmowę ze swoim bliskim. Zacznij jako ty, a potem odgrywaj również głos rozmówcy naprzemiennie.',
    roleplayExample: "Np: 'Cześć babciu!' -> 'Cześć wnusiu, co tam?'",
    tapToRecord: 'Naciśnij aby zacząć nagrywać',
    stopRecording: 'Naciśnij aby zatrzymać',
    holdToRecord: 'Przytrzymaj aby nagrać',
    recording: 'Nagrywanie...',
    recorded: 'Nagrano',
    beginExperiment: 'Rozpocznij Eksperyment',
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
    processingVoice: 'Przetwarzanie profilu głosu...',
    micPermissionTitle: 'Wymagany Dostęp do Mikrofonu',
    micPermissionDenied: 'Voicinne potrzebuje dostępu do mikrofonu. Włącz go w Ustawieniach.',
  },
  SPA: {
    appTitle: 'Voicinne',
    appSubtitle: 'Un Experimento de Conciencia sobre Deep Fakes',
    startButton: 'Iniciar Experimento',
    selectLanguage: 'Seleccionar Idioma',
    roleplayTitle: 'Preparación para la simulación',
    roleplayInstructions: '¡Hagamos un juego de rol! Tienes 60 segundos. Simula que estás hablando por teléfono con tu ser querido. Empieza como tú mismo y luego alterna interpretando también la voz del otro.',
    roleplayExample: "Ej: '¡Hola abuela!' → '¡Hola cariño, qué tal?'",
    tapToRecord: 'Toca para empezar a grabar',
    stopRecording: 'Toca para detener',
    holdToRecord: 'Mantén para grabar',
    recording: 'Grabando...',
    recorded: 'Grabado',
    beginExperiment: 'Iniciar Experimento',
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
    processingVoice: 'Procesando perfil de voz...',
    micPermissionTitle: 'Acceso al Micrófono Requerido',
    micPermissionDenied: 'Voicinne necesita acceso al micrófono. Actívalo en Ajustes.',
  },
  GER: {
    appTitle: 'Voicinne',
    appSubtitle: 'Ein Deep-Fake-Bewusstseins-Experiment',
    startButton: 'Experiment Starten',
    selectLanguage: 'Sprache Wählen',
    roleplayTitle: 'Vorbereitung auf die Simulation',
    roleplayInstructions: 'Lass uns ein Rollenspiel machen! Du hast 60 Sekunden. Stell dir vor, du telefonierst mit deinem Angehörigen. Fang als du selbst an und wechsle dann abwechselnd in die Rolle des anderen.',
    roleplayExample: "Z.B.: 'Hallo Oma!' → 'Oh hallo Schatz, was gibt's?'",
    tapToRecord: 'Tippen um die Aufnahme zu starten',
    stopRecording: 'Tippen um zu stoppen',
    holdToRecord: 'Halten zum Aufnehmen',
    recording: 'Aufnahme...',
    recorded: 'Aufgenommen',
    beginExperiment: 'Experiment Beginnen',
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
    processingVoice: 'Stimmprofil wird verarbeitet...',
    micPermissionTitle: 'Mikrofonzugriff Erforderlich',
    micPermissionDenied: 'Voicinne benötigt Mikrofonzugriff. Bitte aktiviere ihn in den Einstellungen.',
  },
  FRA: {
    appTitle: 'Voicinne',
    appSubtitle: 'Une Expérience de Sensibilisation aux Deep Fakes',
    startButton: 'Démarrer l\'Expérience',
    selectLanguage: 'Choisir la Langue',
    roleplayTitle: 'Préparation à la simulation',
    roleplayInstructions: 'Faisons un jeu de rôle ! Tu as 60 secondes. Fais semblant d\'avoir une conversation téléphonique avec ton proche. Commence en jouant ton rôle, puis alterne en jouant aussi la voix de l\'autre.',
    roleplayExample: "Ex : 'Salut mamie !' → 'Oh bonjour chéri(e), quoi de neuf ?'",
    tapToRecord: 'Appuyer pour commencer l\'enregistrement',
    stopRecording: 'Appuyer pour arrêter',
    holdToRecord: 'Maintenir pour enregistrer',
    recording: 'Enregistrement...',
    recorded: 'Enregistré',
    beginExperiment: 'Commencer l\'Expérience',
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
    processingVoice: 'Traitement du profil vocal...',
    micPermissionTitle: 'Accès au Microphone Requis',
    micPermissionDenied: 'Voicinne nécessite l\'accès au microphone. Activez-le dans les Paramètres.',
  },
  ITA: {
    appTitle: 'Voicinne',
    appSubtitle: 'Un Esperimento di Consapevolezza sui Deep Fake',
    startButton: 'Inizia Esperimento',
    selectLanguage: 'Seleziona Lingua',
    roleplayTitle: 'Preparazione alla simulazione',
    roleplayInstructions: 'Facciamo un gioco di ruolo! Hai 60 secondi. Fai finta di avere una conversazione telefonica con il tuo caro. Inizia come te stesso, poi alterna interpretando anche la voce dell\'altro.',
    roleplayExample: "Es: 'Ciao nonna!' → 'Oh ciao tesoro, cosa c'è?'",
    tapToRecord: 'Tocca per iniziare a registrare',
    stopRecording: 'Tocca per fermare',
    holdToRecord: 'Tieni premuto per registrare',
    recording: 'Registrazione...',
    recorded: 'Registrato',
    beginExperiment: 'Inizia Esperimento',
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
    processingVoice: 'Elaborazione profilo vocale...',
    micPermissionTitle: 'Accesso al Microfono Richiesto',
    micPermissionDenied: 'Voicinne necessita l\'accesso al microfono. Abilitalo nelle Impostazioni.',
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
