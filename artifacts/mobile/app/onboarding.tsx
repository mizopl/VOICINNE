import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QUESTIONS_KEYS, useLanguage } from '@/contexts/LanguageContext';
import { useColors } from '@/hooks/useColors';
import { cloneVoice, createAgent, generatePersona, transcribeAudio } from '@/utils/apiClient';

const TOTAL_QUESTIONS = 6;

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useLanguage();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [recordedUris, setRecordedUris] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const questionKey = QUESTIONS_KEYS[currentIndex];
  const questionText = t[questionKey] as string;

  const startPulse = () => {
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    pulseLoop.current.start();
  };

  const stopPulse = () => {
    pulseLoop.current?.stop();
    Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };

  const handleRecordStart = async () => {
    const { status, canAskAgain } = await Audio.requestPermissionsAsync();

    if (status !== 'granted') {
      if (!canAskAgain) {
        Alert.alert(t.micPermissionTitle, t.micPermissionDenied);
      } else {
        Alert.alert(t.micPermissionTitle, t.micPermissionDenied);
      }
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

      setIsRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      startPulse();
    } catch {
      Alert.alert(t.micPermissionTitle, t.micPermissionDenied);
    }
  };

  const handleRecordEnd = async () => {
    if (!isRecording || !recordingRef.current) return;

    stopPulse();
    setIsRecording(false);

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      if (uri) {
        setRecordedUris((prev) => {
          const next = [...prev];
          next[currentIndex] = uri;
          return next;
        });
        setHasRecorded(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      recordingRef.current = null;
    }
  };

  const runProcessingPipeline = async (uris: string[]) => {
    setIsProcessing(true);
    try {
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

      const voice_id = await cloneVoice(uris);
      const { agentId, revealMessage } = await createAgent(voice_id, system_prompt, reveal_message, language_code);
      router.push({ pathname: '/simulation', params: { agentId, revealMessage } });
    } catch {
      setIsProcessing(false);
    }
  };

  const handleNext = () => {
    Haptics.selectionAsync();
    if (currentIndex < TOTAL_QUESTIONS - 1) {
      setCurrentIndex(currentIndex + 1);
      setHasRecorded(false);
    } else {
      runProcessingPipeline(recordedUris);
    }
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

        <View style={styles.progressRow}>
          {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                {
                  backgroundColor:
                    i < currentIndex
                      ? colors.primary
                      : i === currentIndex
                      ? colors.primary
                      : colors.border,
                  opacity: i < currentIndex ? 1 : i === currentIndex ? 1 : 0.4,
                  width: i === currentIndex ? 28 : 10,
                },
              ]}
            />
          ))}
        </View>

        <Text style={[styles.counterText, { color: colors.mutedForeground }]}>
          {currentIndex + 1} / {TOTAL_QUESTIONS}
        </Text>
      </View>

      <View style={styles.questionSection}>
        <Text style={[styles.questionLabel, { color: colors.mutedForeground }]}>
          {t.questionLabel} {currentIndex + 1}
        </Text>
        <Text style={[styles.questionText, { color: colors.foreground }]}>
          {questionText}
        </Text>
      </View>

      <View style={styles.recordSection}>
        <Animated.View style={[{ transform: [{ scale: pulseAnim }] }]}>
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
              onPressIn={handleRecordStart}
              onPressOut={handleRecordEnd}
              activeOpacity={0.85}
              testID="hold-to-record-button"
            >
              <Ionicons
                name={isRecording ? 'radio-button-on' : 'mic'}
                size={48}
                color="#ffffff"
              />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Text style={[styles.recordLabel, { color: isRecording ? '#ef4444' : colors.mutedForeground }]}>
          {isRecording ? t.recording : t.holdToRecord}
        </Text>

        {hasRecorded && (
          <View style={[styles.recordedBadge, { backgroundColor: colors.primary + '22', borderColor: colors.primary + '55' }]}>
            <Ionicons name="checkmark-circle" size={18} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.recordedText, { color: colors.primary }]}>{t.recorded}</Text>
          </View>
        )}
      </View>

      <View style={styles.nextSection}>
        {hasRecorded && (
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: colors.primary }]}
            onPress={handleNext}
            activeOpacity={0.85}
            testID="next-button"
          >
            <Text style={[styles.nextButtonText, { color: colors.primaryForeground }]}>
              {currentIndex < TOTAL_QUESTIONS - 1 ? t.next : t.beginExperiment}
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
    paddingHorizontal: 28,
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
    marginBottom: 8,
  },
  backBtn: {
    padding: 4,
    marginRight: 8,
  },
  progressRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDot: {
    height: 10,
    borderRadius: 5,
  },
  counterText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    marginLeft: 8,
  },
  questionSection: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  questionLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  recordSection: {
    alignItems: 'center',
    gap: 20,
    paddingVertical: 32,
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
  recordLabel: {
    fontSize: 18,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.3,
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
  nextSection: {
    paddingBottom: 16,
    minHeight: 72,
    justifyContent: 'center',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 18,
  },
  nextButtonText: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
});
