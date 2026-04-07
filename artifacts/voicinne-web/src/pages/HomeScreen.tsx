import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LANGUAGE_LABELS, Language, useLanguage } from '@/contexts/LanguageContext';
import { WaveformLine, buildFlatPoints, buildSinePoints } from '@/utils/waveform';

const LANGUAGES: Language[] = ['ENG', 'POL', 'SPA', 'GER', 'FRA', 'ITA'];
const RED = '#ef4444';
const RED_DIM = '#7f1d1d';
const CARD = '#141414';
const BORDER = '#262626';
const FG = '#f0f0f0';
const MUTED = '#9ca3af';
const WAVE_W = 390;
const WAVE_H = 72;

interface HomeScreenProps {
  onStart: () => void;
}

export default function HomeScreen({ onStart }: HomeScreenProps) {
  const { language, setLanguage, t } = useLanguage();
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [wavePoints, setWavePoints] = useState(() => buildFlatPoints(WAVE_W, WAVE_H));
  const phaseRef = useRef(0);
  const ampRef = useRef(0);
  const waveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const [micActive, setMicActive] = useState(false);
  const [micDenied, setMicDenied] = useState(false);

  const [scamIdx, setScamIdx] = useState(0);
  const [scamOpacity, setScamOpacity] = useState(1);
  const [scamTranslateY, setScamTranslateY] = useState(0);
  const [scamScale, setScamScale] = useState(1);
  const isPausedRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const scamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopWaveAnimation = useCallback(() => {
    if (waveIntervalRef.current) {
      clearInterval(waveIntervalRef.current);
      waveIntervalRef.current = null;
    }
    phaseRef.current = 0;
    ampRef.current = 0;
    setWavePoints(buildFlatPoints(WAVE_W, WAVE_H));
  }, []);

  const stopMic = useCallback(async () => {
    try { analyserRef.current?.disconnect(); } catch {}
    analyserRef.current = null;
    dataArrayRef.current = null;
    try { audioCtxRef.current?.close(); } catch {}
    audioCtxRef.current = null;
    try { streamRef.current?.getTracks().forEach(t => t.stop()); } catch {}
    streamRef.current = null;
    stopWaveAnimation();
    setMicActive(false);
  }, [stopWaveAnimation]);

  const startWaveLoop = useCallback(() => {
    waveIntervalRef.current = setInterval(() => {
      if (analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
        let max = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          max = Math.max(max, Math.abs(dataArrayRef.current[i] - 128));
        }
        ampRef.current = 10 + (max / 128) * 38;
      }
      phaseRef.current += 0.05;
      setWavePoints(buildSinePoints(phaseRef.current, ampRef.current, WAVE_W, WAVE_H));
    }, 33);
  }, []);

  const toggleMic = useCallback(async () => {
    if (micActive) {
      await stopMic();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
      audioCtx.createMediaStreamSource(stream).connect(analyser);
      ampRef.current = 14;
      setMicDenied(false);
      setMicActive(true);
      startWaveLoop();
    } catch {
      setMicDenied(true);
    }
  }, [micActive, stopMic, startWaveLoop]);

  useEffect(() => () => { stopMic(); }, [stopMic]);

  const advanceScam = useCallback((nextIdx?: number) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setScamOpacity(0);
    setScamTranslateY(-12);
    setTimeout(() => {
      setScamIdx(prev => nextIdx !== undefined ? nextIdx : (prev + 1) % t.scams.length);
      setScamTranslateY(14);
      setTimeout(() => {
        setScamOpacity(1);
        setScamTranslateY(0);
        setTimeout(() => { isAnimatingRef.current = false; }, 560);
      }, 50);
    }, 480);
  }, [t.scams.length]);

  useEffect(() => {
    isAnimatingRef.current = false;
    setScamOpacity(1);
    setScamTranslateY(0);
    setScamIdx(0);
  }, [t]);

  useEffect(() => {
    const id = setInterval(() => {
      if (isPausedRef.current || isAnimatingRef.current) return;
      advanceScam();
    }, 7500);
    scamTimerRef.current = id;
    return () => clearInterval(id);
  }, [advanceScam]);

  const scam = t.scams[scamIdx] ?? t.scams[0];

  return (
    <div style={{ paddingLeft: 24, paddingRight: 24, paddingBottom: 8, position: 'relative' }}>
      {/* Ambient red glow */}
      <div style={{
        position: 'absolute', top: 120, left: '50%', transform: 'translateX(-50%)',
        width: 260, height: 260, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(239,68,68,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <span style={{ color: FG, fontSize: 22, letterSpacing: 6, fontWeight: 300 }}>VOICINNE</span>
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

      {/* Waveform */}
      <div style={{ marginLeft: -24, marginBottom: 16, position: 'relative', width: WAVE_W, height: WAVE_H }}>
        <WaveformLine points={wavePoints} color={RED} width={WAVE_W} height={WAVE_H} />
        <button
          onClick={toggleMic}
          style={{
            position: 'absolute', bottom: 4, right: 4, width: 30, height: 30,
            borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: micActive ? RED : CARD,
            border: micActive ? 'none' : `1px solid ${BORDER}`,
            cursor: 'pointer',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={micActive ? '#fff' : MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {micActive
              ? <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></>
              : <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" strokeDasharray="2 2"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></>
            }
          </svg>
        </button>
        {micDenied && (
          <span style={{ position: 'absolute', bottom: 4, left: 28, fontSize: 9, color: RED, letterSpacing: 0.5 }}>{t.micDenied}</span>
        )}
      </div>

      {/* Stat */}
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <span style={{
            fontSize: 110, fontWeight: 700, color: RED, lineHeight: 1,
            letterSpacing: -4, textShadow: '0 0 28px rgba(239,68,68,0.4)',
          }}>15</span>
          <span style={{ fontSize: 50, fontWeight: 700, color: RED, lineHeight: 1.3, marginLeft: 4, letterSpacing: -1 }}>s</span>
        </div>
        <p style={{ fontSize: 15, fontWeight: 600, color: FG, textAlign: 'center', lineHeight: 1.47, marginTop: 6, margin: '6px 0 0' }}>{t.homeSlogan}</p>
      </div>

      {/* Explanation */}
      <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, marginBottom: 16, textAlign: 'center' }}>{t.appDescription}</p>

      {/* Scam Ticker */}
      <div
        style={{
          background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16,
          padding: 18, marginBottom: 12, cursor: 'pointer',
          transform: `scale(${scamScale})`, transition: 'transform 0.2s',
        }}
        onMouseEnter={() => { isPausedRef.current = true; setScamScale(1.035); }}
        onMouseLeave={() => { isPausedRef.current = false; setScamScale(1); }}
      >
        <div style={{
          opacity: scamOpacity, transform: `translateY(${scamTranslateY}px)`,
          transition: `opacity 0.48s, transform 0.48s`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: RED, flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: RED, letterSpacing: 0.5, textTransform: 'uppercase' }}>{scam.label}</span>
          </div>
          <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.5, margin: 0 }}>{scam.desc}</p>
        </div>
      </div>

      {/* Pagination dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
        {t.scams.map((_, i) => (
          <button
            key={i}
            onClick={() => advanceScam(i)}
            style={{
              width: i === scamIdx ? 18 : 6, height: 6, borderRadius: 3,
              background: i === scamIdx ? RED : BORDER,
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'width 0.2s, background 0.2s',
            }}
          />
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onStart}
        style={{
          width: '100%', padding: '20px 0', borderRadius: 18,
          background: RED, border: 'none', color: '#fff',
          fontSize: 18, fontWeight: 700, cursor: 'pointer',
          boxShadow: `0 4px 14px rgba(239,68,68,0.4)`,
          marginBottom: 16,
        }}
      >
        {t.startButton}
      </button>

      {/* Consent */}
      <p style={{ fontSize: 11, color: MUTED, textAlign: 'center', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{t.consentText}</p>

      {/* Language picker modal */}
      {showLangPicker && (
        <div
          onClick={() => setShowLangPicker(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            zIndex: 999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: CARD, borderRadius: '24px 24px 0 0',
              padding: '24px 24px 40px', width: '100%', maxWidth: 390, maxHeight: '70vh', overflowY: 'auto',
            }}
          >
            <p style={{ color: FG, fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{t.selectLanguage}</p>
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                onClick={() => { setLanguage(lang); setShowLangPicker(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 0', borderBottom: `1px solid ${BORDER}`, background: lang === language ? RED + '22' : 'transparent',
                  border: 'none', borderBottomColor: BORDER, borderBottomStyle: 'solid', borderBottomWidth: 1,
                  color: lang === language ? RED : FG, fontSize: 16, cursor: 'pointer', paddingLeft: 0, paddingRight: 0,
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
