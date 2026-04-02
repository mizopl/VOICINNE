import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
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

export default function SimulationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useLanguage();

  const [secondsLeft, setSecondsLeft] = useState(DURATION_SECONDS);
  const [revealed, setRevealed] = useState(false);
  const [timerActive, setTimerActive] = useState(true);

  const revealAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

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
              <Text style={styles.revealMessage}>{t.revealMessage}</Text>
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
            { borderColor: progressFraction > 0.8 ? '#ef4444' : colors.primary, transform: [{ scale: pulseAnim }] },
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

        <Text style={[styles.simulationSubtitle, { color: colors.mutedForeground }]}>
          {t.simulationSubtitle}
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

        <TouchableOpacity
          style={[styles.revealButton, { backgroundColor: '#ef4444' }]}
          onPress={handleReveal}
          activeOpacity={0.85}
          testID="reveal-experiment-button"
        >
          <Ionicons name="eye-off-outline" size={26} color="#ffffff" style={{ marginRight: 10 }} />
          <Text style={styles.revealButtonText}>{t.revealButton}</Text>
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
    fontSize: 56,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -2,
  },
  simulationSubtitle: {
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
    gap: 16,
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
  revealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 18,
  },
  revealButtonText: {
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
