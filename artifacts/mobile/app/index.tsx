import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
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
import { useColors } from '@/hooks/useColors';

const LANGUAGES: Language[] = ['ENG', 'POL', 'SPA', 'GER', 'FRA', 'ITA'];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [showLangPicker, setShowLangPicker] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad, paddingBottom: bottomPad }]}>
      <View style={styles.topSection}>
        <View style={[styles.iconRing, { borderColor: colors.primary }]}>
          <Ionicons name="mic" size={52} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>{t.appTitle}</Text>
        <Text style={[styles.tagline, { color: colors.foreground }]}>{t.appTagline}</Text>
        <Text style={[styles.description, { color: colors.mutedForeground }]}>{t.appDescription}</Text>
      </View>

      <View style={styles.middleSection}>
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: colors.primary }]}
          onPress={handleStart}
          activeOpacity={0.85}
          testID="start-simulation-button"
        >
          <Ionicons name="play-circle" size={32} color={colors.primaryForeground} style={{ marginRight: 12 }} />
          <Text style={[styles.startButtonText, { color: colors.primaryForeground }]}>
            {t.startButton}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.langButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setShowLangPicker(true)}
          activeOpacity={0.8}
          testID="language-selector-button"
        >
          <Ionicons name="globe-outline" size={22} color={colors.mutedForeground} style={{ marginRight: 10 }} />
          <Text style={[styles.langButtonText, { color: colors.foreground }]}>
            {LANGUAGE_LABELS[language]}
          </Text>
          <Ionicons name="chevron-down" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton, { borderColor: colors.border }]}
          onPress={handleTestSimulation}
          activeOpacity={0.7}
          testID="test-simulation-button"
        >
          <Ionicons name="flask-outline" size={18} color={colors.mutedForeground} style={{ marginRight: 8 }} />
          <Text style={[styles.testButtonText, { color: colors.mutedForeground }]}>
            Test Simulation (skip onboarding)
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSection}>
        <View style={[styles.warningBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="warning-outline" size={20} color={colors.mutedForeground} style={{ marginRight: 8, marginTop: 2 }} />
          <Text style={[styles.warningText, { color: colors.mutedForeground }]}>
            {t.aiDisclaimer}
          </Text>
        </View>
      </View>

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
                    lang === language && { backgroundColor: colors.primary + '22' },
                  ]}
                  onPress={() => handleSelectLanguage(lang)}
                  testID={`language-option-${lang}`}
                >
                  <Text style={[styles.langOptionText, { color: colors.foreground }, lang === language && { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
                    {LANGUAGE_LABELS[lang]}
                  </Text>
                  {lang === language && (
                    <Ionicons name="checkmark" size={22} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },
  topSection: {
    alignItems: 'center',
    paddingTop: 40,
    gap: 14,
  },
  iconRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 48,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 4,
  },
  middleSection: {
    gap: 14,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    paddingHorizontal: 32,
    borderRadius: 18,
  },
  startButtonText: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.3,
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
  },
  langButtonText: {
    flex: 1,
    fontSize: 17,
    fontFamily: 'Inter_500Medium',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  testButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  bottomSection: {
    paddingBottom: 16,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
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
