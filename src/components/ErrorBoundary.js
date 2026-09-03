import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';
import { colors, spacing, typography } from '../constants/theme';

/**
 * Catches render-time crashes anywhere below and shows a friendly recovery
 * screen instead of a blank white screen. Never surfaces the raw stack.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    if (__DEV__) console.log('ErrorBoundary caught:', error, info);
  }
  reset = () => this.setState({ hasError: false });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={styles.wrap}>
        <Ionicons name="sad-outline" size={56} color={colors.textMuted} />
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.text}>The app hit an unexpected error. Please try again.</Text>
        <Button title="Reload" onPress={this.reset} fullWidth={false} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  title: { fontSize: typography.h2, fontWeight: typography.bold, color: colors.text, marginTop: spacing.lg },
  text: { fontSize: typography.body, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm, lineHeight: 22 },
});
