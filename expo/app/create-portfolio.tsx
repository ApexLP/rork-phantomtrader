import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { DollarSign, Briefcase, X } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { usePortfolios } from '@/contexts/PortfolioContext';

const PRESET_AMOUNTS = [10000, 25000, 50000, 100000];

export default function CreatePortfolioScreen() {
  const router = useRouter();
  const { createPortfolio } = usePortfolios();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('10000');
  const [error, setError] = useState<string | null>(null);

  const handleCreate = () => {
    const trimmedName = name.trim();
    const numericAmount = parseFloat(amount.replace(/,/g, ''));

    if (!trimmedName) {
      setError('Please enter a portfolio name');
      return;
    }

    if (isNaN(numericAmount) || numericAmount < 100) {
      setError('Please enter a valid amount (min $100)');
      return;
    }

    if (numericAmount > 10000000) {
      setError('Maximum starting balance is $10,000,000');
      return;
    }

    createPortfolio(trimmedName, numericAmount);
    router.back();
  };

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    setAmount(cleaned);
    setError(null);
  };

  const formatDisplayAmount = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    return num.toLocaleString('en-US');
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.iconContainer}>
            <View style={styles.icon}>
              <Briefcase size={40} color={colors.primary} />
            </View>
          </View>

          <Text style={styles.title}>Create New Portfolio</Text>
          <Text style={styles.subtitle}>Start trading with simulated money</Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Portfolio Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setError(null);
                }}
                placeholder="e.g., Tech Growth"
                placeholderTextColor={colors.textMuted}
                maxLength={30}
                testID="portfolio-name-input"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Starting Balance</Text>
              <View style={styles.amountInputWrapper}>
                <DollarSign size={20} color={colors.textMuted} style={styles.dollarIcon} />
                <TextInput
                  style={styles.amountInput}
                  value={formatDisplayAmount(amount)}
                  onChangeText={handleAmountChange}
                  placeholder="10,000"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  testID="portfolio-amount-input"
                />
              </View>
            </View>

            <View style={styles.presetsContainer}>
              <Text style={styles.presetsLabel}>Quick select:</Text>
              <View style={styles.presets}>
                {PRESET_AMOUNTS.map((preset) => (
                  <TouchableOpacity
                    key={preset}
                    style={[
                      styles.presetButton,
                      parseFloat(amount) === preset && styles.presetButtonActive
                    ]}
                    onPress={() => setAmount(preset.toString())}
                  >
                    <Text style={[
                      styles.presetText,
                      parseFloat(amount) === preset && styles.presetTextActive
                    ]}>
                      ${(preset / 1000).toFixed(0)}K
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreate}
              testID="create-portfolio-button"
            >
              <Text style={styles.createButtonText}>Create Portfolio</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '30',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dollarIcon: {
    marginLeft: 16,
  },
  amountInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  presetsContainer: {
    marginBottom: 24,
  },
  presetsLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 12,
  },
  presets: {
    flexDirection: 'row',
    gap: 10,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  presetButtonActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  presetText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  presetTextActive: {
    color: colors.primary,
  },
  errorContainer: {
    backgroundColor: colors.negative + '20',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.negative,
    fontSize: 14,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 'auto',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  createButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.background,
  },
});
