import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';

export type Language = 'ENG' | 'POL' | 'SPA' | 'GER' | 'FRA' | 'ITA';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  startButton: string;
  selectLanguage: string;
  recordingTitle: string;
  recordingInstructions: string;
  startRecordingBtn: string;
  promptText: string;
  stopRecording: string;
  recording: string;
  recorded: string;
  listenBack: string;
  reRecord: string;
  sendForCloning: string;
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
    recordingTitle: 'A voice clone from just 60 seconds of recording.',
    recordingInstructions: "First, record a spoken title, for example: 'This is a phone call to my grandmother who is celebrating her birthday this weekend.' Then, immediately pretend you are having a conversation with her. Our system will extract all the necessary identity data and context from your words.",
    startRecordingBtn: 'Start Recording (60s)',
    promptText: 'Hello? Who is calling?',
    stopRecording: 'Stop',
    recording: 'Recording...',
    recorded: 'Recording saved',
    listenBack: 'Tap to listen back',
    reRecord: 'Re-record',
    sendForCloning: 'Send for Voice Cloning',
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
    recordingTitle: 'Klon głosu z zaledwie 60 sekund nagrania.',
    recordingInstructions: "Najpierw nagraj tytuł mówiony, na przykład: 'To jest rozmowa telefoniczna do mojej babci, która obchodzi swoje urodziny w ten weekend.' Następnie natychmiast udawaj, że rozmawiasz z nią. Nasz system wyodrębni wszystkie niezbędne dane tożsamości i kontekst z Twoich słów.",
    startRecordingBtn: 'Rozpocznij nagrywanie (60s)',
    promptText: 'Halo? Kto mówi?',
    stopRecording: 'Zatrzymaj',
    recording: 'Nagrywanie...',
    recorded: 'Nagranie zapisane',
    listenBack: 'Dotknij, aby odsłuchać',
    reRecord: 'Nagraj ponownie',
    sendForCloning: 'Wyślij do klonowania głosu',
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
    recordingTitle: 'Un clon de voz en tan solo 60 segundos de grabación.',
    recordingInstructions: "Primero, graba un título hablado, por ejemplo: 'Esta es una llamada telefónica a mi abuela que celebra su cumpleaños este fin de semana.' Luego, imagina inmediatamente que estás hablando con ella. Nuestro sistema extraerá todos los datos de identidad y el contexto necesarios de tus palabras.",
    startRecordingBtn: 'Iniciar grabación (60s)',
    promptText: '¿Hola? ¿Quién llama?',
    stopRecording: 'Detener',
    recording: 'Grabando...',
    recorded: 'Grabación guardada',
    listenBack: 'Toca para escuchar',
    reRecord: 'Volver a grabar',
    sendForCloning: 'Enviar para clonar voz',
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
    recordingTitle: 'Ein Stimmklon aus nur 60 Sekunden Aufnahme.',
    recordingInstructions: "Beginne mit einem gesprochenen Titel, zum Beispiel: 'Das ist ein Telefonanruf an meine Oma, die dieses Wochenende Geburtstag feiert.' Dann spiel sofort eine Unterhaltung mit ihr nach. Unser System extrahiert alle nötigen Identitätsdaten und Kontext aus deinen Worten.",
    startRecordingBtn: 'Aufnahme starten (60s)',
    promptText: 'Hallo? Wer spricht da?',
    stopRecording: 'Stoppen',
    recording: 'Aufnahme läuft...',
    recorded: 'Aufnahme gespeichert',
    listenBack: 'Tippen zum Abspielen',
    reRecord: 'Erneut aufnehmen',
    sendForCloning: 'Zur Stimmklonierung senden',
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
    recordingTitle: 'Un clone vocal en seulement 60 secondes d\'enregistrement.',
    recordingInstructions: "Commencez par enregistrer un titre parlé, par exemple : 'C'est un appel téléphonique à ma grand-mère qui fête son anniversaire ce week-end.' Puis, faites immédiatement semblant d'avoir une conversation avec elle. Notre système extraira toutes les données d'identité et le contexte nécessaires de vos mots.",
    startRecordingBtn: 'Démarrer l\'enregistrement (60s)',
    promptText: 'Allô ? Qui est à l\'appareil ?',
    stopRecording: 'Arrêter',
    recording: 'Enregistrement...',
    recorded: 'Enregistrement sauvegardé',
    listenBack: 'Appuyer pour écouter',
    reRecord: 'Réenregistrer',
    sendForCloning: 'Envoyer pour le clonage vocal',
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
    recordingTitle: 'Un clone vocale da soli 60 secondi di registrazione.',
    recordingInstructions: "Prima, registra un titolo parlato, ad esempio: 'Questa è una telefonata a mia nonna che festeggia il suo compleanno questo fine settimana.' Poi, fai subito finta di avere una conversazione con lei. Il nostro sistema estrarrà tutti i dati di identità e il contesto necessari dalle tue parole.",
    startRecordingBtn: 'Inizia registrazione (60s)',
    promptText: 'Pronto? Chi parla?',
    stopRecording: 'Ferma',
    recording: 'Registrazione...',
    recorded: 'Registrazione salvata',
    listenBack: 'Tocca per ascoltare',
    reRecord: 'Registra di nuovo',
    sendForCloning: 'Invia per la clonazione vocale',
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
