/**
 * Location helpers built on expo-location. Always ask permission politely and
 * fail soft (return null) so the UI can show a message instead of crashing.
 */
import * as Location from 'expo-location';

export async function getCurrentLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return { error: 'permission-denied' };

  try {
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const { latitude, longitude } = pos.coords;
    let address = '';
    try {
      const places = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (places?.length) address = formatPlace(places[0]);
    } catch { /* reverse geocode is best-effort */ }
    return { latitude, longitude, address };
  } catch {
    return { error: 'unavailable' };
  }
}

function formatPlace(p = {}) {
  return [p.name, p.street, p.district, p.city, p.region, p.postalCode]
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(', ');
}

export default { getCurrentLocation };
