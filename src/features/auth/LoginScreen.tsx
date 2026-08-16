import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
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
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        editable={!isSubmitting}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isSubmitting}
      />
      {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
      <Pressable style={styles.button} onPress={handleSubmit} disabled={!canSubmit}>
        {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 },
  error: { color: '#d00' },
  button: { backgroundColor: '#111', borderRadius: 8, padding: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
});