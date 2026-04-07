import '@/polyfills';

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Conversation } from '@elevenlabs/react';

import { useLanguage } from '@/contexts/LanguageContext';
import { WaveformLine, buildFlatPoints } from '@/utils/waveform';

const RED = '#ef4444';
const CARD = '#141414';
const BORDER = '#262626';
const FG = '#f0f0f0';
const MUTED = '#9ca3af';
const DURATION_SECONDS = 3 * 60;
const TEST_AGENT_ID = 'agent_9801knkb7cbtfpk8pvfe3stexj99';
const W = Dimensions.get('window').width;
const WAVE_H = 48;

type CallStatus = 'idle' | 'connecting' | 'connected' | 'ending';
type CallMode = 'listening' | 'speaking';

export default function SimulationScreen() {
  const { agentId, revealMessage } = useLocalSearchParams<{
    agentId: string;
    revealMessage: string;
  }>();

  const resolvedAgentId = agentId?.trim() || TEST_AGENT_ID;

  return <SimulationContent agentId={resolvedAgentId} revealMessageParam={revealMessage ?? ''} />;
}

function SimulationContent({
  agentId,
  revealMessageParam,
}: {
  agentId: string;
  revealMessageParam: string;
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useLanguage();

  const [secondsLeft, setSecondsLeft] = useState(DURATION_SECONDS);
  const [revealed, setRevealed] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [callMode, setCallMode] = useState<CallMode>('listening');
  const [callError, setCallError] = useState<string | null>(null);

  const conversationRef = useRef<{ endSession: () => Promise<void> } | null>(null);

  const revealAnim = useRef(new Animated.Value(0)).current;
  const orbScaleAnim = useRef(new Animated.Value(1)).current;
  const ring1Anim = useRef(new Animated.Value(0.6)).current;
  const ring2Anim = useRef(new Animated.Value(0.3)).current;

  const flatWavePoints = buildFlatPoints(W - 48, WAVE_H);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const isActive = callStatus === 'connected' || callStatus === 'connecting';
  const isSpeaking = callStatus === 'connected' && callMode === 'speaking';

  // Orb pulse animation — speed and scale depend on call state
  useEffect(() => {
    const speed = isSpeaking ? 350 : callStatus === 'connecting' ? 550 : 1100;
    const scale = isSpeaking ? 1.1 : callStatus === 'connecting' ? 1.05 : 1.02;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(orbScaleAnim, {
          toValue: scale,
          duration: speed,
          useNativeDriver: true,
        }),
        Animated.timing(orbScaleAnim, {
          toValue: 1,
          duration: speed,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [callStatus, callMode]);

  // Ripple ring animations (only while active)
  useEffect(() => {
    if (!isActive) {
      ring1Anim.setValue(0.6);
      ring2Anim.setValue(0.3);
      return;
    }
    const duration = isSpeaking ? 800 : 1400;
    const loop1 = Animated.loop(
      Animated.sequence([
        Animated.timing(ring1Anim, { toValue: 1.0, duration, useNativeDriver: true }),
        Animated.timing(ring1Anim, { toValue: 0.6, duration, useNativeDriver: true }),
      ])
    );
    const loop2 = Animated.loop(
      Animated.sequence([
        Animated.delay(duration / 2),
        Animated.timing(ring2Anim, { toValue: 0.8, duration, useNativeDriver: true }),
        Animated.timing(ring2Anim, { toValue: 0.2, duration, useNativeDriver: true }),
      ])
    );
    loop1.start();
    loop2.start();
    return () => {
      loop1.stop();
      loop2.stop();
    };
  }, [isActive, isSpeaking]);

  // Auto-start timer when call connects
  useEffect(() => {
    if (callStatus === 'connected' && !timerActive && !revealed) {
      setTimerActive(true);
    }
  }, [callStatus]);

  // Timer countdown
  useEffect(() => {
    if (!timerActive || secondsLeft <= 0) {
      if (secondsLeft <= 0 && !revealed) handleReveal();
      return;
    }
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, secondsLeft]);

  // Auto-end call when timer hits 0
  useEffect(() => {
    if (secondsLeft === 0 && (callStatus === 'connected' || callStatus === 'connecting')) {
      terminateCall();
    }
  }, [secondsLeft]);

  const terminateCall = async () => {
    if (conversationRef.current) {
      setCallStatus('ending');
      try {
        await conversationRef.current.endSession();
      } catch (_) {}
      conversationRef.current = null;
    }
    setCallStatus('idle');
  };

  const handleConnect = async () => {
    if (callStatus !== 'idle') return;
    setCallError(null);
    setCallStatus('connecting');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const conv = await Conversation.startSession({
        agentId,
        connectionType: 'websocket',
        onStatusChange: ({ status }: { status: string }) => {
          if (status === 'connected') setCallStatus('connected');
          if (status === 'disconnected') {
            conversationRef.current = null;
            setCallStatus('idle');
          }
        },
        onModeChange: ({ mode }: { mode: string }) => setCallMode(mode as CallMode),
      });
      conversationRef.current = conv as { endSession: () => Promise<void> };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setCallError(
        Platform.OS === 'web'
          ? `Connection error: ${msg}`
          : 'Live call requires an EAS development build with native audio modules.'
      );
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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Animated.spring(revealAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 60,
      friction: 8,
    }).start();
  };

  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeString = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const progressFraction = (DURATION_SECONDS - secondsLeft) / DURATION_SECONDS;
  const isLow = progressFraction > 0.8;

  const revealScale = revealAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });

  // ── REVEAL SCREEN ──────────────────────────────────────────────────────────
  if (revealed) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: '#0a0a0a', paddingTop: topPad, paddingBottom: bottomPad },
        ]}
      >
        <Animated.View
          style={[
            styles.revealContainer,
            { transform: [{ scale: revealScale }], opacity: revealAnim },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.revealScroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Icon */}
            <View style={[styles.revealIconRing, { borderColor: RED }]}>
              <Ionicons name="eye-off" size={48} color={RED} />
            </View>

            {/* Title */}
            <Text style={styles.revealTitle}>{t.revealTitle}</Text>

            {/* Flat waveform separator */}
            <View style={styles.revealWaveContainer}>
              <WaveformLine points={flatWavePoints} color={RED + '60'} width={W - 48} height={WAVE_H} strokeWidth={1.5} />
            </View>

            {/* Stat card */}
            <View style={styles.revealStatCard}>
              <Text style={styles.revealStatNumber}>{t.revealStat}</Text>
              <Text style={styles.revealStatCaption}>{t.revealStatCaption}</Text>
            </View>

            {/* Body */}
            <View style={[styles.revealCard, { backgroundColor: '#141414', borderColor: '#2a2a2a' }]}>
              <Text style={styles.revealMessage}>{t.revealMessage}</Text>
            </View>

            {/* Other risks */}
            <Text style={styles.revealRisksTitle}>{t.revealRisksTitle}</Text>
            <View style={styles.revealRisksRow}>
              <View style={styles.revealRiskChip}>
                <Ionicons name="videocam-outline" size={18} color={RED} />
                <Text style={styles.revealRiskLabel}>Deepfake{'\n'}Video</Text>
              </View>
              <View style={styles.revealRiskChip}>
                <Ionicons name="image-outline" size={18} color={RED} />
                <Text style={styles.revealRiskLabel}>Synthetic{'\n'}Images</Text>
              </View>
              <View style={styles.revealRiskChip}>
                <Ionicons name="mail-outline" size={18} color={RED} />
                <Text style={styles.revealRiskLabel}>AI{'\n'}Phishing</Text>
              </View>
            </View>

            {/* Safe word */}
            <View style={styles.safeWordBox}>
              <View style={styles.safeWordHeader}>
                <Ionicons name="key-outline" size={20} color="#f59e0b" />
                <Text style={styles.safeWordTitle}>Safety Code Word</Text>
              </View>
              <Text style={styles.safeWordText}>{t.safeWordPrompt}</Text>
            </View>

            {/* Home button */}
            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => router.replace('/')}
              activeOpacity={0.85}
              testID="go-home-button"
            >
              <Ionicons name="home" size={20} color="#ffffff" style={{ marginRight: 10 }} />
              <Text style={styles.homeButtonText}>{t.backToHome}</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    );
  }

  // ── STATUS LABEL ───────────────────────────────────────────────────────────
  const statusLabel =
    callStatus === 'idle'
      ? t.callStatusIdle
      : callStatus === 'connecting'
        ? t.callStatusConnecting
        : callStatus === 'ending'
          ? t.callStatusEnding
          : callMode === 'speaking'
            ? t.callStatusSpeaking
            : t.callStatusListening;

  // ── CALL SCREEN ────────────────────────────────────────────────────────────
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: '#0a0a0a', paddingTop: topPad, paddingBottom: bottomPad },
      ]}
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => {
            handleEndCall();
            router.replace('/');
          }}
          testID="back-button"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={28} color={MUTED} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: FG }]}>{t.simulationTitle}</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* ── CENTER SECTION ── */}
      <View style={styles.centerSection}>
        {/* Caller name chip */}
        <View style={[styles.callerChip, { backgroundColor: CARD, borderColor: BORDER }]}>
          <View style={[styles.callerDot, { backgroundColor: isActive ? RED : '#555' }]} />
          <Text style={[styles.callerName, { color: FG }]}>Voicinne Agent</Text>
        </View>

        {/* Orb + ripple rings */}
        <View style={styles.orbWrapper}>
          {/* Outer ripple ring 1 */}
          {isActive && (
            <Animated.View
              style={[
                styles.rippleRing,
                {
                  width: 210,
                  height: 210,
                  borderRadius: 105,
                  borderColor: RED,
                  opacity: ring1Anim,
                },
              ]}
            />
          )}
          {/* Outer ripple ring 2 */}
          {isActive && (
            <Animated.View
              style={[
                styles.rippleRing,
                {
                  width: 175,
                  height: 175,
                  borderRadius: 88,
                  borderColor: RED,
                  opacity: ring2Anim,
                },
              ]}
            />
          )}

          {/* Main orb */}
          <Animated.View
            style={[
              styles.orb,
              {
                backgroundColor: isActive ? RED + '22' : CARD,
                borderColor: isActive ? RED : BORDER,
                transform: [{ scale: orbScaleAnim }],
              },
            ]}
          >
            <View
              style={[
                styles.orbInner,
                { backgroundColor: isActive ? RED + '33' : BORDER + '55' },
              ]}
            >
              <Ionicons
                name={
                  callStatus === 'idle'
                    ? 'call-outline'
                    : isSpeaking
                      ? 'volume-high-outline'
                      : callStatus === 'connecting'
                        ? 'radio-outline'
                        : 'mic-outline'
                }
                size={44}
                color={isActive ? RED : MUTED}
              />
            </View>
          </Animated.View>
        </View>

        {/* Status text */}
        <Text style={[styles.statusLabel, { color: isActive ? RED : MUTED }]}>
          {statusLabel}
        </Text>

        {/* Timer */}
        <View style={styles.timerBlock}>
          <Text
            style={[
              styles.timerText,
              { color: isLow ? RED : timerActive ? FG : MUTED },
            ]}
          >
            {timeString}
          </Text>
          <Text
            style={[
              styles.timerSub,
              { color: isLow ? RED + '88' : MUTED },
            ]}
          >
            {timerActive ? 'TIME REMAINING' : 'DURATION'}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={[styles.progressBg, { backgroundColor: BORDER }]}>
          <View
            style={[
              styles.progressFill,
              { flex: progressFraction, backgroundColor: isLow ? RED : RED },
            ]}
          />
          <View style={{ flex: 1 - progressFraction }} />
        </View>
      </View>

      {/* Error banner */}
      {callError && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={16} color={RED} style={{ marginRight: 8 }} />
          <Text style={styles.errorText}>{callError}</Text>
        </View>
      )}

      {/* ── CONTROLS ── */}
      <View style={styles.controls}>
        {callStatus === 'idle' ? (
          <>
            <TouchableOpacity
              style={[styles.connectBtn, { backgroundColor: RED }]}
              onPress={handleConnect}
              activeOpacity={0.85}
              testID="connect-call-button"
            >
              <Ionicons name="call" size={26} color="#fff" style={{ marginRight: 12 }} />
              <Text style={styles.connectBtnText}>Connect Call</Text>
            </TouchableOpacity>

            {/* Simulation how-it-works box */}
            <View style={[styles.simDisclaimerBox, { backgroundColor: CARD, borderColor: BORDER }]}>
              <View style={styles.simDisclaimerRow}>
                <Ionicons name="information-circle-outline" size={15} color={RED} style={{ marginTop: 1 }} />
                <Text style={[styles.simDisclaimerText, { color: MUTED }]}>{t.simulationDisclaimer}</Text>
              </View>
            </View>

            {/* Educational disclaimer */}
            <Text style={[styles.simAiDisclaimerText, { color: '#6b7280' }]}>{t.aiDisclaimer}</Text>
          </>
        ) : (
          <View style={styles.activeControls}>
            <View style={styles.activeControlsRow}>
              {/* Mic live indicator */}
              <View style={[styles.controlPill, { backgroundColor: CARD, borderColor: BORDER }]}>
                <Ionicons name="mic-outline" size={20} color={RED} />
                <Text style={[styles.controlPillText, { color: FG }]}>Live</Text>
              </View>

              {/* End call */}
              <TouchableOpacity
                style={styles.endCallCircle}
                onPress={handleEndCall}
                activeOpacity={0.85}
                testID="end-call-button"
              >
                <Ionicons name="call" size={28} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
              </TouchableOpacity>

              {/* Timer status pill */}
              <View style={[styles.controlPill, { backgroundColor: CARD, borderColor: BORDER }]}>
                <Ionicons name="timer-outline" size={20} color={RED} />
                <Text
                  style={[
                    styles.controlPillText,
                    { color: isLow ? RED : FG },
                  ]}
                >
                  {timeString}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Reveal button — always visible */}
        <TouchableOpacity
          style={styles.revealBtn}
          onPress={handleReveal}
          activeOpacity={0.85}
          testID="reveal-experiment-button"
        >
          <Ionicons name="eye-off-outline" size={22} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.revealBtnText}>{t.revealButton}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginBottom: 4,
  },
  topTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
  },

  // Center
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingVertical: 8,
  },
  callerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 24,
    borderWidth: 1,
  },
  callerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  callerName: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },

  // Orb
  orbWrapper: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rippleRing: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  orb: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusLabel: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },

  // Timer
  timerBlock: {
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: 48,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -2,
  },
  timerSub: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 1.5,
  },
  progressBg: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    flexDirection: 'row',
    width: '100%',
  },
  progressFill: {
    borderRadius: 2,
  },

  // Simulation disclaimers (idle state)
  simDisclaimerBox: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  simDisclaimerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  simDisclaimerText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
  },
  simAiDisclaimerText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    lineHeight: 17,
    textAlign: 'center',
    paddingHorizontal: 4,
  },

  // Error
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef444418',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ef444440',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: RED,
    lineHeight: 20,
  },

  // Controls
  controls: {
    gap: 12,
    paddingBottom: 8,
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 18,
    shadowColor: RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  connectBtnText: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
  },
  activeControls: {
    alignItems: 'center',
  },
  activeControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  controlPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
  },
  controlPillText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  endCallCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: RED,
    paddingVertical: 18,
    borderRadius: 18,
  },
  revealBtnText: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
  },

  // Reveal screen
  revealContainer: {
    flex: 1,
  },
  revealScroll: {
    alignItems: 'center',
    gap: 20,
    paddingTop: 28,
    paddingBottom: 32,
    paddingHorizontal: 4,
  },
  revealIconRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef444412',
  },
  revealTitle: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  revealWaveContainer: {
    width: W - 48,
    height: WAVE_H,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: -4,
  },
  revealStatCard: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: '#1f0707',
    borderWidth: 1,
    borderColor: '#ef444440',
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 8,
  },
  revealStatNumber: {
    fontSize: 56,
    fontFamily: 'Inter_700Bold',
    color: RED,
    letterSpacing: -2,
    lineHeight: 62,
  },
  revealStatCaption: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#cc8888',
    textAlign: 'center',
    lineHeight: 22,
  },
  revealCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 22,
    width: '100%',
  },
  revealMessage: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#c0c0c0',
    lineHeight: 26,
  },
  revealRisksTitle: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: '#666',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    alignSelf: 'flex-start',
    marginBottom: -4,
  },
  revealRisksRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  revealRiskChip: {
    flex: 1,
    backgroundColor: '#1f0707',
    borderWidth: 1,
    borderColor: RED + '30',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 8,
  },
  revealRiskLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: RED,
    textAlign: 'center',
    lineHeight: 17,
  },
  safeWordBox: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f59e0b40',
    backgroundColor: '#1c1500',
    padding: 20,
    gap: 10,
  },
  safeWordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  safeWordTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#f59e0b',
    letterSpacing: 0.3,
  },
  safeWordText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#d4a84b',
    lineHeight: 23,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 16,
    width: '100%',
  },
  homeButtonText: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    color: '#ffffff',
  },
});
