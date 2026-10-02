import { createResource } from './resource';
import { API } from '../constants/endpoints';

export const gallery = createResource(API.galleryImages);
export const galleryExtras = createResource(API.galleryExtras);

const isVideo = (g) => g?.media_type === 'video' || (!!g?.video && !g?.image);

/** Sirf photos. Server filter kare ya na kare — client bhi check karta hai. */
export const isPhotoItem = (g) => !isVideo(g) && !!g?.image;
export const isVideoItem = (g) => g?.media_type === 'video' && !!(g?.video || g?.video_url);

export function photos(params = {}) {
  return gallery.list({ media_type: 'image', ordering: '-created_at', ...params });
}
export function videos(params = {}) {
  return gallery.list({ media_type: 'video', ordering: '-created_at', ...params });
}

/**
 * Album ki baaki photos. Naya backend inhe `item.extras` me hi bhej deta
 * hai; purana backend `?parent=` filter ignore karta hai, isliye yahan
 * client-side bhi `parent` match karte hain.
 */
export async function extrasFor(parentId, { maxPages = 10 } = {}) {
  const out = [];
  for (let page = 1; page <= maxPages; page += 1) {
    // eslint-disable-next-line no-await-in-loop
    const res = await galleryExtras.list({ parent: parentId, page });
    (res.items || []).forEach((e) => {
      const pid = typeof e.parent === 'object' ? e.parent?.id : e.parent;
      if (String(pid) === String(parentId)) out.push(e);
    });
    if (!res.next) break;
  }
  return out.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id);
}

export default { gallery, galleryExtras, photos, videos, extrasFor, isPhotoItem, isVideoItem };
