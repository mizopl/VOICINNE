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
import Svg, { Polyline } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LANGUAGE_LABELS, Language, useLanguage } from '@/contexts/LanguageContext';
import { useColors } from '@/hooks/useColors';

/* ── Constants ───────────────────────────────────────────────── */

const LANGUAGES: Language[] = ['ENG', 'POL', 'SPA', 'GER', 'FRA', 'ITA'];

const RED = '#ef4444';
const RED_DIM = '#7f1d1d';

const SCAMS = [
  { label: 'Fake Kidnapping', desc: "Scammers clone a child's voice to call parents demanding ransom — from a 15-second clip." },
  { label: 'CEO Fraud', desc: "AI mimics your boss's voice, authorising an urgent six-figure wire transfer." },
  { label: 'Voice ID Bypass', desc: 'Synthetic voices defeat bank voice-authentication systems, draining accounts silently.' },
  { label: 'Grandparent Scam', desc: 'Elderly relatives get a call — your voice, your words — begging for emergency cash.' },
  { label: 'Romance Manipulation', desc: 'Cloned voices sustain fake relationships across months, extracting money and secrets.' },
  { label: 'Information Extraction', desc: 'AI impersonates family members to trick you into sharing passwords or personal data.' },
];

/* ── Waveform helpers ────────────────────────────────────────── */

const W = Dimensions.get('window').width;
const WAVE_H = 72;
const MID = WAVE_H / 2;
const N = 180;

function buildPoints(phase: number, amp: number): string {
  return Array.from({ length: N }, (_, i) => {
    const x = (i / (N - 1)) * W;
    const t = (i / N) * Math.PI * 10;
    const y =
      MID +
      Math.sin(t + phase) * amp * 0.55 +
      Math.sin(t * 1.8 + phase * 0.8) * amp * 0.28 +
      Math.sin(t * 3.5 + phase * 1.3) * amp * 0.12;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

/* ── Waveform component (isolated to avoid full-screen re-renders) */
const WaveformLine = React.memo(({ points }: { points: string }) => (
  <Svg width={W} height={WAVE_H}>
    <Polyline
      points={points}
      stroke={RED}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
));

/* ── Main screen ─────────────────────────────────────────────── */

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [showLangPicker, setShowLangPicker] = useState(false);

  const topPad = Platform.OS === 'web' ? 54 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 28 : insets.bottom;

  /* ── Waveform state ─────────────────────────────────────────── */
  const [wavePoints, setWavePoints] = useState(() => buildPoints(0, 10));
  const phaseRef = useRef(0);
  const ampRef = useRef(10);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [micActive, setMicActive] = useState(false);
  const [micDenied, setMicDenied] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      phaseRef.current += 0.05;
      setWavePoints(buildPoints(phaseRef.current, ampRef.current));
    }, 33);
    return () => clearInterval(id);
  }, []);

  const stopMic = useCallback(async () => {
    try {
      await recordingRef.current?.stopAndUnloadAsync();
    } catch {}
    recordingRef.current = null;
    ampRef.current = 10;
    setMicActive(false);
  }, []);

  const toggleMic = useCallback(async () => {
    if (micActive) {
      await stopMic();
      return;
    }
    try {
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
      setMicActive(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      setMicDenied(true);
    }
  }, [micActive, stopMic]);

  useEffect(() => () => { stopMic(); }, [stopMic]);

  /* ── Scam ticker ─────────────────────────────────────────────── */
  const [scamIdx, setScamIdx] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const id = setInterval(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 380, useNativeDriver: true }).start(() => {
        setScamIdx(i => (i + 1) % SCAMS.length);
        Animated.timing(fadeAnim, { toValue: 1, duration: 420, useNativeDriver: true }).start();
      });
    }, 4200);
    return () => clearInterval(id);
  }, [fadeAnim]);

  const scam = SCAMS[scamIdx];

  /* ── Navigation ─────────────────────────────────────────────── */
  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/onboarding');
  };

  const handleTestSimulation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/simulation',
      params: { agentId: 'agent_9801knkb7cbtfpk8pvfe3stexj99', revealMessage: '' },
    });
  };

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    setShowLangPicker(false);
    Haptics.selectionAsync();
  };

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad, paddingBottom: bottomPad + 8 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Ambient red glow */}
      <View style={styles.glowContainer}>
        <View style={[styles.glow, { shadowColor: RED }]} />
      </View>

      {/* ── Header ──────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={[styles.wordmark, { color: colors.foreground }]}>VOICINNE</Text>
        <TouchableOpacity
          style={[styles.langBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setShowLangPicker(true)}
          activeOpacity={0.75}
          testID="language-selector-button"
        >
          <Ionicons name="globe-outline" size={15} color={colors.mutedForeground} />
          <Text style={[styles.langBtnText, { color: colors.mutedForeground }]}>
            {LANGUAGE_LABELS[language]}
          </Text>
          <Ionicons name="chevron-down" size={13} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      {/* ── Waveform ─────────────────────────────────────────────── */}
      <View style={styles.waveContainer}>
        <WaveformLine points={wavePoints} />
        {/* Mic toggle — overlaid bottom-right */}
        <TouchableOpacity
          style={[
            styles.micBtn,
            micActive ? { backgroundColor: RED } : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
          ]}
          onPress={toggleMic}
          activeOpacity={0.8}
          testID="mic-toggle-button"
        >
          <Ionicons name={micActive ? 'mic' : 'mic-outline'} size={15} color={micActive ? '#fff' : colors.mutedForeground} />
        </TouchableOpacity>
        {micDenied && (
          <Text style={styles.micDenied}>Mic access denied</Text>
        )}
      </View>

      {/* ── Stat ─────────────────────────────────────────────────── */}
      <View style={styles.statSection}>
        <View style={styles.statRow}>
          <Text style={styles.statNum}>15</Text>
          <Text style={styles.statUnit}>s</Text>
        </View>
        <Text style={[styles.slogan, { color: colors.foreground }]}>
          That's all AI needs to clone your voice.
        </Text>
      </View>

      {/* ── Explanation ──────────────────────────────────────────── */}
      <Text style={[styles.explanation, { color: colors.mutedForeground }]}>
        We'll clone your voice from a 60-second recording, then use it to call one of
        your closest ones — so they hear, firsthand, how convincingly AI can impersonate
        someone they trust.
      </Text>

      {/* ── Scam Ticker ──────────────────────────────────────────── */}
      <View style={[styles.tickerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.tickerLabelRow}>
            <View style={styles.tickerDot} />
            <Text style={styles.tickerLabel}>{scam.label}</Text>
          </View>
          <Text style={[styles.tickerDesc, { color: colors.mutedForeground }]}>
            {scam.desc}
          </Text>
        </Animated.View>
      </View>

      {/* Pagination dots */}
      <View style={styles.dotsRow}>
        {SCAMS.map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              Animated.sequence([
                Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
              ]).start(() => {
                setScamIdx(i);
                Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
              });
            }}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <View style={[styles.dot, i === scamIdx ? styles.dotActive : { backgroundColor: colors.border }]} />
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

      {/* Consent */}
      <Text style={[styles.consent, { color: colors.mutedForeground }]}>
        By continuing you consent to record a 60s voice sample.{'\n'}Audio is never stored or shared beyond this session.
      </Text>

      {/* Dev — test simulation shortcut */}
      <TouchableOpacity
        style={[styles.testBtn, { borderColor: colors.border }]}
        onPress={handleTestSimulation}
        activeOpacity={0.7}
        testID="test-simulation-button"
      >
        <Ionicons name="flask-outline" size={16} color={colors.mutedForeground} style={{ marginRight: 6 }} />
        <Text style={[styles.testBtnText, { color: colors.mutedForeground }]}>
          Test Simulation (skip onboarding)
        </Text>
      </TouchableOpacity>

      {/* ── Language picker modal ─────────────────────────────────── */}
      <Modal
        visible={showLangPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLangPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowLangPicker(false)}>
          <Pressable style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>{t.selectLanguage}</Text>
            <ScrollView>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.langOption,
                    { borderBottomColor: colors.border },
                    lang === language && { backgroundColor: RED + '22' },
                  ]}
                  onPress={() => handleSelectLanguage(lang)}
                  testID={`language-option-${lang}`}
                >
                  <Text style={[
                    styles.langOptionText,
                    { color: colors.foreground },
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
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
    paddingLeft: 13,
  },

  /* Dots */
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 24,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 16,
    height: 6,
    borderRadius: 3,
    backgroundColor: RED,
  },

  /* CTA */
  startBtn: {
    backgroundColor: RED,
    paddingVertical: 20,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  startBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  /* Consent */
  consent: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 15,
    letterSpacing: 0.3,
    marginBottom: 16,
  },

  /* Test button */
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  testBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  langOptionText: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Inter_400Regular',
  },
});
