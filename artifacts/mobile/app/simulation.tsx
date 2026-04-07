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

const DURATION_SECONDS = 3 * 60;
const TEST_AGENT_ID = 'agent_9801knkb7cbtfpk8pvfe3stexj99';

/**
 * Injects the ElevenLabs ConvAI web-component widget into the document body.
 * The widget renders its own floating button UI and handles mic + audio internally.
 * Only active on web — native requires an EAS dev build with native audio modules.
 */
function useConvaiWidget(agentId: string) {
  useEffect(() => {
    if (Platform.OS !== 'web' || !agentId) return;

    const SCRIPT_ID = 'el-convai-widget-script';
    if (!document.getElementById(SCRIPT_ID)) {
      const s = document.createElement('script');
      s.id = SCRIPT_ID;
      s.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
      s.async = true;
      s.type = 'text/javascript';
      document.body.appendChild(s);
    }

    document.querySelectorAll('elevenlabs-convai').forEach((el) => el.remove());

    const widget = document.createElement('elevenlabs-convai');
    widget.setAttribute('agent-id', agentId);
    document.body.appendChild(widget);

    return () => {
      widget.remove();
    };
  }, [agentId]);
}

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
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useLanguage();

  const [secondsLeft, setSecondsLeft] = useState(DURATION_SECONDS);
  const [revealed, setRevealed] = useState(false);
  const [timerActive, setTimerActive] = useState(false);

  const displayRevealMessage = revealMessageParam.trim() || t.revealMessage;

  useConvaiWidget(agentId);

  const revealAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

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

  const handleStartTimer = () => {
    setTimerActive(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
        <TouchableOpacity onPress={() => router.back()} testID="back-button">
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
        </Animated.View>

        <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
          {timerActive ? t.simulationSubtitle : t.simulationInfo}
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
        <View style={[styles.hintBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons
            name={Platform.OS === 'web' ? 'chatbubble-ellipses-outline' : 'construct-outline'}
            size={20}
            color={colors.mutedForeground}
            style={{ marginRight: 8, marginTop: 2 }}
          />
          <Text style={[styles.hintText, { color: colors.mutedForeground }]}>
            {Platform.OS === 'web'
              ? 'Tap the voice button in the bottom-right corner to start the AI call, then press Start Timer below.'
              : 'Live call requires an EAS development build with native audio modules.'}
          </Text>
        </View>

        {!timerActive ? (
          <TouchableOpacity
            style={[styles.callButton, { backgroundColor: colors.primary }]}
            onPress={handleStartTimer}
            activeOpacity={0.85}
            testID="start-timer-button"
          >
            <Ionicons name="timer-outline" size={24} color="#ffffff" style={{ marginRight: 10 }} />
            <Text style={styles.callButtonText}>Start Timer</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[styles.revealButtonFull, { backgroundColor: '#ef4444' }]}
          onPress={handleReveal}
          activeOpacity={0.85}
          testID="reveal-experiment-button"
        >
          <Ionicons name="eye-off-outline" size={26} color="#ffffff" style={{ marginRight: 10 }} />
          <Text style={styles.revealButtonFullText}>{t.revealButton}</Text>
        </TouchableOpacity>
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
  },
  timerText: {
    fontSize: 52,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -2,
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
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  hintText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
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
