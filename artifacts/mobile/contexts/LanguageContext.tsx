import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';

export type Language = 'ENG' | 'POL' | 'SPA' | 'GER' | 'FRA' | 'ITA';

export interface Translations {
  appTitle: string;
  appTagline: string;
  appDescription: string;
  startButton: string;
  selectLanguage: string;
  recordingTitle: string;
  recordingInstructions: string;
  onboardingSubtitle: string;
  step1Header: string;
  step1Desc: string;
  step2Header: string;
  step2Desc: string;
  step3Header: string;
  step3Desc: string;
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
    appTagline: 'Protect your loved ones from AI voice scams.',
    appDescription:
      'Clone your own voice in just 60 seconds to safely simulate a deepfake phone call with your family. Give them the experience of an AI scam in a safe environment, so they know exactly how to protect themselves in the real world.',
    startButton: 'Start the Simulation',
    selectLanguage: 'Select Language',
    recordingTitle: 'A voice clone from just 60 seconds of recording.',
    recordingInstructions: "First, record a spoken title, for example: 'This is a phone call to my grandmother who is celebrating her birthday this weekend.' Then, immediately pretend you are having a conversation with her. Our system will extract all the necessary identity data and context from your words.",
    onboardingSubtitle: 'Three simple steps. Sixty seconds. Maximum impact.',
    step1Header: 'Set the Scene',
    step1Desc: 'Start by saying aloud who you want the AI to call — e.g. "This is a call to my grandma whose birthday is tomorrow."',
    step2Header: 'Play the Part',
    step2Desc: 'Immediately start your fake conversation. Talk naturally as if they just picked up the phone.',
    step3Header: 'We Do the Rest',
    step3Desc: 'Our system clones your voice and builds a full conversational persona from your recording.',
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
    aiDisclaimer:
      'Educational Purpose Only: This app uses advanced Voice AI to teach cybersecurity. Voice recordings are stored securely for educational and security audit purposes.',
    processingVoice: 'Processing voice profile...',
    micPermissionTitle: 'Microphone Access Required',
    micPermissionDenied: 'Voicinne needs microphone access to record your voice. Please enable it in Settings.',
  },
  POL: {
    appTitle: 'Voicinne',
    appTagline: 'Chroń swoich bliskich przed oszustwami głosowymi AI.',
    appDescription:
      'Sklonuj swój głos w zaledwie 60 sekund, aby bezpiecznie zasymulować deepfake\'ową rozmowę telefoniczną z rodziną. Daj im doświadczenie ataku AI w bezpiecznym środowisku — żeby wiedzieli, jak się bronić w prawdziwym życiu.',
    startButton: 'Rozpocznij Symulację',
    selectLanguage: 'Wybierz Język',
    recordingTitle: 'Klon głosu z zaledwie 60 sekund nagrania.',
    recordingInstructions: "Najpierw nagraj tytuł mówiony, na przykład: 'To jest rozmowa telefoniczna do mojej babci, która obchodzi swoje urodziny w ten weekend.' Następnie natychmiast udawaj, że rozmawiasz z nią. Nasz system wyodrębni wszystkie niezbędne dane tożsamości i kontekst z Twoich słów.",
    onboardingSubtitle: 'Trzy proste kroki. Sześćdziesiąt sekund. Maksymalny efekt.',
    step1Header: 'Ustaw scenę',
    step1Desc: 'Powiedz głośno, do kogo AI ma zadzwonić — np. „To rozmowa telefoniczna do mojej babci, która jutro obchodzi urodziny."',
    step2Header: 'Zagraj swoją rolę',
    step2Desc: 'Od razu zacznij fikcyjną rozmowę. Mów naturalnie, jakby ta osoba właśnie odebrała telefon.',
    step3Header: 'Resztą zajmiemy się my',
    step3Desc: 'Nasz system sklonuje Twój głos i zbuduje pełną personę konwersacyjną na podstawie nagrania.',
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
    aiDisclaimer:
      'Tylko do celów edukacyjnych: Ta aplikacja używa zaawansowanej sztucznej inteligencji do nauczania cyberbezpieczeństwa. Nagrania głosowe są bezpiecznie przechowywane w celach edukacyjnych i audytu bezpieczeństwa.',
    processingVoice: 'Przetwarzanie profilu głosu...',
    micPermissionTitle: 'Wymagany Dostęp do Mikrofonu',
    micPermissionDenied: 'Voicinne potrzebuje dostępu do mikrofonu. Włącz go w Ustawieniach.',
  },
  SPA: {
    appTitle: 'Voicinne',
    appTagline: 'Protege a tus seres queridos de las estafas de voz con IA.',
    appDescription:
      'Clona tu voz en tan solo 60 segundos para simular de forma segura una llamada deepfake con tu familia. Dales la experiencia de una estafa de IA en un entorno seguro, para que sepan exactamente cómo protegerse en el mundo real.',
    startButton: 'Iniciar la Simulación',
    selectLanguage: 'Seleccionar Idioma',
    recordingTitle: 'Un clon de voz en tan solo 60 segundos de grabación.',
    recordingInstructions: "Primero, graba un título hablado, por ejemplo: 'Esta es una llamada telefónica a mi abuela que celebra su cumpleaños este fin de semana.' Luego, imagina inmediatamente que estás hablando con ella. Nuestro sistema extraerá todos los datos de identidad y el contexto necesarios de tus palabras.",
    onboardingSubtitle: 'Tres pasos simples. Sesenta segundos. Máximo impacto.',
    step1Header: 'Prepara la escena',
    step1Desc: 'Di en voz alta a quién quieres que llame la IA — p. ej. "Esta es una llamada a mi abuela cuyo cumpleaños es mañana."',
    step2Header: 'Interpreta tu papel',
    step2Desc: 'Empieza inmediatamente la conversación fingida. Habla con naturalidad como si acabaran de contestar.',
    step3Header: 'Nosotros hacemos el resto',
    step3Desc: 'Nuestro sistema clonará tu voz y construirá una persona conversacional completa a partir de tu grabación.',
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
    aiDisclaimer:
      'Solo para fines educativos: Esta aplicación usa IA de voz avanzada para enseñar ciberseguridad. Las grabaciones de voz se almacenan de forma segura con fines educativos y de auditoría de seguridad.',
    processingVoice: 'Procesando perfil de voz...',
    micPermissionTitle: 'Acceso al Micrófono Requerido',
    micPermissionDenied: 'Voicinne necesita acceso al micrófono. Actívalo en Ajustes.',
  },
  GER: {
    appTitle: 'Voicinne',
    appTagline: 'Schütze deine Liebsten vor KI-Stimmenbetrug.',
    appDescription:
      'Klone deine Stimme in nur 60 Sekunden, um sicher einen Deepfake-Anruf mit deiner Familie zu simulieren. Gib ihnen die Erfahrung eines KI-Betrugs in einer sicheren Umgebung, damit sie wissen, wie sie sich in der echten Welt schützen können.',
    startButton: 'Simulation Starten',
    selectLanguage: 'Sprache Wählen',
    recordingTitle: 'Ein Stimmklon aus nur 60 Sekunden Aufnahme.',
    recordingInstructions: "Beginne mit einem gesprochenen Titel, zum Beispiel: 'Das ist ein Telefonanruf an meine Oma, die dieses Wochenende Geburtstag feiert.' Dann spiel sofort eine Unterhaltung mit ihr nach. Unser System extrahiert alle nötigen Identitätsdaten und Kontext aus deinen Worten.",
    onboardingSubtitle: 'Drei einfache Schritte. Sechzig Sekunden. Maximale Wirkung.',
    step1Header: 'Die Szene setzen',
    step1Desc: 'Sag laut, wen die KI anrufen soll — z. B. „Das ist ein Anruf bei meiner Oma, die morgen Geburtstag hat."',
    step2Header: 'Die Rolle spielen',
    step2Desc: 'Beginne sofort dein Fiktivgespräch. Rede natürlich, als hättest du gerade jemanden erreicht.',
    step3Header: 'Den Rest erledigen wir',
    step3Desc: 'Unser System klont deine Stimme und erstellt aus der Aufnahme ein vollständiges Gesprächsprofil.',
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
    aiDisclaimer:
      'Nur zu Bildungszwecken: Diese App verwendet fortschrittliche KI-Sprachtechnologie, um Cybersicherheit zu vermitteln. Sprachaufnahmen werden sicher für Bildungs- und Sicherheitsauditzwecke gespeichert.',
    processingVoice: 'Stimmprofil wird verarbeitet...',
    micPermissionTitle: 'Mikrofonzugriff Erforderlich',
    micPermissionDenied: 'Voicinne benötigt Mikrofonzugriff. Bitte aktiviere ihn in den Einstellungen.',
  },
  FRA: {
    appTitle: 'Voicinne',
    appTagline: 'Protégez vos proches des arnaques vocales par IA.',
    appDescription:
      'Clonez votre voix en seulement 60 secondes pour simuler en toute sécurité un appel deepfake avec votre famille. Donnez-leur l\'expérience d\'une arnaque IA dans un environnement sûr, afin qu\'ils sachent exactement comment se protéger dans le monde réel.',
    startButton: 'Démarrer la Simulation',
    selectLanguage: 'Choisir la Langue',
    recordingTitle: 'Un clone vocal en seulement 60 secondes d\'enregistrement.',
    recordingInstructions: "Commencez par enregistrer un titre parlé, par exemple : 'C'est un appel téléphonique à ma grand-mère qui fête son anniversaire ce week-end.' Puis, faites immédiatement semblant d'avoir une conversation avec elle. Notre système extraira toutes les données d'identité et le contexte nécessaires de vos mots.",
    onboardingSubtitle: 'Trois étapes simples. Soixante secondes. Impact maximal.',
    step1Header: 'Plantez le décor',
    step1Desc: 'Dites à voix haute qui vous voulez que l\'IA appelle — ex. « C\'est un appel à ma grand-mère dont l\'anniversaire est demain. »',
    step2Header: 'Jouez le jeu',
    step2Desc: 'Commencez immédiatement votre fausse conversation. Parlez naturellement comme si la personne venait de décrocher.',
    step3Header: 'On s\'occupe du reste',
    step3Desc: 'Notre système clone votre voix et construit un profil conversationnel complet à partir de votre enregistrement.',
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
    aiDisclaimer:
      'À des fins éducatives uniquement : Cette application utilise une IA vocale avancée pour enseigner la cybersécurité. Les enregistrements vocaux sont stockés en toute sécurité à des fins éducatives et d\'audit de sécurité.',
    processingVoice: 'Traitement du profil vocal...',
    micPermissionTitle: 'Accès au Microphone Requis',
    micPermissionDenied: 'Voicinne nécessite l\'accès au microphone. Activez-le dans les Paramètres.',
  },
  ITA: {
    appTitle: 'Voicinne',
    appTagline: 'Proteggi i tuoi cari dalle truffe vocali con l\'IA.',
    appDescription:
      'Clona la tua voce in soli 60 secondi per simulare in modo sicuro una telefonata deepfake con la tua famiglia. Dagli l\'esperienza di una truffa IA in un ambiente sicuro, così sapranno esattamente come proteggersi nel mondo reale.',
    startButton: 'Avvia la Simulazione',
    selectLanguage: 'Seleziona Lingua',
    recordingTitle: 'Un clone vocale da soli 60 secondi di registrazione.',
    recordingInstructions: "Prima, registra un titolo parlato, ad esempio: 'Questa è una telefonata a mia nonna che festeggia il suo compleanno questo fine settimana.' Poi, fai subito finta di avere una conversazione con lei. Il nostro sistema estrarrà tutti i dati di identità e il contesto necessari dalle tue parole.",
    onboardingSubtitle: 'Tre semplici passi. Sessanta secondi. Impatto massimo.',
    step1Header: 'Prepara la scena',
    step1Desc: 'Di\' ad alta voce chi vuoi che l\'IA chiami — es. "Questa è una chiamata a mia nonna, il cui compleanno è domani."',
    step2Header: 'Recita la parte',
    step2Desc: 'Inizia subito la tua conversazione fittizia. Parla in modo naturale come se l\'altro avesse appena risposto.',
    step3Header: 'Al resto pensiamo noi',
    step3Desc: 'Il nostro sistema clonerà la tua voce e costruirà un profilo conversazionale completo dalla tua registrazione.',
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
    aiDisclaimer:
      'Solo a scopo educativo: Questa app utilizza un\'IA vocale avanzata per insegnare la cybersicurezza. Le registrazioni vocali vengono archiviate in modo sicuro per scopi educativi e di audit della sicurezza.',
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
