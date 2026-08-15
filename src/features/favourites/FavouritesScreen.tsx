import { View, Text, StyleSheet } from 'react-native';

export function FavouritesScreen() {
  return (
    <View style={styles.container}>
      <Text>Favourites Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});