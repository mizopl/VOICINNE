export interface ColorPalette {
  text: string;
  tint: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
}

export interface ColorTokens extends ColorPalette {
  radius: number;
}

const light: ColorPalette = {
  text: "#0a0a0a",
  tint: "#00d4ff",
  background: "#f5f5f5",
  foreground: "#0a0a0a",
  card: "#ffffff",
  cardForeground: "#0a0a0a",
  primary: "#00b4d8",
  primaryForeground: "#ffffff",
  secondary: "#e8f8fb",
  secondaryForeground: "#0a0a0a",
  muted: "#e8e8e8",
  mutedForeground: "#6b7280",
  accent: "#0077b6",
  accentForeground: "#ffffff",
  destructive: "#ef4444",
  destructiveForeground: "#ffffff",
  border: "#e0e0e0",
  input: "#e0e0e0",
};

const dark: ColorPalette = {
  text: "#f0f0f0",
  tint: "#00d4ff",
  background: "#0a0a0a",
  foreground: "#f0f0f0",
  card: "#141414",
  cardForeground: "#f0f0f0",
  primary: "#00b4d8",
  primaryForeground: "#0a0a0a",
  secondary: "#1a1a1a",
  secondaryForeground: "#f0f0f0",
  muted: "#1a1a1a",
  mutedForeground: "#9ca3af",
  accent: "#0077b6",
  accentForeground: "#ffffff",
  destructive: "#ef4444",
  destructiveForeground: "#ffffff",
  border: "#262626",
  input: "#262626",
};

const colors = {
  light,
  dark,
  radius: 14,
} as const;

export default colors;
