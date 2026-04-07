import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLanguage } from '@/contexts/LanguageContext';
import { cloneVoice, createAgent, generatePersona, transcribeAudio } from '@/utils/apiClient';
import { WaveformLine, buildFlatPoints, buildSinePoints } from '@/utils/waveform';

const RED = '#ef4444';
const MAX_SECONDS = 60;
const PROMPT_TRIGGER = 30;
const W = Dimensions.get('window').width;
const WAVE_H = 64;

const PROCESSING_STEPS = [
  'Uploading audio sample...',
  'Transcribing speech to text...',
  'Analyzing vocal timbre and pitch...',
  'Isolating linguistic fingerprint...',
  'Extracting relational context...',
  'Cloning acoustic model...',
  'Building deep fake persona...',
  'Configuring conversational AI agent...',
  'Finalizing neural bridge...',
  'Synchronizing voice identity...',
];

type Phase = 'idle' | 'recording' | 'preview' | 'processing';

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useLanguage();

  const [phase, setPhase] = useState<Phase>('idle');
  const [secondsLeft, setSecondsLeft] = useState(MAX_SECONDS);
  const [showPrompt, setShowPrompt] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [stepIndex, setStepIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const recordingRef = useRef<Audio.Recording | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const promptAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  /* ── Waveform state for recording phase ─────────────────────── */
  const [wavePoints, setWavePoints] = useState(() => buildFlatPoints(W, WAVE_H));
  const wavePhaseRef = useRef(0);
  const waveAmpRef = useRef(0);
  const waveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Web Audio API refs for mic metering on web
  const webAudioCtxRef = useRef<AudioContext | null>(null);
  const webAnalyserRef = useRef<AnalyserNode | null>(null);
  const webStreamRef = useRef<MediaStream | null>(null);
  const webDataArrayRef = useRef<Uint8Array | null>(null);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const stopWebAudio = useCallback(() => {
    try { webAnalyserRef.current?.disconnect(); } catch {}
    webAnalyserRef.current = null;
    webDataArrayRef.current = null;
    try { webAudioCtxRef.current?.close(); } catch {}
    webAudioCtxRef.current = null;
    try { webStreamRef.current?.getTracks().forEach(t => t.stop()); } catch {}
    webStreamRef.current = null;
  }, []);

  const stopWaveAnimation = useCallback(() => {
    if (waveIntervalRef.current) {
      clearInterval(waveIntervalRef.current);
      waveIntervalRef.current = null;
    }
    wavePhaseRef.current = 0;
    waveAmpRef.current = 0;
    stopWebAudio();
    setWavePoints(buildFlatPoints(W, WAVE_H));
  }, [stopWebAudio]);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
      if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
        recordingRef.current = null;
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      try { webAnalyserRef.current?.disconnect(); } catch {}
      try { webAudioCtxRef.current?.close(); } catch {}
      try { webStreamRef.current?.getTracks().forEach(t => t.stop()); } catch {}
    };
  }, []);

  const advanceStep = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setStepIndex((prev) => (prev + 1) % PROCESSING_STEPS.length);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    });
  }, [fadeAnim]);

  useEffect(() => {
    if (phase !== 'processing') {
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
        stepIntervalRef.current = null;
      }
      setStepIndex(0);
      fadeAnim.setValue(1);
      return;
    }
    stepIntervalRef.current = setInterval(advanceStep, 3000);
    return () => {
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
        stepIntervalRef.current = null;
      }
    };
  }, [phase, advanceStep, fadeAnim]);

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
    stopWaveAnimation();

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
        { ...Audio.RecordingOptionsPresets.HIGH_QUALITY, isMeteringEnabled: true },
        (st) => {
          if (st.isRecording && st.metering != null) {
            const normalized = Math.max(0, Math.min(1, (st.metering + 60) / 60));
            waveAmpRef.current = 8 + normalized * 28;
          }
        },
        80
      );
      recordingRef.current = recording;

      // Set baseline amplitude so the waveform starts moving immediately
      waveAmpRef.current = 14;

      // On web: additionally hook up a Web Audio API analyser for live mic metering
      if (Platform.OS === 'web') {
        try {
          const stream = await (navigator.mediaDevices as MediaDevices).getUserMedia({ audio: true });
          webStreamRef.current = stream;
          const audioCtx = new AudioContext();
          webAudioCtxRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          webAnalyserRef.current = analyser;
          webDataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
          audioCtx.createMediaStreamSource(stream).connect(analyser);
        } catch { /* metering won't update on web but baseline still animates */ }
      }

      setShowPrompt(false);
      promptAnim.setValue(0);
      setSecondsLeft(MAX_SECONDS);
      setPhase('recording');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      startPulse();

      waveIntervalRef.current = setInterval(() => {
        // On web: read live mic level from Web Audio API analyser each frame
        if (webAnalyserRef.current && webDataArrayRef.current) {
          webAnalyserRef.current.getByteTimeDomainData(webDataArrayRef.current);
          let max = 0;
          for (let i = 0; i < webDataArrayRef.current.length; i++) {
            max = Math.max(max, Math.abs(webDataArrayRef.current[i] - 128));
          }
          waveAmpRef.current = 10 + (max / 128) * 32;
        }
        wavePhaseRef.current += 0.05;
        setWavePoints(buildSinePoints(wavePhaseRef.current, waveAmpRef.current, W, WAVE_H));
      }, 33);

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
    stopWaveAnimation();
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
      const recordingDurationSeconds = Math.max(1, MAX_SECONDS - secondsLeft);
      const personaResult = await generatePersona(transcription, recordingDurationSeconds);
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

  /* ── PROCESSING PHASE ───────────────────────────────────────── */
  if (phase === 'processing') {
    return (
      <View
        style={[styles.container, styles.centered, {
          backgroundColor: '#0a0a0a',
          paddingTop: topPad,
          paddingBottom: bottomPad,
        }]}
        testID="processing-view"
      >
        <View style={styles.spinnerRing}>
          <ActivityIndicator size="large" color={RED} />
        </View>

        <View style={styles.processingTextBlock}>
          <Animated.Text
            style={[styles.processingStatus, { color: '#f0f0f0', opacity: fadeAnim }]}
          >
            {PROCESSING_STEPS[stepIndex]}
          </Animated.Text>
        </View>
      </View>
    );
  }

  /* ── IDLE PHASE ─────────────────────────────────────────────── */
  if (phase === 'idle') {
    return (
      <View style={[styles.container, { backgroundColor: '#0a0a0a', paddingTop: topPad, paddingBottom: bottomPad }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="back-button">
            <Ionicons name="chevron-back" size={28} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Flat waveform — idle state visual */}
        <View style={styles.idleWaveContainer}>
          <WaveformLine points={buildFlatPoints(W, WAVE_H)} color={RED} width={W} height={WAVE_H} />
        </View>

        <View style={styles.idleContent}>
          <View style={styles.idleTitleBlock}>
            <Text style={styles.mainTitle}>
              {t.recordingTitle}
            </Text>
            <Text style={styles.onboardingSubtitle}>
              {t.onboardingSubtitle}
            </Text>
          </View>

          <View style={styles.stepsContainer}>
            <View style={styles.stepRow}>
              <View style={styles.stepIconWrap}>
                <Ionicons name="mic-outline" size={22} color={RED} />
              </View>
              <View style={styles.stepText}>
                <Text style={styles.stepHeader}>
                  {'1. ' + t.step1Header}
                </Text>
                <Text style={styles.stepDesc}>
                  {t.step1Desc}
                </Text>
              </View>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepIconWrap}>
                <Ionicons name="chatbubbles-outline" size={22} color={RED} />
              </View>
              <View style={styles.stepText}>
                <Text style={styles.stepHeader}>
                  {'2. ' + t.step2Header}
                </Text>
                <Text style={styles.stepDesc}>
                  {t.step2Desc}
                </Text>
              </View>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepIconWrap}>
                <Ionicons name="color-wand-outline" size={22} color={RED} />
              </View>
              <View style={styles.stepText}>
                <Text style={styles.stepHeader}>
                  {'3. ' + t.step3Header}
                </Text>
                <Text style={styles.stepDesc}>
                  {t.step3Desc}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartRecording}
            activeOpacity={0.85}
            testID="start-recording-button"
          >
            <Ionicons name="mic" size={24} color="#ffffff" style={{ marginRight: 10 }} />
            <Text style={styles.startButtonText}>
              {t.startRecordingBtn}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ── RECORDING PHASE ────────────────────────────────────────── */
  if (phase === 'recording') {
    return (
      <View style={[styles.container, styles.centered, {
        backgroundColor: '#0a0a0a',
        paddingTop: topPad,
        paddingBottom: bottomPad,
      }]}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <View style={styles.timerRing}>
            <View style={styles.timerDot} />
            <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
          </View>
        </Animated.View>

        {/* Live waveform driven by mic metering */}
        <View style={styles.waveContainer}>
          <WaveformLine points={wavePoints} color={RED} width={W} height={WAVE_H} />
        </View>

        <Animated.View
          style={[
            styles.promptBox,
            {
              opacity: promptAnim,
              transform: [{ scale: promptAnim }],
            },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.promptText}>
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

  /* ── PREVIEW PHASE ──────────────────────────────────────────── */
  return (
    <View style={[styles.container, { backgroundColor: '#0a0a0a', paddingTop: topPad, paddingBottom: bottomPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleReRecord} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <View style={styles.previewContent}>
        <View style={styles.recordedBadge}>
          <Ionicons name="checkmark-circle" size={18} color={RED} style={{ marginRight: 6 }} />
          <Text style={styles.recordedText}>{t.recorded}</Text>
        </View>

        <TouchableOpacity
          style={styles.playerButton}
          onPress={handlePlayPause}
          activeOpacity={0.8}
          testID="play-pause-button"
        >
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={52} color={RED} />
        </TouchableOpacity>

        <Text style={styles.playerHint}>
          {isPlaying ? t.recording : t.listenBack}
        </Text>
      </View>

      <View style={styles.previewActions}>
        <TouchableOpacity
          style={styles.reRecordButton}
          onPress={handleReRecord}
          activeOpacity={0.85}
          testID="re-record-button"
        >
          <Ionicons name="refresh" size={20} color="#9ca3af" style={{ marginRight: 8 }} />
          <Text style={styles.reRecordText}>{t.reRecord}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sendButton}
          onPress={runProcessingPipeline}
          activeOpacity={0.85}
          testID="send-for-cloning-button"
        >
          <Text style={styles.sendButtonText}>{t.sendForCloning}</Text>
          <Ionicons name="arrow-forward" size={22} color="#ffffff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ── Styles ──────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 28,
  },
  spinnerRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: RED + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingTextBlock: {
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 32,
  },
  processingStatus: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    lineHeight: 26,
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
  idleWaveContainer: {
    width: W,
    height: WAVE_H,
    marginLeft: -24,
    marginBottom: 8,
  },
  idleContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 28,
    paddingVertical: 16,
  },
  idleTitleBlock: {
    gap: 8,
  },
  mainTitle: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    lineHeight: 36,
    letterSpacing: -0.5,
    color: '#f0f0f0',
  },
  onboardingSubtitle: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
    color: '#9ca3af',
  },
  stepsContainer: {
    gap: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    backgroundColor: '#141414',
    borderColor: '#242424',
  },
  stepIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: RED + '22',
  },
  stepText: {
    flex: 1,
    gap: 4,
  },
  stepHeader: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    lineHeight: 22,
    color: '#f0f0f0',
  },
  stepDesc: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 28,
    color: '#d1d5db',
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
    backgroundColor: RED,
    shadowColor: RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  startButtonText: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
  },

  /* Timer ring */
  timerRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: RED,
    backgroundColor: 'rgba(239,68,68,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  timerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: RED,
  },
  timerText: {
    fontSize: 52,
    fontFamily: 'Inter_700Bold',
    color: RED,
    letterSpacing: -1,
  },

  /* Waveform in recording phase */
  waveContainer: {
    width: W,
    height: WAVE_H,
    alignItems: 'center',
  },

  /* Prompt overlay */
  promptBox: {
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 28,
    alignItems: 'center',
    borderColor: RED,
    backgroundColor: RED + '1A',
  },
  promptText: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    letterSpacing: -0.3,
    color: RED,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: RED,
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

  /* Preview */
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
    backgroundColor: RED + '22',
    borderColor: RED + '55',
  },
  recordedText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: RED,
  },
  playerButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: RED + '18',
    borderWidth: 2,
    borderColor: RED + '55',
  },
  playerHint: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#9ca3af',
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
    borderColor: '#262626',
  },
  reRecordText: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    color: '#9ca3af',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 18,
    backgroundColor: RED,
    shadowColor: RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  sendButtonText: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
  },
});
