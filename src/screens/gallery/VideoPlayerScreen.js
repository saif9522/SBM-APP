import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Linking, ActivityIndicator, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { Screen, Header, Button } from '../../components';
import { colors, spacing, typography } from '../../constants/theme';
import { SITE_BASE_URL } from '../../constants/config';
import { mediaUrl, formatDate } from '../../utils/format';

const { width } = Dimensions.get('window');
const PLAYER_H = Math.round(width * 9 / 16);

/**
 * VIDEO — kya theek kiya
 * ----------------------
 * Player `expo-av` par tha, jo is app me install hi nahi hai (aur Expo SDK
 * 57 me hat chuka hai). Isliye har video par "Video player not available"
 * aata tha. `react-native-webview` pehle se app me hai (Payment isi se
 * chalta hai), to video ab usi me HTML5 player se chalti hai — koi nayi
 * native library nahi, naya build nahi.
 *
 * MP4/WEBM upload aur YouTube link — dono chalte hain.
 */
const esc = (s) => String(s || '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function youTubeId(url) {
  const m = String(url || '').match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}

function playerHtml(src, poster) {
  const yt = youTubeId(src);
  const body = yt
    ? `<iframe src="https://www.youtube.com/embed/${esc(yt)}?playsinline=1&autoplay=1&rel=0"
         allow="autoplay; encrypted-media; fullscreen" allowfullscreen frameborder="0"></iframe>`
    : `<video src="${esc(src)}" ${poster ? `poster="${esc(poster)}"` : ''}
         controls autoplay playsinline preload="metadata"
         onerror="window.ReactNativeWebView.postMessage('error')"></video>`;
  return `<!doctype html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<style>html,body{margin:0;height:100%;background:#000}
video,iframe{width:100%;height:100%;display:block;background:#000;border:0;object-fit:contain}</style>
</head><body>${body}</body></html>`;
}

export default function VideoPlayerScreen({ route }) {
  const { item } = route.params || {};
  const src = mediaUrl(item?.video || item?.video_url);
  const poster = mediaUrl(item?.image);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  const html = useMemo(() => (src ? playerHtml(src, poster) : null), [src, poster]);

  return (
    <Screen edges={['bottom']}>
      <Header title={item?.title || 'Video'} />
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <View style={styles.player}>
          {html && !failed ? (
            <>
              <WebView
                source={{ html, baseUrl: SITE_BASE_URL }}
                originWhitelist={['*']}
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
                allowsFullscreenVideo
                javaScriptEnabled
                domStorageEnabled
                scrollEnabled={false}
                style={styles.web}
                onLoadEnd={() => setReady(true)}
                onError={() => setFailed(true)}
                onHttpError={() => setFailed(true)}
                onMessage={(e) => { if (e.nativeEvent.data === 'error') setFailed(true); }}
              />
              {!ready ? (
                <View style={styles.overlay} pointerEvents="none">
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              ) : null}
            </>
          ) : (
            <View style={styles.fallback}>
              <Text style={styles.fallbackText}>
                {src ? 'Ye video app me nahi chal paayi (format ya network ki dikkat).' : 'Video file nahi mili.'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          {item?.title ? <Text style={styles.title}>{item.title}</Text> : null}
          {item?.created_at ? <Text style={styles.date}>{formatDate(item.created_at)}</Text> : null}
          {item?.description ? <Text style={styles.desc}>{item.description}</Text> : null}

          {src ? (
            <Button
              title={failed ? 'Browser me kholein' : 'Browser me bhi khol sakte hain'}
              variant={failed ? 'primary' : 'outline'}
              onPress={() => Linking.openURL(src)}
              style={{ marginTop: spacing.lg }}
            />
          ) : null}
          {failed ? (
            <Button title="Dobara try karein" variant="ghost" onPress={() => { setFailed(false); setReady(false); }}
                    style={{ marginTop: spacing.sm }} />
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  player: { width, height: PLAYER_H, backgroundColor: '#000' },
  web: { flex: 1, backgroundColor: '#000' },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  fallbackText: { color: '#fff', textAlign: 'center', fontSize: typography.small },
  body: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  title: { fontSize: typography.h3, fontWeight: typography.bold, color: colors.text },
  date: { fontSize: typography.tiny, color: colors.textFaint, marginTop: 4 },
  desc: { fontSize: typography.body, color: colors.textMuted, marginTop: spacing.md, lineHeight: 22 },
});
