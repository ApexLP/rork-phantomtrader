import { Stack } from 'expo-router';
import LegalDocument from '@/components/LegalDocument';
import { EULA } from '@/constants/legal';

export default function EulaScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'EULA' }} />
      <LegalDocument content={EULA} />
    </>
  );
}
