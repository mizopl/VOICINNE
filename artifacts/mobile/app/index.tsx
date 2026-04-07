import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LANGUAGE_LABELS, Language, useLanguage } from '@/contexts/LanguageContext';
import { WaveformLine, buildFlatPoints, buildSinePoints } from '@/utils/waveform';

/* ── Constants ───────────────────────────────────────────────── */

const LANGUAGES: Language[] = ['ENG', 'POL', 'SPA', 'GER', 'FRA', 'ITA'];

const RED = '#ef4444';
const RED_DIM = '#7f1d1d';
const CARD = '#141414';
const BORDER = '#262626';
const FG = '#f0f0f0';
const MUTED = '#9ca3af';


/* ── Waveform dimensions ─────────────────────────────────────── */

const W = Dimensions.get('window').width;
const WAVE_H = 72;

/* ── Main screen ─────────────────────────────────────────────── */

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [showLangPicker, setShowLangPicker] = useState(false);

  const topPad = Platform.OS === 'web' ? 54 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 28 : insets.bottom;

  /* ── Waveform state ─────────────────────────────────────────── */
  const [wavePoints, setWavePoints] = useState(() => buildFlatPoints(W, WAVE_H));
  const phaseRef = useRef(0);
  const ampRef = useRef(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const waveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const webAudioCtxRef = useRef<AudioContext | null>(null);
  const webAnalyserRef = useRef<AnalyserNode | null>(null);
  const webStreamRef = useRef<MediaStream | null>(null);
  const webDataArrayRef = useRef<Uint8Array | null>(null);
  const [micActive, setMicActive] = useState(false);
  const [micDenied, setMicDenied] = useState(false);

  const stopWaveAnimation = useCallback(() => {
    if (waveIntervalRef.current) {
      clearInterval(waveIntervalRef.current);
      waveIntervalRef.current = null;
    }
    phaseRef.current = 0;
    ampRef.current = 0;
    setWavePoints(buildFlatPoints(W, WAVE_H));
  }, []);

  const stopMic = useCallback(async () => {
    // Stop expo-av recording (native)
    try { await recordingRef.current?.stopAndUnloadAsync(); } catch {}
    recordingRef.current = null;
    // Stop Web Audio API resources (web)
    try { webAnalyserRef.current?.disconnect(); } catch {}
    webAnalyserRef.current = null;
    webDataArrayRef.current = null;
    try { webAudioCtxRef.current?.close(); } catch {}
    webAudioCtxRef.current = null;
    try { webStreamRef.current?.getTracks().forEach(t => t.stop()); } catch {}
    webStreamRef.current = null;
    stopWaveAnimation();
    setMicActive(false);
  }, [stopWaveAnimation]);

  const startWaveLoop = useCallback(() => {
    waveIntervalRef.current = setInterval(() => {
      // On web: read live mic level from analyser each frame
      if (webAnalyserRef.current && webDataArrayRef.current) {
        webAnalyserRef.current.getByteTimeDomainData(webDataArrayRef.current);
        let max = 0;
        for (let i = 0; i < webDataArrayRef.current.length; i++) {
          max = Math.max(max, Math.abs(webDataArrayRef.current[i] - 128));
        }
        ampRef.current = 10 + (max / 128) * 38;
      }
      phaseRef.current += 0.05;
      setWavePoints(buildSinePoints(phaseRef.current, ampRef.current, W, WAVE_H));
    }, 33);
  }, []);

  const toggleMic = useCallback(async () => {
    if (micActive) {
      await stopMic();
      return;
    }
    try {
      if (Platform.OS === 'web') {
        // Web: use Web Audio API directly for real-time mic metering
        const stream = await (navigator.mediaDevices as MediaDevices).getUserMedia({ audio: true });
        webStreamRef.current = stream;
        const audioCtx = new AudioContext();
        webAudioCtxRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        webAnalyserRef.current = analyser;
        webDataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
        audioCtx.createMediaStreamSource(stream).connect(analyser);
        ampRef.current = 14;
        setMicDenied(false);
        setMicActive(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        startWaveLoop();
      } else {
        // Native: expo-av recording with metering
        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) { setMicDenied(true); return; }
        setMicDenied(false);
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const { recording } = await Audio.Recording.createAsync(
          { ...Audio.RecordingOptionsPresets.HIGH_QUALITY, isMeteringEnabled: true },
          (status) => {
            if (status.isRecording && status.metering != null) {
              const normalized = Math.max(0, Math.min(1, (status.metering + 60) / 60));
              ampRef.current = 10 + normalized * 32;
            }
          },
          80,
        );
        recordingRef.current = recording;
        ampRef.current = 14; // baseline before first metering event
        setMicActive(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        startWaveLoop();
      }
    } catch {
      setMicDenied(true);
    }
  }, [micActive, stopMic, startWaveLoop]);

  useEffect(() => () => { stopMic(); }, [stopMic]);

  /* ── Scam ticker ─────────────────────────────────────────────── */
  const [scamIdx, setScamIdx] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isPausedRef = useRef(false);
  const isAnimatingRef = useRef(false);

  const pauseTicker = useCallback(() => {
    isPausedRef.current = true;
    Animated.spring(scaleAnim, { toValue: 1.035, useNativeDriver: true, friction: 7, tension: 130 }).start();
  }, [scaleAnim]);

  const resumeTicker = useCallback(() => {
    isPausedRef.current = false;
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 7, tension: 130 }).start();
  }, [scaleAnim]);

  const advanceScam = useCallback((nextIdx?: number) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 480, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -12, duration: 480, useNativeDriver: true }),
    ]).start(() => {
      setScamIdx(prev => nextIdx !== undefined ? nextIdx : (prev + 1) % t.scams.length);
      slideAnim.setValue(14);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 560, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 560, useNativeDriver: true }),
      ]).start(() => { isAnimatingRef.current = false; });
    });
  }, [fadeAnim, slideAnim, t.scams.length]);

  useEffect(() => {
    isAnimatingRef.current = false;
    fadeAnim.setValue(1);
    slideAnim.setValue(0);
    setScamIdx(0);
  }, [t, fadeAnim, slideAnim]);

  useEffect(() => {
    const id = setInterval(() => {
      if (isPausedRef.current || isAnimatingRef.current) return;
      advanceScam();
    }, 7500);
    return () => clearInterval(id);
  }, [advanceScam]);

  const scam = t.scams[scamIdx] ?? t.scams[0];

  /* ── Navigation ─────────────────────────────────────────────── */
  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/onboarding');
  };

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    setShowLangPicker(false);
    Haptics.selectionAsync();
  };

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <ScrollView
      style={[styles.root, { backgroundColor: '#0a0a0a' }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad, paddingBottom: bottomPad + 8 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Ambient red glow */}
      <View style={styles.glowContainer}>
        <View style={[styles.glow, { shadowColor: RED }]} />
      </View>

      {/* ── Header ──────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={[styles.wordmark, { color: FG }]}>VOICINNE</Text>
        <TouchableOpacity
          style={[styles.langBtn, { backgroundColor: CARD, borderColor: BORDER }]}
          onPress={() => setShowLangPicker(true)}
          activeOpacity={0.75}
          testID="language-selector-button"
        >
          <Ionicons name="globe-outline" size={15} color={MUTED} />
          <Text style={[styles.langBtnText, { color: MUTED }]}>
            {LANGUAGE_LABELS[language]}
          </Text>
          <Ionicons name="chevron-down" size={13} color={MUTED} />
        </TouchableOpacity>
      </View>

      {/* ── Waveform ─────────────────────────────────────────────── */}
      <View style={styles.waveContainer}>
        <WaveformLine points={wavePoints} color={RED} width={W} height={WAVE_H} />
        {/* Mic toggle — overlaid bottom-right */}
        <TouchableOpacity
          style={[
            styles.micBtn,
            micActive ? { backgroundColor: RED } : { backgroundColor: CARD, borderColor: BORDER, borderWidth: 1 },
          ]}
          onPress={toggleMic}
          activeOpacity={0.8}
          testID="mic-toggle-button"
        >
          <Ionicons name={micActive ? 'mic' : 'mic-outline'} size={15} color={micActive ? '#fff' : MUTED} />
        </TouchableOpacity>
        {micDenied && (
          <Text style={styles.micDenied}>{t.micDenied}</Text>
        )}
      </View>

      {/* ── Stat ─────────────────────────────────────────────────── */}
      <View style={styles.statSection}>
        <View style={styles.statRow}>
          <Text style={styles.statNum}>15</Text>
          <Text style={styles.statUnit}>s</Text>
        </View>
        <Text style={[styles.slogan, { color: FG }]}>
          {t.homeSlogan}
        </Text>
      </View>

      {/* ── Explanation ──────────────────────────────────────────── */}
      <Text style={[styles.explanation, { color: MUTED }]}>
        {t.appDescription}
      </Text>

      {/* ── Scam Ticker ──────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.tickerCard,
          { backgroundColor: CARD, borderColor: BORDER, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Pressable
          onPressIn={pauseTicker}
          onPressOut={resumeTicker}
          {...({ onHoverIn: pauseTicker, onHoverOut: resumeTicker } as any)}
          style={{ flex: 1 }}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.tickerLabelRow}>
              <View style={styles.tickerDot} />
              <Text style={styles.tickerLabel}>{scam.label}</Text>
            </View>
            <Text style={[styles.tickerDesc, { color: MUTED }]}>
              {scam.desc}
            </Text>
          </Animated.View>
        </Pressable>
      </Animated.View>

      {/* Pagination dots */}
      <View style={styles.dotsRow}>
        {t.scams.map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => advanceScam(i)}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <View style={[styles.dot, i === scamIdx ? styles.dotActive : { backgroundColor: BORDER }]} />
          </TouchableOpacity>
        ))}
      </View>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.startBtn}
        onPress={handleStart}
        activeOpacity={0.85}
        testID="start-simulation-button"
      >
        <Text style={styles.startBtnText}>{t.startButton}</Text>
      </TouchableOpacity>

      {/* Educational disclaimer — warning card */}
      <View style={styles.warningCard}>
        <View style={styles.warningCardAccent} />
        <View style={styles.warningCardBody}>
          <View style={styles.warningCardHeader}>
            <Ionicons name="warning-outline" size={15} color="#f59e0b" />
            <Text style={styles.warningCardTitle}>IMPORTANT</Text>
          </View>
          <Text style={styles.warningCardText}>{t.consentText}</Text>
        </View>
      </View>

      {/* ── Language picker modal ─────────────────────────────────── */}
      <Modal
        visible={showLangPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLangPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowLangPicker(false)}>
          <Pressable style={[styles.modalSheet, { backgroundColor: CARD }]}>
            <Text style={[styles.modalTitle, { color: FG }]}>{t.selectLanguage}</Text>
            <ScrollView>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.langOption,
                    { borderBottomColor: BORDER },
                    lang === language && { backgroundColor: RED + '22' },
                  ]}
                  onPress={() => handleSelectLanguage(lang)}
                  testID={`language-option-${lang}`}
                >
                  <Text style={[
                    styles.langOptionText,
                    { color: FG },
                    lang === language && { color: RED, fontFamily: 'Inter_600SemiBold' },
                  ]}>
                    {LANGUAGE_LABELS[lang]}
                  </Text>
                  {lang === language && <Ionicons name="checkmark" size={22} color={RED} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

/* ── Styles ──────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    gap: 0,
  },

  /* Glow */
  glowContainer: {
    position: 'absolute',
    top: 160,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'none' as any,
  },
  glow: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 80,
    elevation: 0,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  wordmark: {
    fontSize: 22,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 6,
    fontWeight: '300',
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  langBtnText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 1,
  },

  /* Waveform */
  waveContainer: {
    width: W,
    height: WAVE_H,
    marginLeft: -24,
    marginBottom: 16,
  },
  micBtn: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micDenied: {
    position: 'absolute',
    bottom: 4,
    left: 28,
    fontSize: 9,
    color: RED,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.5,
  },

  /* Stat */
  statSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  statNum: {
    fontSize: 110,
    fontFamily: 'Inter_700Bold',
    color: RED,
    lineHeight: 110,
    letterSpacing: -4,
    textShadowColor: 'rgba(239,68,68,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 28,
  },
  statUnit: {
    fontSize: 50,
    fontFamily: 'Inter_700Bold',
    color: RED,
    lineHeight: 66,
    marginLeft: 4,
    letterSpacing: -1,
  },
  slogan: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 6,
  },

  /* Explanation */
  explanation: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },

  /* Ticker */
  tickerCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    minHeight: 78,
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  tickerLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 5,
  },
  tickerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: RED,
  },
  tickerLabel: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: RED,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  tickerDesc: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },

  /* Dots */
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
    marginBottom: 24,
    marginTop: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: RED,
    width: 18,
  },

  /* CTA */
  startBtn: {
    backgroundColor: RED,
    paddingVertical: 20,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  startBtnText: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
  },

  /* Warning card — educational disclaimer */
  warningCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.31)',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: 'rgba(245,158,11,0.05)',
  },
  warningCardAccent: {
    width: 4,
    backgroundColor: '#f59e0b',
  },
  warningCardBody: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 5,
  },
  warningCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  warningCardTitle: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.2,
    color: '#f59e0b',
  },
  warningCardText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
    color: '#9ca3af',
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  langOptionText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
});
