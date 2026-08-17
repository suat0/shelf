import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { login } from 'src/features/auth/authApi';
import { useAuth } from 'src/features/auth/useAuth';
import { ApiError } from 'src/lib/api/errors';
import { analytics } from 'src/lib/telemetry';

export function LoginScreen() {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = username.trim().length > 0 && password.length > 0 && !isSubmitting;

  async function handleSubmit() {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await login(username.trim(), password);
      await signIn({
        username: result.username,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
      analytics.logEvent('login_succeeded');
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        setErrorMessage('Wrong username or password');
      } else {
        setErrorMessage('Something went wrong. Try again.');
      }
      analytics.logEvent('login_failed');
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Shelf
      </Text>
      <TextInput
        mode="outlined"
        label="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        disabled={isSubmitting}
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        disabled={isSubmitting}
        style={styles.input}
      />
      {errorMessage && (
        <HelperText type="error" visible>
          {errorMessage}
        </HelperText>
      )}
      <Button mode="contained" onPress={handleSubmit} disabled={!canSubmit} loading={isSubmitting}>
        Sign in
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { marginBottom: 24, textAlign: 'center' },
  input: { marginBottom: 12 },
});