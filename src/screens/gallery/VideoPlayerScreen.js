import React from 'react';
import { View, Text, StyleSheet, Dimensions, Linking } from 'react-native';
import { Screen, Header, Button } from '../../components';
import { colors, spacing, typography } from '../../constants/theme';
import { mediaUrl } from '../../utils/format';

const { width } = Dimensions.get('window');

// expo-av is optional; if it isn't installed we offer to open the video URL.
let Video = null;
let ResizeMode = null;
try {
  // eslint-disable-next-line global-require
  const av = require('expo-av');
  Video = av.Video;
  ResizeMode = av.ResizeMode;
} catch (e) { Video = null; }

export default function VideoPlayerScreen({ route, navigation }) {
  const { item } = route.params || {};
  const uri = mediaUrl(item?.video);

  return (
    <Screen edges={['top']}>
      <Header title={item?.title || 'Video'} onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        {uri && Video ? (
          <Video
            source={{ uri }}
            style={styles.player}
            useNativeControls
            resizeMode={ResizeMode?.CONTAIN || 'contain'}
            shouldPlay
          />
        ) : (
          <View style={styles.fallback}>
            <Text style={styles.fallbackText}>
              {uri ? 'Video player not available in this build.' : 'Video not found.'}
            </Text>
            {uri ? <Button title="Open video" onPress={() => Linking.openURL(uri)} fullWidth={false} style={{ marginTop: spacing.lg }} /> : null}
          </View>
        )}
        {item?.description ? <Text style={styles.desc}>{item.description}</Text> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, padding: spacing.lg },
  player: { width: width - spacing.lg * 2, height: (width - spacing.lg * 2) * 0.56, backgroundColor: '#000', borderRadius: 12 },
  fallback: { height: 200, borderRadius: 12, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  fallbackText: { color: colors.textMuted, textAlign: 'center' },
  desc: { fontSize: typography.body, color: colors.textMuted, marginTop: spacing.lg, lineHeight: 22 },
});
