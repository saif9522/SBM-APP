import { createResource } from './resource';
import { API } from '../constants/endpoints';

export const gallery = createResource(API.galleryImages);
export function photos(params = {}) {
  return gallery.list({ media_type: 'image', ...params });
}
export function videos(params = {}) {
  return gallery.list({ media_type: 'video', ...params });
}
export default { gallery, photos, videos };
