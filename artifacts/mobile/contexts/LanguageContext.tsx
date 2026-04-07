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
  revealStat: string;
  revealStatCaption: string;
  revealMessage: string;
  revealRisksTitle: string;
  timeRemaining: string;
  safeWordPrompt: string;
  backToHome: string;
  aiDisclaimer: string;
  processingVoice: string;
  micPermissionTitle: string;
  micPermissionDenied: string;
  homeSlogan: string;
  consentText: string;
  micDenied: string;
  scams: Array<{ label: string; desc: string }>;
  processingSteps: string[];
  callStatusIdle: string;
  callStatusConnecting: string;
  callStatusEnding: string;
  callStatusSpeaking: string;
  callStatusListening: string;
  simulationDisclaimer: string;
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
    revealTitle: "You've Just Been Deepfaked.",
    revealStat: '15 seconds',
    revealStatCaption: "That's all modern AI needs to clone anyone's voice — including yours.",
    revealMessage:
      "The voice you just heard was generated in real-time by an AI that cloned a voice from just 60 seconds of audio. It was designed to sound exactly like someone you trust.\n\nThis technology is already used by criminals to impersonate family members, executives, and officials — tricking people into transferring money, sharing passwords, or revealing personal information.",
    revealRisksTitle: 'Voice is just the beginning.',
    timeRemaining: 'Time Remaining',
    safeWordPrompt: 'Agree on a secret code word with your family. Only you will know it — use it to instantly verify a caller is really them.',
    backToHome: 'Back to Home',
    aiDisclaimer:
      'Educational Purpose Only: This app uses advanced Voice AI to teach cybersecurity. Audio recordings can be stored securely for educational and security audit purposes.',
    simulationDisclaimer:
      "This simulation uses your device's speaker and microphone only. It does not place a real call and has no access to your phonebook. For the best effect, play it while standing next to the person you want to educate.",
    processingVoice: 'Processing voice profile...',
    micPermissionTitle: 'Microphone Access Required',
    micPermissionDenied: 'Voicinne needs microphone access to record your voice. Please enable it in Settings.',
    homeSlogan: "That's all AI needs to clone your voice.",
    consentText: "Educational Purpose Only: This app uses advanced Voice AI to teach cybersecurity. Audio recordings can be stored securely for educational and security audit purposes.",
    micDenied: 'Mic access denied',
    scams: [
      { label: 'Fake Kidnapping', desc: "Scammers clone a child's voice to call parents demanding ransom — from a 15-second clip." },
      { label: 'CEO Fraud', desc: "AI mimics your boss's voice, authorising an urgent six-figure wire transfer." },
      { label: 'Voice ID Bypass', desc: 'Synthetic voices defeat bank voice-authentication systems, draining accounts silently.' },
      { label: 'Grandparent Scam', desc: 'Elderly relatives get a call — your voice, your words — begging for emergency cash.' },
      { label: 'Romance Manipulation', desc: 'Cloned voices sustain fake relationships across months, extracting money and secrets.' },
      { label: 'Information Extraction', desc: 'AI impersonates family members to trick you into sharing passwords or personal data.' },
    ],
    processingSteps: [
      'Uploading audio sample...',
      'Transcribing speech to text...',
      'Analyzing vocal timbre and pitch...',
      'Isolating linguistic fingerprint...',
      'Extracting relational context...',
      'Cloning acoustic model...',
      'Building deep fake persona...',
      'Configuring conversational AI agent...',
      'Finalizing neural bridge...',
      'Synchronizing voice identity...',
    ],
    callStatusIdle: 'Tap to connect the AI agent',
    callStatusConnecting: 'Connecting…',
    callStatusEnding: 'Ending call…',
    callStatusSpeaking: 'AI agent is speaking',
    callStatusListening: 'Listening…',
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
    revealTitle: 'Właśnie Padłeś Ofiarą Deepfake\'a.',
    revealStat: '15 sekund',
    revealStatCaption: 'Tyle wystarczy nowoczesnej AI, aby sklonować czyjkolwiek głos — włącznie z Twoim.',
    revealMessage:
      'Głos, który właśnie usłyszałeś, był wygenerowany w czasie rzeczywistym przez sztuczną inteligencję, która sklonowała go z zaledwie 60 sekund nagrania. Zaprojektowano go tak, by brzmiał dokładnie jak ktoś, komu ufasz.\n\nTa technologia jest już wykorzystywana przez przestępców do podszywania się pod członków rodziny, szefów i urzędników — nakłaniając ludzi do przelewania pieniędzy, podawania haseł lub ujawniania danych osobowych.',
    revealRisksTitle: 'Głos to tylko początek.',
    timeRemaining: 'Pozostały Czas',
    safeWordPrompt: 'Ustalcie z rodziną tajne hasło bezpieczeństwa. Tylko wy je znacie — używajcie go, żeby natychmiast sprawdzić, czy dzwoniący to naprawdę ta osoba.',
    backToHome: 'Powrót do Domu',
    aiDisclaimer:
      'Tylko do celów edukacyjnych: Ta aplikacja używa zaawansowanego głosowego AI do nauczania cyberbezpieczeństwa. Nagrania audio mogą być bezpiecznie przechowywane w celach edukacyjnych i audytu bezpieczeństwa.',
    simulationDisclaimer:
      'Ta symulacja używa wyłącznie głośnika i mikrofonu Twojego urządzenia. Nie wykonuje prawdziwego połączenia i nie ma dostępu do Twojej książki adresowej. Dla najlepszego efektu uruchom ją stojąc obok osoby, którą chcesz edukować.',
    processingVoice: 'Przetwarzanie profilu głosu...',
    micPermissionTitle: 'Wymagany Dostęp do Mikrofonu',
    micPermissionDenied: 'Voicinne potrzebuje dostępu do mikrofonu. Włącz go w Ustawieniach.',
    homeSlogan: 'Tyle wystarczy AI, by sklonować Twój głos.',
    consentText: 'Tylko do celów edukacyjnych: Ta aplikacja używa zaawansowanego głosowego AI do nauczania cyberbezpieczeństwa. Nagrania audio mogą być bezpiecznie przechowywane w celach edukacyjnych i audytu bezpieczeństwa.',
    micDenied: 'Odmowa dostępu do mikrofonu',
    scams: [
      { label: 'Fałszywe Porwanie', desc: 'Oszuści klonują głos dziecka, by zadzwonić do rodziców z żądaniem okupu — z zaledwie 15-sekundowego nagrania.' },
      { label: 'Oszustwo CEO', desc: 'AI naśladuje głos szefa, autoryzując pilny przelew na sześciocyfrową kwotę.' },
      { label: 'Ominięcie Weryfikacji Głosowej', desc: 'Syntetyczne głosy pokonują bankowe systemy weryfikacji, po cichu opróżniając konta.' },
      { label: 'Oszustwo na Dziadka', desc: 'Starsi krewni odbierają telefon — Twoim głosem, Twoimi słowami — z prośbą o pilną gotówkę.' },
      { label: 'Manipulacja Romantyczna', desc: 'Sklonowane głosy podtrzymują fałszywe relacje przez miesiące, wyłudzając pieniądze i tajemnice.' },
      { label: 'Wyłudzanie Informacji', desc: 'AI podszywa się pod członków rodziny, nakłaniając do podania haseł lub danych osobowych.' },
    ],
    processingSteps: [
      'Przesyłanie próbki audio...',
      'Transkrypcja mowy na tekst...',
      'Analiza barwy i tonu głosu...',
      'Izolowanie odcisku językowego...',
      'Ekstrakcja kontekstu relacyjnego...',
      'Klonowanie modelu akustycznego...',
      'Budowanie persony deepfake...',
      'Konfigurowanie agenta AI...',
      'Finalizowanie mostu neuronowego...',
      'Synchronizowanie tożsamości głosowej...',
    ],
    callStatusIdle: 'Dotknij, aby połączyć agenta AI',
    callStatusConnecting: 'Łączenie…',
    callStatusEnding: 'Kończenie rozmowy…',
    callStatusSpeaking: 'Agent AI mówi',
    callStatusListening: 'Słucha…',
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
    revealTitle: 'Acabas de Sufrir un Deepfake.',
    revealStat: '15 segundos',
    revealStatCaption: 'Eso es todo lo que necesita la IA moderna para clonar la voz de cualquier persona, incluida la tuya.',
    revealMessage:
      'La voz que acabas de escuchar fue generada en tiempo real por una IA que clonó una voz a partir de solo 60 segundos de audio. Fue diseñada para sonar exactamente como alguien de tu confianza.\n\nEsta tecnología ya es utilizada por delincuentes para hacerse pasar por familiares, directivos y funcionarios, engañando a las personas para que transfieran dinero, compartan contraseñas o revelen información personal.',
    revealRisksTitle: 'La voz es solo el comienzo.',
    timeRemaining: 'Tiempo Restante',
    safeWordPrompt: 'Acuerda con tu familia una palabra clave secreta. Solo vosotros la sabréis — usadla para verificar al instante que quien llama es realmente quien dice ser.',
    backToHome: 'Volver al Inicio',
    aiDisclaimer:
      'Solo para fines educativos: Esta aplicación usa IA de voz avanzada para enseñar ciberseguridad. Las grabaciones de audio pueden almacenarse de forma segura con fines educativos y de auditoría de seguridad.',
    simulationDisclaimer:
      'Esta simulación utiliza únicamente el altavoz y el micrófono de tu dispositivo. No realiza una llamada real y no tiene acceso a tu agenda de contactos. Para el mejor efecto, reprodúcela estando junto a la persona que deseas educar.',
    processingVoice: 'Procesando perfil de voz...',
    micPermissionTitle: 'Acceso al Micrófono Requerido',
    micPermissionDenied: 'Voicinne necesita acceso al micrófono. Actívalo en Ajustes.',
    homeSlogan: 'Eso es todo lo que necesita la IA para clonar tu voz.',
    consentText: 'Solo para fines educativos: Esta aplicación usa IA de voz avanzada para enseñar ciberseguridad. Las grabaciones de audio pueden almacenarse de forma segura con fines educativos y de auditoría de seguridad.',
    micDenied: 'Acceso al micrófono denegado',
    scams: [
      { label: 'Secuestro Falso', desc: 'Los estafadores clonan la voz de un hijo para llamar a los padres exigiendo rescate — con un clip de 15 segundos.' },
      { label: 'Fraude del CEO', desc: 'La IA imita la voz de tu jefe, autorizando una transferencia urgente de seis cifras.' },
      { label: 'Evasión de Autenticación', desc: 'Las voces sintéticas burlan los sistemas de autenticación bancaria, vaciando cuentas en silencio.' },
      { label: 'Estafa del Abuelo', desc: 'Los familiares mayores reciben una llamada — tu voz, tus palabras — pidiendo dinero de emergencia.' },
      { label: 'Manipulación Romántica', desc: 'Las voces clonadas mantienen relaciones falsas durante meses, extrayendo dinero y secretos.' },
      { label: 'Extracción de Información', desc: 'La IA se hace pasar por familiares para engañarte y que compartas contraseñas o datos personales.' },
    ],
    processingSteps: [
      'Cargando muestra de audio...',
      'Transcribiendo voz a texto...',
      'Analizando timbre y tono vocal...',
      'Aislando huella lingüística...',
      'Extrayendo contexto relacional...',
      'Clonando modelo acústico...',
      'Construyendo persona deepfake...',
      'Configurando agente de IA conversacional...',
      'Finalizando puente neuronal...',
      'Sincronizando identidad vocal...',
    ],
    callStatusIdle: 'Toca para conectar al agente de IA',
    callStatusConnecting: 'Conectando…',
    callStatusEnding: 'Terminando llamada…',
    callStatusSpeaking: 'El agente de IA está hablando',
    callStatusListening: 'Escuchando…',
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
    revealTitle: 'Du Wurdest Soeben Deepgefaked.',
    revealStat: '15 Sekunden',
    revealStatCaption: 'Das ist alles, was moderne KI braucht, um die Stimme einer beliebigen Person zu klonen — einschließlich deiner.',
    revealMessage:
      'Die Stimme, die du gerade gehört hast, wurde in Echtzeit von einer KI erzeugt, die eine Stimme aus nur 60 Sekunden Audio geklont hat. Sie wurde so gestaltet, dass sie genau wie jemand klingt, dem du vertraust.\n\nDiese Technologie wird bereits von Kriminellen eingesetzt, um Familienmitglieder, Führungskräfte und Beamte zu imitieren — und Menschen dazu zu bringen, Geld zu überweisen, Passwörter preiszugeben oder persönliche Daten zu enthüllen.',
    revealRisksTitle: 'Die Stimme ist erst der Anfang.',
    timeRemaining: 'Verbleibende Zeit',
    safeWordPrompt: 'Vereinbare mit deiner Familie ein geheimes Codewort. Nur ihr kennt es — nutzt es, um sofort zu prüfen, ob ein Anrufer wirklich derjenige ist, der er zu sein behauptet.',
    backToHome: 'Zurück zur Startseite',
    aiDisclaimer:
      'Nur zu Bildungszwecken: Diese App verwendet fortschrittliche KI-Sprachtechnologie, um Cybersicherheit zu vermitteln. Audioaufnahmen können sicher für Bildungs- und Sicherheitsauditzwecke gespeichert werden.',
    simulationDisclaimer:
      'Diese Simulation verwendet ausschließlich den Lautsprecher und das Mikrofon deines Geräts. Sie tätigt keine echten Anrufe und hat keinen Zugriff auf dein Adressbuch. Den besten Effekt erzielst du, wenn du sie neben der Person abspielst, die du aufklären möchtest.',
    processingVoice: 'Stimmprofil wird verarbeitet...',
    micPermissionTitle: 'Mikrofonzugriff Erforderlich',
    micPermissionDenied: 'Voicinne benötigt Mikrofonzugriff. Bitte aktiviere ihn in den Einstellungen.',
    homeSlogan: 'Das ist alles, was KI braucht, um deine Stimme zu klonen.',
    consentText: 'Nur zu Bildungszwecken: Diese App verwendet fortschrittliche KI-Sprachtechnologie, um Cybersicherheit zu vermitteln. Audioaufnahmen können sicher für Bildungs- und Sicherheitsauditzwecke gespeichert werden.',
    micDenied: 'Mikrofonzugriff verweigert',
    scams: [
      { label: 'Vorgetäuschte Entführung', desc: 'Betrüger klonen die Stimme eines Kindes, um Eltern mit Lösegeldforderungen anzurufen — aus einem 15-Sekunden-Clip.' },
      { label: 'CEO-Betrug', desc: 'KI imitiert die Stimme deines Chefs und genehmigt eine dringende sechsstellige Überweisung.' },
      { label: 'Umgehung der Sprachverifikation', desc: 'Synthetische Stimmen überwinden Bank-Spracherkennungssysteme und leeren Konten lautlos.' },
      { label: 'Enkeltrick', desc: 'Ältere Angehörige erhalten einen Anruf — deine Stimme, deine Worte — mit der Bitte um Notgeld.' },
      { label: 'Romantische Manipulation', desc: 'Geklonte Stimmen halten falsche Beziehungen monatelang aufrecht und erschleichen Geld und Geheimnisse.' },
      { label: 'Informationsdiebstahl', desc: 'KI gibt sich als Familienmitglieder aus, um dich zur Preisgabe von Passwörtern oder Daten zu bringen.' },
    ],
    processingSteps: [
      'Audioprüfmuster wird hochgeladen...',
      'Sprache wird in Text umgewandelt...',
      'Klangfarbe und Tonhöhe werden analysiert...',
      'Sprachlicher Fingerabdruck wird isoliert...',
      'Relationaler Kontext wird extrahiert...',
      'Akustisches Modell wird geklont...',
      'Deepfake-Persona wird erstellt...',
      'KI-Gesprächsagent wird konfiguriert...',
      'Neuronale Brücke wird fertiggestellt...',
      'Stimmidentität wird synchronisiert...',
    ],
    callStatusIdle: 'Tippe, um den KI-Agenten zu verbinden',
    callStatusConnecting: 'Verbinden…',
    callStatusEnding: 'Anruf beenden…',
    callStatusSpeaking: 'KI-Agent spricht',
    callStatusListening: 'Zuhören…',
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
    revealTitle: 'Vous Venez d\'Être Victime d\'un Deepfake.',
    revealStat: '15 secondes',
    revealStatCaption: 'C\'est tout ce dont l\'IA moderne a besoin pour cloner la voix de n\'importe qui — y compris la vôtre.',
    revealMessage:
      'La voix que vous venez d\'entendre a été générée en temps réel par une IA qui a cloné une voix à partir de seulement 60 secondes d\'audio. Elle a été conçue pour sonner exactement comme quelqu\'un en qui vous avez confiance.\n\nCette technologie est déjà utilisée par des criminels pour se faire passer pour des membres de la famille, des dirigeants et des fonctionnaires — trompant les gens pour qu\'ils transfèrent de l\'argent, partagent des mots de passe ou révèlent des informations personnelles.',
    revealRisksTitle: 'La voix n\'est que le début.',
    timeRemaining: 'Temps Restant',
    safeWordPrompt: 'Convenez avec votre famille d\'un mot de code secret. Vous seuls le connaîtrez — utilisez-le pour vérifier immédiatement qu\'un appelant est vraiment qui il prétend être.',
    backToHome: 'Retour à l\'Accueil',
    aiDisclaimer:
      "À des fins éducatives uniquement : Cette application utilise une IA vocale avancée pour enseigner la cybersécurité. Les enregistrements audio peuvent être stockés en toute sécurité à des fins éducatives et d'audit de sécurité.",
    simulationDisclaimer:
      "Cette simulation utilise uniquement le haut-parleur et le microphone de votre appareil. Elle ne passe pas de vrai appel et n'a pas accès à votre répertoire. Pour le meilleur effet, jouez-la en étant à côté de la personne que vous souhaitez sensibiliser.",
    processingVoice: 'Traitement du profil vocal...',
    micPermissionTitle: 'Accès au Microphone Requis',
    micPermissionDenied: 'Voicinne nécessite l\'accès au microphone. Activez-le dans les Paramètres.',
    homeSlogan: "C'est tout ce dont l'IA a besoin pour cloner votre voix.",
    consentText: "À des fins éducatives uniquement : Cette application utilise une IA vocale avancée pour enseigner la cybersécurité. Les enregistrements audio peuvent être stockés en toute sécurité à des fins éducatives et d'audit de sécurité.",
    micDenied: "Accès au microphone refusé",
    scams: [
      { label: 'Faux Enlèvement', desc: "Les escrocs clonent la voix d'un enfant pour appeler les parents en exigeant une rançon — à partir d'un clip de 15 secondes." },
      { label: 'Fraude au PDG', desc: "L'IA imite la voix de votre patron, autorisant un virement urgent à six chiffres." },
      { label: "Contournement de l'ID Vocal", desc: "Les voix synthétiques contournent les systèmes d'authentification bancaire, vidant les comptes en silence." },
      { label: 'Arnaque aux Grands-Parents', desc: "Les proches âgés reçoivent un appel — votre voix, vos mots — pour demander de l'argent d'urgence." },
      { label: 'Manipulation Romantique', desc: 'Les voix clonées entretiennent de fausses relations pendant des mois, extrayant argent et secrets.' },
      { label: "Extraction d'Informations", desc: "L'IA se fait passer pour des membres de la famille pour vous amener à partager des mots de passe ou des données personnelles." },
    ],
    processingSteps: [
      "Chargement de l'échantillon audio...",
      'Transcription de la parole en texte...',
      'Analyse du timbre et de la hauteur vocale...',
      "Isolation de l'empreinte linguistique...",
      'Extraction du contexte relationnel...',
      'Clonage du modèle acoustique...',
      'Construction de la persona deepfake...',
      "Configuration de l'agent IA conversationnel...",
      'Finalisation du pont neuronal...',
      "Synchronisation de l'identité vocale...",
    ],
    callStatusIdle: "Appuyer pour connecter l'agent IA",
    callStatusConnecting: 'Connexion…',
    callStatusEnding: "Fin de l'appel…",
    callStatusSpeaking: "L'agent IA parle",
    callStatusListening: 'Écoute…',
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
    revealTitle: 'Sei Appena Stato Vittima di un Deepfake.',
    revealStat: '15 secondi',
    revealStatCaption: 'È tutto ciò di cui l\'IA moderna ha bisogno per clonare la voce di chiunque — inclusa la tua.',
    revealMessage:
      'La voce che hai appena sentito è stata generata in tempo reale da un\'IA che ha clonato una voce da soli 60 secondi di audio. È stata progettata per suonare esattamente come qualcuno di cui ti fidi.\n\nQuesta tecnologia è già utilizzata dai criminali per impersonare familiari, dirigenti e funzionari — inducendo le persone a trasferire denaro, condividere password o rivelare informazioni personali.',
    revealRisksTitle: 'La voce è solo l\'inizio.',
    timeRemaining: 'Tempo Rimanente',
    safeWordPrompt: 'Concordate con la vostra famiglia una parola d\'ordine segreta. Solo voi la conoscerete — usatela per verificare immediatamente che chi chiama sia davvero chi dice di essere.',
    backToHome: 'Torna alla Home',
    aiDisclaimer:
      "Solo a scopo educativo: Questa app utilizza un'IA vocale avanzata per insegnare la cybersicurezza. Le registrazioni audio possono essere archiviate in modo sicuro per scopi educativi e di audit della sicurezza.",
    simulationDisclaimer:
      "Questa simulazione utilizza solo l'altoparlante e il microfono del tuo dispositivo. Non effettua chiamate reali e non ha accesso alla tua rubrica. Per il miglior effetto, riproducila mentre sei accanto alla persona che vuoi sensibilizzare.",
    processingVoice: 'Elaborazione profilo vocale...',
    micPermissionTitle: 'Accesso al Microfono Richiesto',
    micPermissionDenied: 'Voicinne necessita l\'accesso al microfono. Abilitalo nelle Impostazioni.',
    homeSlogan: "È tutto ciò di cui l'IA ha bisogno per clonare la tua voce.",
    consentText: "Solo a scopo educativo: Questa app utilizza un'IA vocale avanzata per insegnare la cybersicurezza. Le registrazioni audio possono essere archiviate in modo sicuro per scopi educativi e di audit della sicurezza.",
    micDenied: "Accesso al microfono negato",
    scams: [
      { label: 'Falso Rapimento', desc: 'I truffatori clonano la voce di un figlio per chiamare i genitori chiedendo un riscatto — da un clip di 15 secondi.' },
      { label: 'Truffa del CEO', desc: "L'IA imita la voce del tuo capo, autorizzando un urgente bonifico a sei cifre." },
      { label: "Bypass dell'ID Vocale", desc: 'Le voci sintetiche superano i sistemi di autenticazione vocale bancaria, svuotando i conti in silenzio.' },
      { label: 'Truffa dei Nonni', desc: 'I parenti anziani ricevono una chiamata — la tua voce, le tue parole — che chiede denaro d\'emergenza.' },
      { label: 'Manipolazione Romantica', desc: 'Le voci clonate sostengono relazioni false per mesi, estraendo denaro e segreti.' },
      { label: 'Estrazione di Informazioni', desc: "L'IA si spaccia per familiari per indurti a condividere password o dati personali." },
    ],
    processingSteps: [
      'Caricamento del campione audio...',
      'Trascrizione del parlato in testo...',
      'Analisi del timbro e del tono vocale...',
      "Isolamento dell'impronta linguistica...",
      'Estrazione del contesto relazionale...',
      'Clonazione del modello acustico...',
      'Costruzione della persona deepfake...',
      "Configurazione dell'agente IA conversazionale...",
      'Finalizzazione del ponte neurale...',
      "Sincronizzazione dell'identità vocale...",
    ],
    callStatusIdle: "Tocca per connettere l'agente IA",
    callStatusConnecting: 'Connessione…',
    callStatusEnding: 'Fine chiamata…',
    callStatusSpeaking: "L'agente IA sta parlando",
    callStatusListening: 'In ascolto…',
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
