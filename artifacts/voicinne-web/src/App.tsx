import React, { useState } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { PhoneFrame } from '@/components/PhoneFrame';
import HomeScreen from '@/pages/HomeScreen';
import OnboardingScreen from '@/pages/OnboardingScreen';
import SimulationScreen from '@/pages/SimulationScreen';

type Screen = 'home' | 'onboarding' | 'simulation';

interface SimulationParams {
  agentId: string;
  revealMessage: string;
}

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [simParams, setSimParams] = useState<SimulationParams | null>(null);

  return (
    <LanguageProvider>
      <PhoneFrame>
        {screen === 'home' && (
          <HomeScreen onStart={() => setScreen('onboarding')} />
        )}
        {screen === 'onboarding' && (
          <OnboardingScreen
            onBack={() => setScreen('home')}
            onDone={(agentId, revealMessage) => {
              setSimParams({ agentId, revealMessage });
              setScreen('simulation');
            }}
          />
        )}
        {screen === 'simulation' && (
          <SimulationScreen
            agentId={simParams?.agentId}
            revealMessage={simParams?.revealMessage}
            onHome={() => { setSimParams(null); setScreen('home'); }}
          />
        )}
      </PhoneFrame>
    </LanguageProvider>
  );
}

export default App;
