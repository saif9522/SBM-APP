/**
 * Build multipart FormData for endpoints that accept file uploads
 * (ImageField / FileField). Pass plain fields + optional files.
 *
 *   buildFormData({ user: 3, address: 'x' }, { image: pickerAsset })
 *
 * A picker asset is the object returned by expo-image-picker
 * (has { uri, fileName?, mimeType? }).
 */
export function buildFormData(fields = {}, files = {}) {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, val]) => {
    if (val !== undefined && val !== null && val !== '') fd.append(k, String(val));
  });
  Object.entries(files).forEach(([k, asset]) => {
    if (!asset?.uri) return;
    const name = asset.name || asset.fileName || asset.uri.split('/').pop() || `${k}.jpg`;
    const type = asset.mimeType || guessType(name);
    fd.append(k, { uri: asset.uri, name, type });
  });
  return fd;
}

function guessType(name = '') {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'pdf') return 'application/pdf';
  if (ext === 'heic') return 'image/heic';
  return 'image/jpeg';
}

// Headers to merge into an axios call when sending FormData.
export const MULTIPART = { headers: { 'Content-Type': 'multipart/form-data' } };

export default { buildFormData, MULTIPART };
