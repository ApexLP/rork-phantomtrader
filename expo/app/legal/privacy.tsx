import { Stack } from 'expo-router';
import LegalDocument from '@/components/LegalDocument';
import { PRIVACY_POLICY } from '@/constants/legal';

export default function PrivacyScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Privacy Policy' }} />
      <LegalDocument content={PRIVACY_POLICY} />
    </>
  );
}
