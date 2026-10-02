/**
 * listMine() — "sirf mera data" fetch karne ka ek hi rasta.
 *
 * Kaam karne ka tarika:
 *  1. Agar user identify hi nahi ho paa raha (logout / adhoori profile) ->
 *     kuch bhi fetch nahi, khaali list. (Kabhi bhi sabka data nahi.)
 *  2. Server ko filter bhejo (?user=<id> / ?phone=<phone>).
 *  3. Jo aaya usme se sirf apne records rakho.
 *  4. Agar page-1 me dusron ke records mile -> matlab server ne filter ignore
 *     kiya. Tab baaki pages bhi padh kar (cap ke saath) apne records jodo,
 *     warna user ke apne purane records page-2/3 par chhup jaate hain.
 *
 * NOTE: Ye client-side guard hai. Asli, permanent fix backend par hai —
 * dekhein: BACKEND-FIX.md (get_queryset me request.user se filter).
 */
import { filterMine, hasIdentity, identityOf } from '../utils/owner';

const EMPTY = { items: [], count: 0, next: null, previous: null };

export default async function listMine(resource, user, options = {}) {
  const {
    params = {},
    userParam = 'user',   // server-side filter key for the FK (null = mat bhejo)
    phoneParam = null,    // e.g. 'phone' for donations / pass applications
    maxPages = 12,        // runaway se bachne ke liye cap
  } = options;

  if (!hasIdentity(user)) return { ...EMPTY, unidentified: true };

  const { ids, phones } = identityOf(user);
  const uid = ids.values().next().value;
  const phone = phones.values().next().value;

  const base = { ...params };
  if (userParam && uid) base[userParam] = uid;
  if (phoneParam && phone) base[phoneParam] = phone;

  const first = await resource.list({ ...base, page: 1 });
  const firstItems = first.items || [];
  const mine = filterMine(firstItems, user);

  // Server ne filter maana (ya list khaali hai) -> jo mila wahi theek hai.
  const serverHonoured = firstItems.length === 0 || mine.length === firstItems.length;
  if (serverHonoured) {
    return { ...first, items: mine, count: mine.length, filtered: 'server' };
  }

  // Server ne filter ignore kiya -> baaki pages bhi scan karo.
  let collected = mine;
  let next = first.next;
  for (let page = 2; page <= maxPages && next; page += 1) {
    // eslint-disable-next-line no-await-in-loop
    const res = await resource.list({ ...base, page });
    collected = collected.concat(filterMine(res.items || [], user));
    next = res.next;
  }

  return {
    items: collected,
    count: collected.length,
    next: null,
    previous: null,
    filtered: 'client',
    truncated: !!next, // maxPages tak bhi list khatm nahi hui
  };
}

export { listMine };
