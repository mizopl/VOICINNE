import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LANGUAGE_LABELS, Language, useLanguage } from '@/contexts/LanguageContext';
import { WaveformLine, buildFlatPoints, buildSinePoints } from '@/utils/waveform';
import { transcribeAudio, generatePersona, cloneVoice, createAgent } from '@/utils/apiClient';

const LANGUAGES: Language[] = ['ENG', 'POL', 'SPA', 'GER', 'FRA', 'ITA'];
const RED = '#ef4444';
const CARD = '#141414';
const BORDER = '#262626';
const FG = '#f0f0f0';
const MUTED = '#9ca3af';
const MAX_SECONDS = 60;
const PROMPT_TRIGGER = 30;
const WAVE_W = 390;
const WAVE_H = 64;

type Phase = 'idle' | 'recording' | 'preview' | 'processing';

interface OnboardingScreenProps {
  onBack: () => void;
  onDone: (agentId: string, revealMessage: string) => void;
}

export default function OnboardingScreen({ onBack, onDone }: OnboardingScreenProps) {
  const { t, language, setLanguage } = useLanguage();
  const [phase, setPhase] = useState<Phase>('idle');
  const [secondsLeft, setSecondsLeft] = useState(MAX_SECONDS);
  const [showPrompt, setShowPrompt] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [stepOpacity, setStepOpacity] = useState(1);
  const [wavePoints, setWavePoints] = useState(() => buildFlatPoints(WAVE_W, WAVE_H));
  const [pulseScale, setPulseScale] = useState(1);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const wavePhaseRef = useRef(0);
  const waveAmpRef = useRef(0);
  const remainingRef = useRef(MAX_SECONDS);

  const stopWaveAnimation = useCallback(() => {
    if (waveIntervalRef.current) { clearInterval(waveIntervalRef.current); waveIntervalRef.current = null; }
    try { analyserRef.current?.disconnect(); } catch {}
    analyserRef.current = null;
    dataArrayRef.current = null;
    try { audioCtxRef.current?.close(); } catch {}
    audioCtxRef.current = null;
    try { streamRef.current?.getTracks().forEach(t => t.stop()); } catch {}
    streamRef.current = null;
    wavePhaseRef.current = 0; waveAmpRef.current = 0;
    setWavePoints(buildFlatPoints(WAVE_W, WAVE_H));
  }, []);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
      if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
      if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);
      mediaRecorderRef.current?.stop();
      try { audioCtxRef.current?.close(); } catch {}
      try { streamRef.current?.getTracks().forEach(t => t.stop()); } catch {}
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, []);

  const advanceStep = useCallback(() => {
    setStepOpacity(0);
    setTimeout(() => {
      setStepIndex(prev => (prev + 1) % t.processingSteps.length);
      setStepOpacity(1);
    }, 300);
  }, [t.processingSteps.length]);

  useEffect(() => {
    if (phase !== 'processing') {
      if (stepIntervalRef.current) { clearInterval(stepIntervalRef.current); stepIntervalRef.current = null; }
      setStepIndex(0); setStepOpacity(1);
      return;
    }
    stepIntervalRef.current = setInterval(advanceStep, 3000);
    return () => { if (stepIntervalRef.current) { clearInterval(stepIntervalRef.current); stepIntervalRef.current = null; } };
  }, [phase, advanceStep]);

  const startPulse = () => {
    let up = true;
    pulseIntervalRef.current = setInterval(() => {
      setPulseScale(up ? 1.14 : 1);
      up = !up;
    }, 600);
  };
  const stopPulse = () => {
    if (pulseIntervalRef.current) { clearInterval(pulseIntervalRef.current); pulseIntervalRef.current = null; }
    setPulseScale(1);
  };

  const stopRecordingInternal = useCallback(() => {
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
    stopPulse();
    stopWaveAnimation();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, [stopWaveAnimation]);

  const formatTime = (s: number) => {
    const secs = Math.max(0, s);
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // web audio for metering
      try {
        const audioCtx = new AudioContext();
        audioCtxRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
        audioCtx.createMediaStreamSource(stream).connect(analyser);
      } catch {}

      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setPhase('preview');
      };
      mr.start();
      waveAmpRef.current = 14;
      setShowPrompt(false);
      remainingRef.current = MAX_SECONDS;
      setSecondsLeft(MAX_SECONDS);
      setPhase('recording');
      startPulse();

      waveIntervalRef.current = setInterval(() => {
        if (analyserRef.current && dataArrayRef.current) {
          analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
          let max = 0;
          for (let i = 0; i < dataArrayRef.current.length; i++) {
            max = Math.max(max, Math.abs(dataArrayRef.current[i] - 128));
          }
          waveAmpRef.current = 10 + (max / 128) * 32;
        }
        wavePhaseRef.current += 0.05;
        setWavePoints(buildSinePoints(wavePhaseRef.current, waveAmpRef.current, WAVE_W, WAVE_H));
      }, 33);

      countdownRef.current = setInterval(() => {
        remainingRef.current -= 1;
        setSecondsLeft(remainingRef.current);
        if (remainingRef.current === PROMPT_TRIGGER) setShowPrompt(true);
        if (remainingRef.current <= 0) stopRecordingInternal();
      }, 1000);
    } catch {
      alert(t.micPermissionDenied);
    }
  };

  const handleReRecord = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setIsPlaying(false);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecordedBlob(null);
    setShowPrompt(false);
    setSecondsLeft(MAX_SECONDS);
    stopWaveAnimation();
    setPhase('idle');
  };

  const handlePlayPause = () => {
    if (!audioUrl) return;
    if (!audioRef.current) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const runProcessingPipeline = async () => {
    if (!recordedBlob) return;
    setPhase('processing');
    const recordingDurationSeconds = Math.max(1, MAX_SECONDS - secondsLeft);
    try {
      const transcription = await transcribeAudio([recordedBlob]);
      const personaResult = await generatePersona(transcription, recordingDurationSeconds);
      const persona = (personaResult as { persona?: Record<string, unknown> }).persona ?? personaResult;

      const system_prompt =
        (persona.systemInstruction as string | undefined) ??
        (persona.systemPrompt as string | undefined) ??
        (persona.system_prompt as string | undefined) ??
        JSON.stringify(persona);

      const reveal_message =
        (persona.reveal_message as string | undefined) ??
        (persona.revealMessage as string | undefined) ?? '';

      const language_code =
        (persona.languageCode as string | undefined) ??
        (persona.detectedLanguage as string | undefined) ?? 'en';

      const first_message =
        (persona.first_message as string | undefined) ??
        (persona.firstMessage as string | undefined) ?? '';

      const voice_id = await cloneVoice([recordedBlob]);
      const { agentId, revealMessage } = await createAgent(voice_id, system_prompt, reveal_message, language_code, first_message);
      onDone(agentId, revealMessage);
    } catch {
      setPhase('preview');
    }
  };

  // PROCESSING phase
  if (phase === 'processing') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 600, gap: 28, padding: '0 24px' }}>
        <div style={{
          width: 96, height: 96, borderRadius: '50%', border: `2px solid ${RED}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 40, height: 40, border: `3px solid ${RED}`, borderTopColor: 'transparent',
            borderRadius: '50%', animation: 'spin 1s linear infinite',
          }} />
        </div>
        <div style={{ textAlign: 'center', padding: '0 32px' }}>
          <p style={{
            fontSize: 18, fontWeight: 600, color: FG, lineHeight: 1.44,
            opacity: stepOpacity, transition: 'opacity 0.3s',
          }}>
            {t.processingSteps[stepIndex] ?? t.processingSteps[0]}
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // IDLE phase
  if (phase === 'idle') {
    return (
      <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', height: '100%', minHeight: 600 }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingTop: 12 }}>
          <button onClick={onBack} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <span style={{ color: FG, fontSize: 18, letterSpacing: 5, fontWeight: 300 }}>VOICINNE</span>
          <button
            onClick={() => setShowLangPicker(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px',
              borderRadius: 20, border: `1px solid ${BORDER}`, background: CARD,
              color: MUTED, fontSize: 11, letterSpacing: 1, cursor: 'pointer',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            {LANGUAGE_LABELS[language]}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>

        {/* Badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
          borderRadius: 24, border: `1px solid ${RED}40`, background: RED + '15',
          alignSelf: 'center', marginBottom: 10,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span style={{ fontSize: 11, fontWeight: 700, color: RED, letterSpacing: 1.5 }}>READ BEFORE PROCEEDING</span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28, paddingBottom: 16 }}>
          <div style={{ gap: 8, display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: 28, fontWeight: 700, color: FG, lineHeight: 1.29, letterSpacing: -0.5, margin: 0 }}>{t.recordingTitle}</p>
            <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.47, margin: 0 }}>{t.onboardingSubtitle}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: 'mic', header: t.step1Header, desc: t.step1Desc },
              { icon: 'chat', header: t.step2Header, desc: t.step2Desc },
              { icon: 'wand', header: t.step3Header, desc: t.step3Desc },
            ].map(({ icon, header, desc }, i) => (
              <div key={i} style={{
                display: 'flex', gap: 14, borderRadius: 16, border: `1px solid #242424`,
                padding: 18, background: CARD,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: RED + '22',
                }}>
                  {icon === 'mic' && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                  )}
                  {icon === 'chat' && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  )}
                  {icon === 'wand' && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="4" y1="20" x2="20" y2="4"/>
                      <path d="M19 8l-3 3m-4-4L9 10"/>
                      <line x1="4" y1="4" x2="4.01" y2="4"/><line x1="4" y1="20" x2="4.01" y2="20"/>
                      <line x1="20" y1="4" x2="20.01" y2="4"/><line x1="20" y1="20" x2="20.01" y2="20"/>
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: FG, margin: '0 0 4px', lineHeight: 1.47 }}>{`${i + 1}. ${header}`}</p>
                  <p style={{ fontSize: 14, color: '#d1d5db', lineHeight: 2, margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ paddingBottom: 16 }}>
          <button
            onClick={handleStartRecording}
            style={{
              width: '100%', padding: '20px 0', borderRadius: 18,
              background: RED, border: 'none', color: '#fff',
              fontSize: 20, fontWeight: 700, cursor: 'pointer',
              boxShadow: `0 4px 14px rgba(239,68,68,0.4)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
            {t.startRecordingBtn}
          </button>
        </div>

        {/* Language picker */}
        {showLangPicker && (
          <div onClick={() => setShowLangPicker(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            zIndex: 999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}>
            <div onClick={e => e.stopPropagation()} style={{
              background: CARD, borderRadius: '24px 24px 0 0',
              padding: '24px 24px 40px', width: '100%', maxWidth: 390, maxHeight: '70vh', overflowY: 'auto',
            }}>
              <p style={{ color: FG, fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{t.selectLanguage}</p>
              {LANGUAGES.map(lang => (
                <button key={lang} onClick={() => { setLanguage(lang); setShowLangPicker(false); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 0', borderBottom: `1px solid ${BORDER}`, background: lang === language ? RED + '22' : 'transparent',
                    border: 'none', borderBottomColor: BORDER, borderBottomStyle: 'solid', borderBottomWidth: 1,
                    color: lang === language ? RED : FG, fontSize: 16, cursor: 'pointer',
                  }}
                >
                  {LANGUAGE_LABELS[lang]} — {lang}
                  {lang === language && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // RECORDING phase
  if (phase === 'recording') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 28, padding: '0 24px', minHeight: 600,
      }}>
        <div style={{ transform: `scale(${pulseScale})`, transition: 'transform 0.6s ease-in-out' }}>
          <div style={{
            width: 200, height: 200, borderRadius: '50%', border: `4px solid ${RED}`,
            background: 'rgba(239,68,68,0.1)', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: RED }} />
            <span style={{ fontSize: 52, fontWeight: 700, color: RED, letterSpacing: -1 }}>{formatTime(secondsLeft)}</span>
          </div>
        </div>

        <WaveformLine points={wavePoints} color={RED} width={WAVE_W} height={WAVE_H} />

        {showPrompt && (
          <div style={{
            borderWidth: 2, borderStyle: 'solid', borderRadius: 20,
            padding: '18px 28px', textAlign: 'center',
            borderColor: RED, background: RED + '1A',
          }}>
            <span style={{ fontSize: 26, fontWeight: 700, color: RED }}>{t.promptText}</span>
          </div>
        )}

        <button
          onClick={stopRecordingInternal}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: RED, border: 'none', color: '#fff',
            fontSize: 17, fontWeight: 600, cursor: 'pointer',
            padding: '16px 32px', borderRadius: 16,
          }}
        >
          <div style={{ width: 18, height: 18, borderRadius: 4, background: '#fff' }} />
          {t.stopRecording}
        </button>
      </div>
    );
  }

  // PREVIEW phase
  return (
    <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', minHeight: 600 }}>
      <div style={{ display: 'flex', alignItems: 'center', paddingTop: 12, marginBottom: 4 }}>
        <button onClick={handleReRecord} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 20,
          border: `1px solid ${RED}55`, background: RED + '22',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span style={{ fontSize: 15, fontWeight: 600, color: RED }}>{t.recorded}</span>
        </div>

        <button
          onClick={handlePlayPause}
          style={{
            width: 160, height: 160, borderRadius: '50%',
            background: RED + '18', border: `2px solid ${RED}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {isPlaying
            ? <svg width="52" height="52" viewBox="0 0 24 24" fill={RED} stroke={RED} strokeWidth="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            : <svg width="52" height="52" viewBox="0 0 24 24" fill={RED} stroke={RED} strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          }
        </button>

        <span style={{ fontSize: 15, color: MUTED }}>{isPlaying ? t.recording : t.listenBack}</span>
      </div>

      <div style={{ paddingBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          onClick={handleReRecord}
          style={{
            width: '100%', padding: '16px 0', borderRadius: 16,
            background: 'transparent', border: `2px solid ${BORDER}`,
            color: MUTED, fontSize: 17, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
          </svg>
          {t.reRecord}
        </button>

        <button
          onClick={runProcessingPipeline}
          style={{
            width: '100%', padding: '20px 0', borderRadius: 18,
            background: RED, border: 'none', color: '#fff',
            fontSize: 20, fontWeight: 700, cursor: 'pointer',
            boxShadow: `0 4px 14px rgba(239,68,68,0.4)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {t.sendForCloning}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
