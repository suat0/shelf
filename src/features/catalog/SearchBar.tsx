import { TextInput, StyleSheet } from 'react-native';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
};

export function SearchBar({ value, onChangeText }: SearchBarProps) {
  return (
    <TextInput
      style={styles.input}
      placeholder="Search products"
      value={value}
      onChangeText={onChangeText}
      autoCapitalize="none"
      clearButtonMode="while-editing"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    margin: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
});
