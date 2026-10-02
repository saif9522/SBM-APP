import { createResource } from './resource';
import { API } from '../constants/endpoints';
import listMine from './mine';

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
/**
 * Sirf logged-in user ki service requests / bookings.
 * `user` = poora auth user object (sirf id nahi), taaki phone-fallback bhi chale.
 */
export function myRequests(user, params = {}) {
  return listMine(serviceRequests, user, {
    params: { ordering: '-created_at', ...params },
    userParam: 'user',
  });
}

export default { categories, services, serviceRequests, listServices, listCategories, myRequests };

// ── Garbage / Dukan pehchaan + ordering helpers ───────────────────────────
// Categories: "Garbage / कचरा" aur "Dukan / दुकान". In helpers se hum
// Garbage ko upar aur Dukan ko sabse last rakhte hain.
const GARBAGE_RE = /garbage|कचरा|waste|kachra|swachh|safai|सफाई/i;
const DUKAN_RE = /dukan|दुकान|\bshop\b/i;

export const isGarbage = (text = '') => GARBAGE_RE.test(String(text));
export const isDukan = (text = '') => DUKAN_RE.test(String(text));

// Category chips ka order: All (screen adds), phir Garbage, phir baaki, Dukan last.
export function categoryRank(cat) {
  const s = `${cat?.name || ''} ${cat?.code || ''}`;
  if (isGarbage(s)) return 0;
  if (isDukan(s)) return 100;
  return 50;
}

export function sortCategories(cats = []) {
  return [...cats].sort((a, b) => categoryRank(a) - categoryRank(b) || String(a?.name || '').localeCompare(String(b?.name || '')));
}

// Ek service Garbage-type hai ya nahi (uske naam ya category naam se).
export function serviceIsGarbage(service, catNameById = {}) {
  const catName = catNameById[service?.category] || '';
  return isGarbage(`${service?.name || ''} ${service?.description || ''} ${catName}`);
}

// Popular/list ke liye: Garbage services sabse pehle.
export function sortServicesGarbageFirst(list = [], catNameById = {}) {
  return [...list].sort((a, b) => {
    const ga = serviceIsGarbage(a, catNameById) ? 0 : 1;
    const gb = serviceIsGarbage(b, catNameById) ? 0 : 1;
    return ga - gb;
  });
}

// Saare active services laata hai (saare pages), taaki tabs client-side
// reliably filter kar sakein aur 20 ki page-limit na aaye.
export async function listAllServices({ search } = {}) {
  let page = 1;
  let all = [];
  let count = 0;
  // Safety cap: max 20 pages.
  for (let i = 0; i < 20; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const res = await services.list({ is_active: true, search: search || undefined, page });
    all = all.concat(res.items || []);
    count = res.count ?? all.length;
    if (!res.next) break;
    page += 1;
  }
  return { items: all, count };
}

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
