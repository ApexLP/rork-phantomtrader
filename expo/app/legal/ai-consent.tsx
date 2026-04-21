import { Stack } from 'expo-router';
import LegalDocument from '@/components/LegalDocument';
import { AI_DATA_CONSENT } from '@/constants/legal';

export default function AiConsentScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'AI Data Consent' }} />
      <LegalDocument content={AI_DATA_CONSENT} />
    </>
  );
}
