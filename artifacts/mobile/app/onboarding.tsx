import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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

import { useLanguage } from '@/contexts/LanguageContext';
import { useColors } from '@/hooks/useColors';
import { cloneVoice, createAgent, generatePersona, transcribeAudio } from '@/utils/apiClient';

const MAX_SECONDS = 60;
const PROMPT_TRIGGER = 30;

type Phase = 'idle' | 'recording' | 'preview' | 'processing';

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useLanguage();

  const [phase, setPhase] = useState<Phase>('idle');
  const [secondsLeft, setSecondsLeft] = useState(MAX_SECONDS);
  const [showPrompt, setShowPrompt] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const promptAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
        recordingRef.current = null;
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (phase === 'preview' && recordedUri) {
      Audio.Sound.createAsync({ uri: recordedUri })
        .then(({ sound }) => {
          soundRef.current = sound;
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              setIsPlaying(false);
            }
          });
        })
        .catch(() => {});
    } else {
      soundRef.current?.unloadAsync().catch(() => {});
      soundRef.current = null;
      setIsPlaying(false);
    }
  }, [phase, recordedUri]);

  const startPulse = () => {
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.14, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    pulseLoop.current.start();
  };

  const stopPulse = () => {
    pulseLoop.current?.stop();
    Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };

  const animatePromptIn = () => {
    setShowPrompt(true);
    Animated.spring(promptAnim, {
      toValue: 1,
      tension: 80,
      friction: 8,
      useNativeDriver: true,
    }).start();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const stopRecordingInternal = async () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    stopPulse();

    if (!recordingRef.current) {
      setPhase('idle');
      return;
    }

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      if (uri) {
        setRecordedUri(uri);
        setPhase('preview');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setPhase('idle');
      }
    } catch {
      recordingRef.current = null;
      setPhase('idle');
    }
  };

  const handleStartRecording = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t.micPermissionTitle, t.micPermissionDenied);
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

      setShowPrompt(false);
      promptAnim.setValue(0);
      setSecondsLeft(MAX_SECONDS);
      setPhase('recording');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      startPulse();

      let remaining = MAX_SECONDS;
      countdownRef.current = setInterval(() => {
        remaining -= 1;
        setSecondsLeft(remaining);
        if (remaining === PROMPT_TRIGGER) {
          animatePromptIn();
        }
        if (remaining <= 0) {
          stopRecordingInternal();
        }
      }, 1000);
    } catch {
      setPhase('idle');
    }
  };

  const handleReRecord = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync().catch(() => {});
      await soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
    setIsPlaying(false);
    setRecordedUri(null);
    setShowPrompt(false);
    promptAnim.setValue(0);
    setSecondsLeft(MAX_SECONDS);
    setPhase('idle');
  };

  const handlePlayPause = async () => {
    if (!soundRef.current) return;
    if (isPlaying) {
      await soundRef.current.pauseAsync().catch(() => {});
      setIsPlaying(false);
    } else {
      await soundRef.current.replayAsync().catch(() => {});
      setIsPlaying(true);
    }
  };

  const runProcessingPipeline = async () => {
    if (!recordedUri) return;
    setPhase('processing');
    const uris = [recordedUri];
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

      const first_message =
        (persona.first_message as string | undefined) ??
        (persona.firstMessage as string | undefined) ??
        '';

      const voice_id = await cloneVoice(uris);
      const { agentId, revealMessage } = await createAgent(
        voice_id, system_prompt, reveal_message, language_code, first_message
      );
      router.push({ pathname: '/simulation', params: { agentId, revealMessage } });
    } catch {
      setPhase('preview');
    }
  };

  const formatTime = (s: number) => {
    const secs = Math.max(0, s);
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  if (phase === 'processing') {
    return (
      <View
        style={[styles.container, styles.centered, {
          backgroundColor: colors.background,
          paddingTop: topPad,
          paddingBottom: bottomPad,
        }]}
        testID="processing-view"
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.processingText, { color: colors.foreground }]}>
          {t.processingVoice}
        </Text>
      </View>
    );
  }

  if (phase === 'idle') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad, paddingBottom: bottomPad }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="back-button">
            <Ionicons name="chevron-back" size={28} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        <View style={styles.idleContent}>
          <Text style={[styles.mainTitle, { color: colors.foreground }]}>
            {t.recordingTitle}
          </Text>
          <Text style={[styles.instructions, { color: colors.mutedForeground }]}>
            {t.recordingInstructions}
          </Text>
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: colors.primary }]}
            onPress={handleStartRecording}
            activeOpacity={0.85}
            testID="start-recording-button"
          >
            <Ionicons name="mic" size={24} color={colors.primaryForeground} style={{ marginRight: 10 }} />
            <Text style={[styles.startButtonText, { color: colors.primaryForeground }]}>
              {t.startRecordingBtn}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (phase === 'recording') {
    return (
      <View style={[styles.container, styles.centered, {
        backgroundColor: colors.background,
        paddingTop: topPad,
        paddingBottom: bottomPad,
      }]}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <View style={[styles.timerRing, { borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.10)' }]}>
            <View style={styles.timerDot} />
            <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.promptBox,
            {
              backgroundColor: colors.primary + '1A',
              borderColor: colors.primary,
              opacity: promptAnim,
              transform: [{ scale: promptAnim }],
            },
          ]}
          pointerEvents="none"
        >
          <Text style={[styles.promptText, { color: colors.primary }]}>
            {t.promptText}
          </Text>
        </Animated.View>

        <TouchableOpacity
          style={styles.stopButton}
          onPress={stopRecordingInternal}
          activeOpacity={0.85}
          testID="stop-recording-button"
        >
          <View style={styles.stopIcon} />
          <Text style={styles.stopButtonText}>{t.stopRecording}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad, paddingBottom: bottomPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleReRecord} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <View style={styles.previewContent}>
        <View style={[styles.recordedBadge, { backgroundColor: colors.primary + '22', borderColor: colors.primary + '55' }]}>
          <Ionicons name="checkmark-circle" size={18} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.recordedText, { color: colors.primary }]}>{t.recorded}</Text>
        </View>

        <TouchableOpacity
          style={[styles.playerButton, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '55', borderWidth: 2 }]}
          onPress={handlePlayPause}
          activeOpacity={0.8}
          testID="play-pause-button"
        >
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={52} color={colors.primary} />
        </TouchableOpacity>

        <Text style={[styles.playerHint, { color: colors.mutedForeground }]}>
          {isPlaying ? t.recording : t.listenBack}
        </Text>
      </View>

      <View style={styles.previewActions}>
        <TouchableOpacity
          style={[styles.reRecordButton, { borderColor: colors.border }]}
          onPress={handleReRecord}
          activeOpacity={0.85}
          testID="re-record-button"
        >
          <Ionicons name="refresh" size={20} color={colors.mutedForeground} style={{ marginRight: 8 }} />
          <Text style={[styles.reRecordText, { color: colors.mutedForeground }]}>{t.reRecord}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: colors.primary }]}
          onPress={runProcessingPipeline}
          activeOpacity={0.85}
          testID="send-for-cloning-button"
        >
          <Text style={[styles.sendButtonText, { color: colors.primaryForeground }]}>{t.sendForCloning}</Text>
          <Ionicons name="arrow-forward" size={22} color={colors.primaryForeground} style={{ marginLeft: 8 }} />
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
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
  idleContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 24,
  },
  mainTitle: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  instructions: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    lineHeight: 26,
  },
  bottomSection: {
    paddingBottom: 16,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 18,
  },
  startButtonText: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
  timerRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  timerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
  },
  timerText: {
    fontSize: 52,
    fontFamily: 'Inter_700Bold',
    color: '#ef4444',
    letterSpacing: -1,
  },
  promptBox: {
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  promptText: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  stopIcon: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  stopButtonText: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    color: '#ffffff',
  },
  previewContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
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
  playerButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerHint: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  previewActions: {
    gap: 12,
    paddingBottom: 16,
  },
  reRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  reRecordText: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 18,
  },
  sendButtonText: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
});
