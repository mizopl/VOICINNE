import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLanguage } from '@/contexts/LanguageContext';
import { useColors } from '@/hooks/useColors';
import { cloneVoice, createAgent, generatePersona, transcribeAudio } from '@/utils/apiClient';

const MAX_SECONDS = 60;

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useLanguage();

  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(MAX_SECONDS);
  const [isProcessing, setIsProcessing] = useState(false);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const startPulse = () => {
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    pulseLoop.current.start();
  };

  const stopPulse = () => {
    pulseLoop.current?.stop();
    Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };

  const stopRecordingInternal = async () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    stopPulse();
    setIsRecording(false);

    if (!recordingRef.current) return;

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      if (uri) {
        setRecordedUri(uri);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      recordingRef.current = null;
    }
  };

  const handleRecordToggle = async () => {
    if (isRecording) {
      await stopRecordingInternal();
      return;
    }

    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;

      setRecordedUri(null);
      setSecondsLeft(MAX_SECONDS);
      setIsRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      startPulse();

      let remaining = MAX_SECONDS;
      countdownRef.current = setInterval(() => {
        remaining -= 1;
        setSecondsLeft(remaining);
        if (remaining <= 0) {
          stopRecordingInternal();
        }
      }, 1000);
    } catch {
      setIsRecording(false);
    }
  };

  const runProcessingPipeline = async (uri: string) => {
    setIsProcessing(true);
    try {
      const uris = [uri];
      const transcription = await transcribeAudio(uris);
      const personaResult = await generatePersona(transcription);
      const persona = (personaResult as { persona?: Record<string, unknown> }).persona ?? personaResult;

      const system_prompt =
        (persona.systemInstruction as string | undefined) ??
        (persona.systemPrompt as string | undefined) ??
        (persona.system_prompt as string | undefined) ??
        JSON.stringify(persona);

      const reveal_message =
        (persona.reveal_message as string | undefined) ??
        (persona.revealMessage as string | undefined) ??
        '';

      const language_code =
        (persona.languageCode as string | undefined) ??
        (persona.detectedLanguage as string | undefined) ??
        'en';

      const first_message =
        (persona.first_message as string | undefined) ??
        (persona.firstMessage as string | undefined) ??
        '';

      const voice_id = await cloneVoice(uris);
      const { agentId, revealMessage } = await createAgent(voice_id, system_prompt, reveal_message, language_code, first_message);
      router.push({ pathname: '/simulation', params: { agentId, revealMessage } });
    } catch {
      setIsProcessing(false);
    }
  };

  const formatTime = (s: number) => {
    const secs = Math.max(0, s);
    return `0:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (isProcessing) {
    return (
      <View
        style={[
          styles.container,
          styles.processingContainer,
          { backgroundColor: colors.background, paddingTop: topPad, paddingBottom: bottomPad },
        ]}
        testID="processing-view"
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.processingText, { color: colors.foreground }]}>
          {t.processingVoice}
        </Text>
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="back-button">
          <Ionicons name="chevron-back" size={28} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <View style={styles.instructionCard}>
        <Text style={[styles.roleplayTitle, { color: colors.foreground }]}>
          {t.roleplayTitle}
        </Text>
        <Text style={[styles.roleplayInstructions, { color: colors.mutedForeground }]}>
          {t.roleplayInstructions}
        </Text>
        <View style={[styles.exampleBox, { backgroundColor: colors.primary + '14', borderColor: colors.primary + '40' }]}>
          <Ionicons name="chatbubbles-outline" size={16} color={colors.primary} style={{ marginRight: 8, marginTop: 2 }} />
          <Text style={[styles.exampleText, { color: colors.primary }]}>
            {t.roleplayExample}
          </Text>
        </View>
      </View>

      <View style={styles.recordSection}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <View
            style={[
              styles.recordRing,
              {
                borderColor: isRecording ? '#ef4444' : colors.primary,
                backgroundColor: isRecording ? 'rgba(239,68,68,0.12)' : colors.primary + '18',
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.recordButton,
                { backgroundColor: isRecording ? '#ef4444' : colors.primary },
              ]}
              onPress={handleRecordToggle}
              activeOpacity={0.85}
              testID="record-toggle-button"
            >
              {isRecording ? (
                <View style={styles.stopIcon} />
              ) : (
                <Ionicons name="mic" size={48} color="#ffffff" />
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>

        {isRecording ? (
          <View style={styles.countdownRow}>
            <View style={[styles.countdownDot, { backgroundColor: '#ef4444' }]} />
            <Text style={[styles.countdownText, { color: '#ef4444' }]}>
              {formatTime(secondsLeft)}
            </Text>
            <Text style={[styles.stopHint, { color: colors.mutedForeground }]}>
              {t.stopRecording}
            </Text>
          </View>
        ) : recordedUri ? (
          <View style={[styles.recordedBadge, { backgroundColor: colors.primary + '22', borderColor: colors.primary + '55' }]}>
            <Ionicons name="checkmark-circle" size={18} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.recordedText, { color: colors.primary }]}>{t.recorded}</Text>
          </View>
        ) : (
          <Text style={[styles.tapHint, { color: colors.mutedForeground }]}>
            {t.tapToRecord}
          </Text>
        )}
      </View>

      <View style={styles.bottomSection}>
        {recordedUri && !isRecording && (
          <TouchableOpacity
            style={[styles.beginButton, { backgroundColor: colors.primary }]}
            onPress={() => runProcessingPipeline(recordedUri)}
            activeOpacity={0.85}
            testID="begin-experiment-button"
          >
            <Text style={[styles.beginButtonText, { color: colors.primaryForeground }]}>
              {t.beginExperiment}
            </Text>
            <Ionicons name="arrow-forward" size={22} color={colors.primaryForeground} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  processingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  processingText: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    marginBottom: 4,
  },
  backBtn: {
    padding: 4,
  },
  instructionCard: {
    gap: 14,
    paddingVertical: 20,
  },
  roleplayTitle: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    lineHeight: 34,
    letterSpacing: -0.4,
  },
  roleplayInstructions: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    lineHeight: 24,
  },
  exampleBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  exampleText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    lineHeight: 20,
  },
  recordSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  recordRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  countdownText: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
  },
  stopHint: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginLeft: 4,
  },
  tapHint: {
    fontSize: 17,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.2,
  },
  recordedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  recordedText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  bottomSection: {
    paddingBottom: 16,
    minHeight: 80,
    justifyContent: 'center',
  },
  beginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 18,
  },
  beginButtonText: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
});
