import { createResource } from './resource';
import { API } from '../constants/endpoints';

export const news = createResource(API.newsUpdates);
export const cutouts = createResource(API.newsCutouts);
export function activeNews() {
  return news.list({ is_active: true });
}
export default { news, cutouts, activeNews };
