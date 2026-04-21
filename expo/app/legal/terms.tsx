import { Stack } from 'expo-router';
import LegalDocument from '@/components/LegalDocument';
import { TERMS_AND_CONDITIONS } from '@/constants/legal';

export default function TermsScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Terms & Conditions' }} />
      <LegalDocument content={TERMS_AND_CONDITIONS} />
    </>
  );
}
