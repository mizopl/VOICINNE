import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Conversation } from '@elevenlabs/react';
import { WaveformLine, buildFlatPoints } from '@/utils/waveform';

const RED = '#ef4444';
const CARD = '#141414';
const BORDER = '#262626';
const FG = '#f0f0f0';
const MUTED = '#9ca3af';
const DURATION_SECONDS = 3 * 60;
const TEST_AGENT_ID = 'agent_9801knkb7cbtfpk8pvfe3stexj99';
const WAVE_W = 342;
const WAVE_H = 48;

type CallStatus = 'idle' | 'connecting' | 'connected' | 'ending';
type CallMode = 'listening' | 'speaking';

interface SimulationScreenProps {
  agentId?: string;
  revealMessage?: string;
  onHome: () => void;
}

export default function SimulationScreen({ agentId: agentIdProp, revealMessage: revealMessageProp, onHome }: SimulationScreenProps) {
  const agentId = (agentIdProp?.trim() || TEST_AGENT_ID);
  const { t } = useLanguage();
  const [secondsLeft, setSecondsLeft] = useState(DURATION_SECONDS);
  const [revealed, setRevealed] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [callMode, setCallMode] = useState<CallMode>('listening');
  const [callError, setCallError] = useState<string | null>(null);

  const conversationRef = useRef<{ endSession: () => Promise<void> } | null>(null);

  const [orbScale, setOrbScale] = useState(1);
  const [ring1Opacity, setRing1Opacity] = useState(0.6);
  const [ring2Opacity, setRing2Opacity] = useState(0.3);
  const [revealOpacity, setRevealOpacity] = useState(0);
  const [revealScale, setRevealScale] = useState(0.85);

  const flatWavePoints = buildFlatPoints(WAVE_W, WAVE_H);

  const isActive = callStatus === 'connected' || callStatus === 'connecting';
  const isSpeaking = callStatus === 'connected' && callMode === 'speaking';

  // Orb pulse
  useEffect(() => {
    const speed = isSpeaking ? 350 : callStatus === 'connecting' ? 550 : 1100;
    const scale = isSpeaking ? 1.1 : callStatus === 'connecting' ? 1.05 : 1.02;
    let dir = 1;
    const interval = setInterval(() => {
      setOrbScale(prev => {
        const next = prev + dir * 0.005;
        if (next >= scale) dir = -1;
        if (next <= 1) dir = 1;
        return Math.min(scale, Math.max(1, next));
      });
    }, 16);
    return () => clearInterval(interval);
  }, [callStatus, callMode]);

  // Ring animations
  useEffect(() => {
    if (!isActive) {
      setRing1Opacity(0.6);
      setRing2Opacity(0.3);
      return;
    }
    const duration = isSpeaking ? 800 : 1400;
    let dir1 = 1, dir2 = -1;
    const step = 0.015;
    const interval = setInterval(() => {
      setRing1Opacity(prev => {
        const next = prev + dir1 * step;
        if (next >= 1) dir1 = -1;
        if (next <= 0.6) dir1 = 1;
        return Math.min(1, Math.max(0.6, next));
      });
      setRing2Opacity(prev => {
        const next = prev + dir2 * step;
        if (next <= 0.2) dir2 = 1;
        if (next >= 0.8) dir2 = -1;
        return Math.min(0.8, Math.max(0.2, next));
      });
    }, duration / 60);
    return () => clearInterval(interval);
  }, [isActive, isSpeaking]);

  // Auto-start timer when connected
  useEffect(() => {
    if (callStatus === 'connected' && !timerActive && !revealed) {
      setTimerActive(true);
    }
  }, [callStatus]);

  // Countdown
  useEffect(() => {
    if (!timerActive || secondsLeft <= 0) {
      if (secondsLeft <= 0 && !revealed) handleReveal();
      return;
    }
    const interval = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) { clearInterval(interval); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, secondsLeft]);

  // Auto-end at 0
  useEffect(() => {
    if (secondsLeft === 0 && isActive) terminateCall();
  }, [secondsLeft]);

  const terminateCall = async () => {
    if (conversationRef.current) {
      setCallStatus('ending');
      try { await conversationRef.current.endSession(); } catch {}
      conversationRef.current = null;
    }
    setCallStatus('idle');
  };

  const handleConnect = async () => {
    if (callStatus !== 'idle') return;
    setCallError(null);
    setCallStatus('connecting');
    try {
      // Agents are created as public (enable_auth: false), so connect directly
      // with agentId over WebSocket — same pattern as the mobile app.
      const conv = await Conversation.startSession({
        agentId,
        connectionType: 'websocket',
        onStatusChange: ({ status }: { status: string }) => {
          if (status === 'connected') setCallStatus('connected');
          if (status === 'disconnected') { conversationRef.current = null; setCallStatus('idle'); }
        },
        onModeChange: ({ mode }: { mode: string }) => setCallMode(mode as CallMode),
      });
      conversationRef.current = conv as { endSession: () => Promise<void> };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setCallError(`Connection error: ${msg}`);
      setCallStatus('idle');
    }
  };

  const handleEndCall = async () => {
    setTimerActive(false);
    await terminateCall();
  };

  const handleReveal = () => {
    if (revealed) return;
    setRevealed(true);
    setTimerActive(false);
    terminateCall();
    setTimeout(() => {
      setRevealOpacity(1);
      setRevealScale(1);
    }, 50);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeString = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const progressFraction = (DURATION_SECONDS - secondsLeft) / DURATION_SECONDS;
  const isLow = progressFraction > 0.8;

  const statusLabel =
    callStatus === 'idle' ? t.callStatusIdle
      : callStatus === 'connecting' ? t.callStatusConnecting
        : callStatus === 'ending' ? t.callStatusEnding
          : callMode === 'speaking' ? t.callStatusSpeaking
            : t.callStatusListening;

  // REVEAL SCREEN
  if (revealed) {
    return (
      <div style={{
        padding: '0 24px 24px',
        opacity: revealOpacity, transform: `scale(${revealScale})`,
        transition: 'opacity 0.4s, transform 0.4s',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, paddingTop: 28 }}>
          {/* Icon */}
          <div style={{
            width: 100, height: 100, borderRadius: '50%', border: `3px solid ${RED}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#ef444412',
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          </div>

          <p style={{ fontSize: 28, fontWeight: 700, color: '#fff', textAlign: 'center', letterSpacing: -0.5, lineHeight: 1.29, margin: 0 }}>{t.revealTitle}</p>

          {/* Wave separator */}
          <div style={{ alignSelf: 'stretch' }}>
            <WaveformLine points={flatWavePoints} color={RED + '60'} width={WAVE_W} height={WAVE_H} strokeWidth={1.5} />
          </div>

          {/* Stat card */}
          <div style={{
            width: '100%', borderRadius: 18, background: '#1f0707',
            border: `1px solid ${RED}40`, padding: '24px 20px', textAlign: 'center',
          }}>
            <p style={{ fontSize: 56, fontWeight: 700, color: RED, letterSpacing: -2, lineHeight: 1.1, margin: '0 0 8px' }}>{t.revealStat}</p>
            <p style={{ fontSize: 15, color: '#cc8888', lineHeight: 1.47, margin: 0 }}>{t.revealStatCaption}</p>
          </div>

          {/* Body */}
          {revealMessageProp ? (
            <div style={{ borderRadius: 18, border: `1px solid #2a2a2a`, padding: 22, width: '100%', background: '#141414', boxSizing: 'border-box' }}>
              <p style={{ fontSize: 16, color: '#c0c0c0', lineHeight: 1.625, margin: 0 }}>{revealMessageProp}</p>
            </div>
          ) : (
            <div style={{ borderRadius: 18, border: `1px solid #2a2a2a`, padding: 22, width: '100%', background: '#141414', boxSizing: 'border-box' }}>
              <p style={{ fontSize: 16, color: '#c0c0c0', lineHeight: 1.625, margin: 0 }}>{t.revealMessage}</p>
            </div>
          )}

          {/* Risks */}
          <p style={{ fontSize: 11, fontWeight: 600, color: '#666', letterSpacing: 1.4, textTransform: 'uppercase', alignSelf: 'flex-start', margin: 0 }}>{t.revealRisksTitle}</p>
          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            {[
              { icon: 'video', label: 'Deepfake\nVideo' },
              { icon: 'image', label: 'Synthetic\nImages' },
              { icon: 'mail', label: 'AI\nPhishing' },
            ].map(({ icon, label }) => (
              <div key={icon} style={{
                flex: 1, background: '#1f0707', border: `1px solid ${RED}30`,
                borderRadius: 14, padding: '14px 10px', display: 'flex',
                flexDirection: 'column', alignItems: 'center', gap: 8,
              }}>
                {icon === 'video' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>}
                {icon === 'image' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}
                {icon === 'mail' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
                <span style={{ fontSize: 12, fontWeight: 500, color: RED, textAlign: 'center', lineHeight: 1.42, whiteSpace: 'pre-line' }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Safe word */}
          <div style={{
            width: '100%', borderRadius: 16, border: `1px solid #f59e0b40`,
            background: '#1c1500', padding: 20, boxSizing: 'border-box',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
              </svg>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b', letterSpacing: 0.3 }}>Safety Code Word</span>
            </div>
            <p style={{ fontSize: 15, color: '#d4a84b', lineHeight: 1.53, margin: 0 }}>{t.safeWordPrompt}</p>
          </div>

          {/* Home button */}
          <button
            onClick={onHome}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 10, background: '#1e1e1e', border: `1px solid #333`,
              padding: '18px 40px', borderRadius: 16, color: '#fff',
              fontSize: 17, fontWeight: 600, cursor: 'pointer', boxSizing: 'border-box',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            {t.backToHome}
          </button>
        </div>
      </div>
    );
  }

  // CALL SCREEN
  return (
    <div style={{ padding: '0 24px 8px', display: 'flex', flexDirection: 'column', minHeight: 600 }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, marginBottom: 4 }}>
        <button
          onClick={() => { handleEndCall(); onHome(); }}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span style={{ color: FG, fontSize: 18, fontWeight: 600 }}>{t.simulationTitle}</span>
        <div style={{ width: 28 }} />
      </div>

      {/* Center section */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        {/* Caller chip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px',
          borderRadius: 24, border: `1px solid ${BORDER}`, background: CARD,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: isActive ? RED : '#555' }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: FG }}>Voicinne Agent</span>
        </div>

        {/* Orb + rings */}
        <div style={{ width: 220, height: 220, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isActive && (
            <div style={{
              position: 'absolute', width: 210, height: 210, borderRadius: '50%',
              border: `1.5px solid ${RED}`, opacity: ring1Opacity, pointerEvents: 'none',
            }} />
          )}
          {isActive && (
            <div style={{
              position: 'absolute', width: 175, height: 175, borderRadius: '50%',
              border: `1.5px solid ${RED}`, opacity: ring2Opacity, pointerEvents: 'none',
            }} />
          )}
          <div style={{
            width: 140, height: 140, borderRadius: '50%',
            background: isActive ? RED + '22' : CARD,
            border: `2px solid ${isActive ? RED : BORDER}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: `scale(${orbScale})`, transition: 'transform 0.1s ease-out',
          }}>
            <div style={{
              width: 96, height: 96, borderRadius: '50%',
              background: isActive ? RED + '33' : BORDER + '55',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {callStatus === 'idle' && (
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.35 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.69a16 16 0 0 0 6.29 6.29l.97-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              )}
              {isSpeaking && (
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
              )}
              {callStatus === 'connecting' && (
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/>
                </svg>
              )}
              {callStatus === 'connected' && callMode === 'listening' && (
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Status */}
        <span style={{ fontSize: 16, fontWeight: 500, color: isActive ? RED : MUTED, textAlign: 'center' }}>{statusLabel}</span>

        {/* Timer */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 48, fontWeight: 700, color: isLow ? RED : timerActive ? FG : MUTED, letterSpacing: -2, margin: 0, lineHeight: 1 }}>{timeString}</p>
          <p style={{ fontSize: 11, fontWeight: 500, color: isLow ? RED + '88' : MUTED, letterSpacing: 1.5, margin: '4px 0 0', textTransform: 'uppercase' }}>
            {timerActive ? 'TIME REMAINING' : 'DURATION'}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, borderRadius: 2, overflow: 'hidden', width: '100%', background: BORDER, display: 'flex' }}>
          <div style={{ flex: progressFraction, background: RED, borderRadius: 2, transition: 'flex 0.5s linear' }} />
          <div style={{ flex: 1 - progressFraction }} />
        </div>
      </div>

      {/* Error banner */}
      {callError && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 8,
          background: '#ef444418', borderRadius: 10, padding: '12px 14px',
          marginBottom: 12, border: `1px solid ${RED}40`,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p style={{ fontSize: 13, color: RED, lineHeight: 1.53, margin: 0, flex: 1 }}>{callError}</p>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 8 }}>
        {callStatus === 'idle' ? (
          <>
            <button
              onClick={handleConnect}
              style={{
                width: '100%', padding: '20px 0', borderRadius: 18,
                background: RED, border: 'none', color: '#fff',
                fontSize: 20, fontWeight: 700, cursor: 'pointer',
                boxShadow: `0 4px 14px rgba(239,68,68,0.4)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.35 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.69a16 16 0 0 0 6.29 6.29l.97-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Connect Call
            </button>

            <div style={{
              border: `1px solid ${BORDER}`, borderRadius: 12,
              padding: '12px 14px', background: CARD,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 1, flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.5, margin: 0, flex: 1 }}>{t.simulationDisclaimer}</p>
              </div>
            </div>

            {/* Educational disclaimer — warning card */}
            <div style={{
              display: 'flex', border: '1px solid rgba(245,158,11,0.31)', borderRadius: 12,
              overflow: 'hidden', background: 'rgba(245,158,11,0.05)',
            }}>
              <div style={{ width: 4, background: '#f59e0b', flexShrink: 0 }} />
              <div style={{ flex: 1, padding: '11px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', letterSpacing: 1.2 }}>IMPORTANT</span>
                </div>
                <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.5, margin: 0 }}>{t.aiDisclaimer}</p>
              </div>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px',
              borderRadius: 24, border: `1px solid ${BORDER}`, background: CARD,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
              <span style={{ fontSize: 14, fontWeight: 600, color: FG }}>Live</span>
            </div>

            <button
              onClick={handleEndCall}
              style={{
                width: 72, height: 72, borderRadius: '50%',
                background: RED, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" style={{ transform: 'rotate(135deg)' }}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.35 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.69a16 16 0 0 0 6.29 6.29l.97-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </button>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px',
              borderRadius: 24, border: `1px solid ${BORDER}`, background: CARD,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span style={{ fontSize: 14, fontWeight: 600, color: isLow ? RED : FG }}>{timeString}</span>
            </div>
          </div>
        )}

        {/* Reveal button */}
        <button
          onClick={handleReveal}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            background: RED, border: 'none', color: '#fff',
            fontSize: 18, fontWeight: 700, cursor: 'pointer',
            padding: '18px 0', borderRadius: 18,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
          {t.revealButton}
        </button>
      </div>
    </div>
  );
}
