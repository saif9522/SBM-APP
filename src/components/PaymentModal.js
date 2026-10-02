import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Modal, Pressable, StyleSheet, ActivityIndicator, Linking, AppState, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../constants/theme';
import { SITE_BASE_URL, paymentUrl } from '../constants/config';
import { paymentStatus, waitForPaid } from '../api/paymentApi';
import { launchTargetFor } from '../utils/upiLinks';

/**
 * In-app Razorpay checkout (the site's /pay/<kind>/<id>/ page in a WebView).
 *
 * WHAT WAS WRONG
 * --------------
 * The modal guessed "done" from the URL the WebView landed on, and nothing
 * ever asked the server whether money actually arrived. When the user paid
 * in GPay/PhonePe (or tapped "Open in browser") the checkout callback often
 * never made it back, so the server never recorded the payment — the user
 * had Razorpay's receipt email but the app still showed "Pay".
 *
 * NOW
 * ---
 *  - Whenever the sheet closes — Done page, ✕ button, Android back — we
 *    ask the server (/api/payments/status/). The server checks with
 *    Razorpay and records the payment if it went through.
 *  - When the user returns from GPay / PhonePe / Chrome, we check again
 *    automatically and close the sheet as soon as the payment is confirmed.
 *  - `/payment/verify/` is never intercepted (on iOS that silently blocked
 *    the POST that records the payment).
 *
 * Props: visible, kind, refId, url? (defaults to paymentUrl(kind, refId)),
 *        onClose(paid: boolean)
 */
const HTTP = /^https?:\/\//i;
const MOBILE_UA =
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36';

export default function PaymentModal({ visible, url, kind, refId, onClose }) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const closingRef = useRef(false);
  const webRef = useRef(null);
  const src = url || (kind && refId ? paymentUrl(kind, refId) : null);
  const canVerify = !!(kind && refId);

  useEffect(() => { if (visible) closingRef.current = false; }, [visible]);

  // Close the sheet, but only after asking the server what really happened.
  const finish = useCallback(async ({ poll = false } = {}) => {
    if (closingRef.current) return;
    closingRef.current = true;
    if (!canVerify) { onClose?.(false); return; }
    setChecking(true);
    let paid = false;
    try {
      paid = poll
        ? (await waitForPaid(kind, refId)).paid
        : !!(await paymentStatus(kind, refId))?.paid;
    } catch { paid = false; }
    setChecking(false);
    onClose?.(paid);
  }, [canVerify, kind, refId, onClose]);

  // Back from GPay / PhonePe / Chrome → quietly check; close if paid.
  useEffect(() => {
    if (!visible || !canVerify) return undefined;
    const sub = AppState.addEventListener('change', async (st) => {
      if (st !== 'active' || closingRef.current) return;
      try {
        const s = await waitForPaid(kind, refId, { tries: 3, delayMs: 2000 });
        if (s.paid && !closingRef.current) {
          closingRef.current = true;
          onClose?.(true);
        }
      } catch { /* stay open; user can still close manually */ }
    });
    return () => sub.remove();
  }, [visible, canVerify, kind, refId, onClose]);

  // A site page that is not the pay flow itself = checkout finished.
  const isDone = (u = '') => u.startsWith(SITE_BASE_URL)
    && !u.includes('/pay/') && !u.includes('/payment/');

  /**
   * Launch a UPI / payment-app link outside the WebView.
   *
   * Razorpay gives Chrome-style `intent://…#Intent;scheme=upi;…;end` links.
   * Linking.openURL can't open those (see utils/upiLinks.js) — the old code
   * swallowed that failure, so tapping GPay/PhonePe in the app did NOTHING.
   * Now: convert to the real upi:// link → if that specific app is missing,
   * fall back to the generic upi:// chooser → then Razorpay's own fallback
   * page → and finally tell the user what to do instead of failing silently.
   */
  const openExternal = async (raw) => {
    const { url, fallback } = launchTargetFor(raw);
    try { await Linking.openURL(url); return; } catch { /* try next */ }

    const q = url.indexOf('?');
    if (q > 0 && !/^upi:/i.test(url)) {
      try { await Linking.openURL(`upi://pay${url.slice(q)}`); return; } catch { /* try next */ }
    }
    if (fallback && HTTP.test(fallback)) {
      webRef.current?.injectJavaScript(`window.location.href=${JSON.stringify(fallback)};true;`);
      return;
    }
    Alert.alert(
      'UPI app nahi khula',
      'Is phone par ye UPI app nahi mila. Razorpay page par “UPI ID” daal kar pay karein '
      + '(phir apne UPI app me request approve karein), ya Card / Net Banking chunein. '
      + 'Upar ↗ dabakar browser me bhi khol sakte hain.',
    );
  };

  const onShouldStart = (reqUrl) => {
    const u = reqUrl || '';
    if (HTTP.test(u) || u.startsWith('about:') || u.startsWith('data:') || u.startsWith('blob:')) {
      if (isDone(u)) { finish({ poll: true }); return false; }
      return true;
    }
    // upi:, intent:, tez:, phonepe:, paytmmp:, gpay:, bhim:, credpay:, tel:, mailto: …
    openExternal(u);
    return false;
  };

  const openInBrowser = () => { if (src) Linking.openURL(src).catch(() => {}); };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={() => finish()}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => finish()} hitSlop={12} style={styles.close} accessibilityLabel="Close payment">
          <Ionicons name="close" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.title}>Secure Payment</Text>
        <Pressable onPress={openInBrowser} hitSlop={12} style={styles.browser} accessibilityLabel="Open in browser">
          <Ionicons name="open-outline" size={20} color="#fff" />
        </Pressable>
      </View>

      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        {src ? (
          <WebView
            ref={webRef}
            source={{ uri: src }}
            userAgent={MOBILE_UA}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
            thirdPartyCookiesEnabled
            sharedCookiesEnabled
            javaScriptCanOpenWindowsAutomatically
            setSupportMultipleWindows={false}
            startInLoadingState
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onShouldStartLoadWithRequest={(req) => onShouldStart(req.url)}
            onNavigationStateChange={(s) => { if (isDone(s?.url)) finish({ poll: true }); }}
          />
        ) : null}
        {loading || checking ? (
          <View style={styles.loader} pointerEvents="none">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadText}>
              {checking ? 'Confirming your payment with Razorpay…' : 'Loading secure payment…'}
            </Text>
          </View>
        ) : null}
      </View>

      <Pressable style={[styles.footer, { paddingBottom: insets.bottom + spacing.sm }]} onPress={openInBrowser}>
        <Ionicons name="phone-portrait-outline" size={14} color={colors.primary} />
        <Text style={styles.footText}>UPI (PhonePe / GPay / Paytm) not showing? Tap to pay in browser</Text>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingBottom: spacing.md, backgroundColor: colors.primary,
  },
  close: { width: 24, alignItems: 'flex-start' },
  browser: { width: 24, alignItems: 'flex-end' },
  title: { color: '#fff', fontSize: typography.body, fontWeight: typography.semibold },
  loader: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.94)' },
  loadText: { marginTop: spacing.md, color: colors.textMuted, fontSize: typography.small, textAlign: 'center', paddingHorizontal: spacing.xl },
  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingTop: spacing.md, paddingHorizontal: spacing.lg, backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border,
  },
  footText: { marginLeft: 6, fontSize: typography.tiny, color: colors.primary, fontWeight: typography.medium },
});
