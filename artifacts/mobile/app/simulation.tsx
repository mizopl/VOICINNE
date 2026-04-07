import '@/polyfills';

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLanguage } from '@/contexts/LanguageContext';
import { useColors } from '@/hooks/useColors';

import {
  ConversationProvider,
  useConversation,
} from '@elevenlabs/react';

const DURATION_SECONDS = 3 * 60;

const TEST_AGENT_ID = 'agent_9801knkb7cbtfpk8pvfe3stexj99';

export default function SimulationScreen() {
  const { agentId, revealMessage } = useLocalSearchParams<{
    agentId: string;
    revealMessage: string;
  }>();

  const resolvedAgentId = agentId?.trim() || TEST_AGENT_ID;

  return (
    <ConversationProvider>
      <SimulationContent agentId={resolvedAgentId} revealMessageParam={revealMessage ?? ''} />
    </ConversationProvider>
  );
}

function SimulationContent({
  agentId,
  revealMessageParam,
}: {
  agentId: string;
  revealMessageParam: string;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useLanguage();

  const [secondsLeft, setSecondsLeft] = useState(DURATION_SECONDS);
  const [revealed, setRevealed] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const displayRevealMessage = revealMessageParam.trim() || t.revealMessage;

  const { startSession, endSession, status, isSpeaking } = useConversation({
    onError: (error: unknown) => {
      const msg = error instanceof Error ? error.message : String(error);
      setConnectError(msg);
      setCallStarted(false);
    },
  });

  // Detect "connecting → disconnected" transition: this is how the SDK signals
  // a failed connection attempt (e.g. mic blocked, network error). The SDK does
  // NOT call onError for this — it only re-throws the promise, which the provider
  // swallows. Watching the status transition is the only reliable way to catch it.
  const prevStatusRef = useRef(status);
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;
    if (prev === 'connecting' && status === 'disconnected') {
      setCallStarted(false);
      setConnectError(
        Platform.OS === 'web'
          ? 'Mic blocked in embedded preview. Open the app URL directly in a browser tab to test the call.'
          : 'Live call requires an EAS development build — Expo Go is missing the native audio module. Build with: eas build --profile development'
      );
    }
  }, [status]);

  const revealAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bar1Anim = useRef(new Animated.Value(0.3)).current;
  const bar2Anim = useRef(new Animated.Value(0.3)).current;
  const bar3Anim = useRef(new Animated.Value(0.3)).current;

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  useEffect(() => {
    if (!isSpeaking) {
      Animated.parallel([
        Animated.timing(bar1Anim, { toValue: 0.3, duration: 200, useNativeDriver: true }),
        Animated.timing(bar2Anim, { toValue: 0.3, duration: 200, useNativeDriver: true }),
        Animated.timing(bar3Anim, { toValue: 0.3, duration: 200, useNativeDriver: true }),
      ]).start();
      return;
    }
    const animateBar = (bar: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(bar, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(bar, { toValue: 0.2, duration: 300, useNativeDriver: true }),
        ])
      );
    const loops = [
      animateBar(bar1Anim, 0),
      animateBar(bar2Anim, 150),
      animateBar(bar3Anim, 300),
    ];
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [isSpeaking]);

  useEffect(() => {
    if (isConnected && !timerActive && !revealed) {
      setTimerActive(true);
    }
  }, [isConnected]);

  useEffect(() => {
    if (!timerActive || secondsLeft <= 0) {
      if (secondsLeft <= 0 && !revealed) {
        handleReveal();
      }
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

  const handleReveal = () => {
    if (revealed) return;
    // endSession() returns void (not a Promise), so calling it synchronously
    // before state update is the correct sequencing per @elevenlabs/react types.
    if (isConnected || isConnecting) {
      endSession();
    }
    setRevealed(true);
    setTimerActive(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Animated.spring(revealAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 60,
      friction: 8,
    }).start();
  };

  const handleConnect = () => {
    if (!agentId) return;
    setConnectError(null);
    setCallStarted(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startSession({ agentId });
  };

  const handleEndCall = () => {
    endSession();
    setCallStarted(false);
    setTimerActive(false);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeString = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const progressFraction = (DURATION_SECONDS - secondsLeft) / DURATION_SECONDS;

  const revealScale = revealAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1],
  });

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
          <ScrollView contentContainerStyle={styles.revealScroll} showsVerticalScrollIndicator={false}>
            <View style={[styles.revealIconRing, { borderColor: '#ef4444' }]}>
              <Ionicons name="eye-off" size={48} color="#ef4444" />
            </View>

            <Text style={styles.revealTitle}>{t.revealTitle}</Text>

            <View style={[styles.revealCard, { backgroundColor: '#1a1a1a', borderColor: '#333' }]}>
              <Text style={styles.revealMessage}>{displayRevealMessage}</Text>
            </View>

            <View style={[styles.safeWordBox, { backgroundColor: '#1a1a1a', borderColor: '#ef444455' }]}>
              <Ionicons name="shield-checkmark" size={22} color="#ef4444" style={{ marginBottom: 8 }} />
              <Text style={styles.safeWordText}>{t.safeWordPrompt}</Text>
            </View>

            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => router.replace('/')}
              activeOpacity={0.85}
              testID="go-home-button"
            >
              <Ionicons name="home" size={22} color="#ffffff" style={{ marginRight: 10 }} />
              <Text style={styles.homeButtonText}>{t.backToHome}</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: topPad, paddingBottom: bottomPad },
      ]}
    >
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => { handleEndCall(); router.back(); }} testID="back-button">
          <Ionicons name="chevron-back" size={28} color={colors.mutedForeground} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.foreground }]}>{t.simulationTitle}</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.timerSection}>
        <Text style={[styles.timerLabel, { color: colors.mutedForeground }]}>{t.timeRemaining}</Text>

        <Animated.View
          style={[
            styles.timerRing,
            {
              borderColor: progressFraction > 0.8 ? '#ef4444' : colors.primary,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Text
            style={[
              styles.timerText,
              { color: progressFraction > 0.8 ? '#ef4444' : colors.foreground },
            ]}
          >
            {timeString}
          </Text>

          {isConnected && (
            <View style={styles.speakingIndicator}>
              {[bar1Anim, bar2Anim, bar3Anim].map((bar, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.bar,
                    {
                      backgroundColor: isSpeaking ? colors.primary : colors.mutedForeground,
                      transform: [{ scaleY: bar }],
                    },
                  ]}
                />
              ))}
            </View>
          )}
        </Animated.View>

        <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
          {isConnecting
            ? 'Connecting…'
            : isConnected
            ? isSpeaking
              ? 'AI is speaking'
              : 'Listening…'
            : t.simulationSubtitle}
        </Text>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                flex: progressFraction,
                backgroundColor: progressFraction > 0.8 ? '#ef4444' : colors.primary,
              },
            ]}
          />
          <View style={{ flex: 1 - progressFraction }} />
        </View>
      </View>

      <View style={styles.bottomSection}>
        <View style={[styles.infoBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="information-circle-outline" size={20} color={colors.mutedForeground} style={{ marginRight: 8, marginTop: 2 }} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            {t.simulationInfo}
          </Text>
        </View>

        {connectError ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={18} color="#ef4444" style={{ marginRight: 8 }} />
            <Text style={styles.errorBannerText}>{connectError}</Text>
          </View>
        ) : null}

        {!callStarted ? (
          <TouchableOpacity
            style={[styles.callButton, { backgroundColor: colors.primary, opacity: agentId ? 1 : 0.5 }]}
            onPress={handleConnect}
            activeOpacity={0.85}
            disabled={!agentId}
            testID="connect-call-button"
          >
            <Ionicons name="call" size={24} color="#ffffff" style={{ marginRight: 10 }} />
            <Text style={styles.callButtonText}>Connect Call</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.callActiveRow}>
            <TouchableOpacity
              style={[styles.endCallButton, { backgroundColor: '#ef4444' }]}
              onPress={handleEndCall}
              activeOpacity={0.85}
              testID="end-call-button"
            >
              <Ionicons name="call" size={22} color="#ffffff" style={{ marginRight: 8, transform: [{ rotate: '135deg' }] }} />
              <Text style={styles.endCallButtonText}>End Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.revealButton, { backgroundColor: '#1a1a1a', borderColor: '#ef4444', borderWidth: 1.5 }]}
              onPress={handleReveal}
              activeOpacity={0.85}
              testID="reveal-experiment-button"
            >
              <Ionicons name="eye-off-outline" size={22} color="#ef4444" style={{ marginRight: 8 }} />
              <Text style={[styles.revealButtonText, { color: '#ef4444' }]}>Reveal</Text>
            </TouchableOpacity>
          </View>
        )}

        {!callStarted && (
          <TouchableOpacity
            style={[styles.revealButtonFull, { backgroundColor: '#ef4444' }]}
            onPress={handleReveal}
            activeOpacity={0.85}
            testID="reveal-experiment-button"
          >
            <Ionicons name="eye-off-outline" size={26} color="#ffffff" style={{ marginRight: 10 }} />
            <Text style={styles.revealButtonFullText}>{t.revealButton}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginBottom: 8,
  },
  topTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
  },
  timerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  timerLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  timerRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  timerText: {
    fontSize: 52,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -2,
  },
  speakingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 24,
  },
  bar: {
    width: 5,
    height: 24,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  progressBarContainer: {
    paddingVertical: 16,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  progressBarFill: {
    borderRadius: 3,
  },
  bottomSection: {
    gap: 14,
    paddingBottom: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#2d0d0d',
    borderColor: '#ef4444',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#ef4444',
    lineHeight: 20,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 18,
  },
  callButtonText: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
  },
  callActiveRow: {
    flexDirection: 'row',
    gap: 12,
  },
  endCallButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 18,
  },
  endCallButtonText: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
  },
  revealButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 18,
  },
  revealButtonText: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  revealButtonFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 18,
  },
  revealButtonFullText: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
  },
  revealContainer: {
    flex: 1,
  },
  revealScroll: {
    alignItems: 'center',
    gap: 24,
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 4,
  },
  revealIconRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revealTitle: {
    fontSize: 34,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  revealCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 24,
    width: '100%',
  },
  revealMessage: {
    fontSize: 17,
    fontFamily: 'Inter_400Regular',
    color: '#cccccc',
    lineHeight: 28,
  },
  safeWordBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    width: '100%',
    alignItems: 'center',
  },
  safeWordText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#ef4444',
    textAlign: 'center',
    lineHeight: 24,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 16,
    width: '100%',
  },
  homeButtonText: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#ffffff',
  },
});
