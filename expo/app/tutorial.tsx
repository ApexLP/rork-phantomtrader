import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { TutorialContent } from '@/components/TutorialContent';
import { colors } from '@/constants/colors';

export default function TutorialScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'App Tutorial', headerBackTitle: 'Back' }} />
      <TutorialContent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
