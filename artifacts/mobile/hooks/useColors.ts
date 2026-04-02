import { useColorScheme } from "react-native";

import colors, { ColorTokens } from "@/constants/colors";

/**
 * Returns the design tokens for the current color scheme.
 *
 * The returned object contains all color tokens for the active palette
 * plus scheme-independent values like `radius`.
 *
 * Falls back to the light palette when dark mode is not active.
 * When dark mode is active, uses the dark palette from constants/colors.ts.
 */
export function useColors(): ColorTokens {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius };
}
