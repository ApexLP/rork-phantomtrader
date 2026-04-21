import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PortfolioProvider } from '@/contexts/PortfolioContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthGate } from '@/components/AuthGate';
import { colors } from '@/constants/colors';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="light" />
        <AuthGate>
          <PortfolioProvider>
            <RootLayoutNav />
          </PortfolioProvider>
        </AuthGate>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          shadowColor: '#00E5FF',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 4,
        },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' as const },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="create-portfolio" 
        options={{ 
          presentation: 'modal',
          title: 'New Portfolio',
        }} 
      />
      <Stack.Screen 
        name="portfolio/[id]" 
        options={{ 
          title: 'Portfolio',
        }} 
      />
      <Stack.Screen 
        name="stock/[symbol]" 
        options={{ 
          title: 'Trade',
        }} 
      />
      <Stack.Screen 
        name="legal/terms" 
        options={{ title: 'Terms & Conditions' }} 
      />
      <Stack.Screen 
        name="legal/privacy" 
        options={{ title: 'Privacy Policy' }} 
      />
      <Stack.Screen 
        name="legal/eula" 
        options={{ title: 'EULA' }} 
      />
      <Stack.Screen 
        name="legal/ai-consent" 
        options={{ title: 'AI Data Consent' }} 
      />
      <Stack.Screen 
        name="group/[id]" 
        options={{ 
          title: 'Group',
        }} 
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
