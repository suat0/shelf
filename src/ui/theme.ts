import { MD3LightTheme } from 'react-native-paper';
import { DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import type { Theme as NavigationTheme } from '@react-navigation/native';

export const paperTheme = {
  ...MD3LightTheme,
};

// React Navigation renders its own header/tab bar chrome and doesn't read
// Paper's theme, so without this the header stays on RN Navigation's default
// blue instead of matching the rest of the app.
export const navigationTheme: NavigationTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: paperTheme.colors.primary,
    background: paperTheme.colors.background,
    card: paperTheme.colors.surface,
    text: paperTheme.colors.onSurface,
    border: paperTheme.colors.outlineVariant,
    notification: paperTheme.colors.error,
  },
};
