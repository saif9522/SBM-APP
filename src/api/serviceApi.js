import { createResource } from './resource';
import { API } from '../constants/endpoints';

export const categories = createResource(API.serviceCategories);
export const services = createResource(API.services);
export const serviceRequests = createResource(API.serviceRequests);

// Convenience: only active services, optional category filter/search.
export function listServices({ search, category, page } = {}) {
  return services.list({ is_active: true, search, category, page });
}
export function listCategories() {
  return categories.list({ is_active: true });
}
export function myRequests(userId, params = {}) {
  return serviceRequests.list({ user: userId, ...params });
}

export default { categories, services, serviceRequests, listServices, listCategories, myRequests };

// ── Category-code helpers (auto / ambulance / etc.) ──
// Categories are few, so we fetch and filter client-side rather than assume a
// server filterset supports ?code=.
export async function getCategoryByCode(code) {
  const { items } = await categories.list({ is_active: true });
  return items.find((c) => c.code === code) || null;
}

export async function servicesByCategoryCode(code) {
  const cat = await getCategoryByCode(code);
  if (!cat) return { items: [], count: 0, category: null };
  const list = await services.list({ is_active: true, category: cat.id });
  return { ...list, category: cat };
}
