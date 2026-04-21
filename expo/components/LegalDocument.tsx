import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

interface LegalDocumentProps {
  content: string;
}

export default function LegalDocument({ content }: LegalDocumentProps) {
  const sections = content.split('\n\n');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {sections.map((section, index) => {
        const trimmed = section.trim();
        if (!trimmed) return null;

        const isTitle = index === 0;
        const isHeading = /^\d+\./.test(trimmed) && !trimmed.includes('\n');
        const isSubHeading = /^\([A-Z]\)/.test(trimmed);

        if (isTitle) {
          const lines = trimmed.split('\n');
          return (
            <View key={index} style={styles.titleBlock}>
              <Text style={styles.title}>{lines[0]}</Text>
              {lines[1] && <Text style={styles.effectiveDate}>{lines[1]}</Text>}
            </View>
          );
        }

        if (isHeading) {
          return (
            <Text key={index} style={styles.heading}>{trimmed}</Text>
          );
        }

        if (isSubHeading) {
          return (
            <Text key={index} style={styles.subHeading}>{trimmed}</Text>
          );
        }

        const lines = trimmed.split('\n');
        return (
          <View key={index} style={styles.paragraph}>
            {lines.map((line, lineIndex) => {
              const isBullet = line.startsWith('•');
              if (isBullet) {
                return (
                  <View key={lineIndex} style={styles.bulletRow}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>{line.replace('• ', '')}</Text>
                  </View>
                );
              }
              return (
                <Text key={lineIndex} style={styles.bodyText}>{line}</Text>
              );
            })}
          </View>
        );
      })}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 20,
  },
  titleBlock: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: 6,
  },
  effectiveDate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  heading: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  subHeading: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
    marginTop: 12,
    marginBottom: 6,
  },
  paragraph: {
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 8,
    marginBottom: 6,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary,
    marginTop: 8,
    marginRight: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  bottomSpacer: {
    height: 40,
  },
});
