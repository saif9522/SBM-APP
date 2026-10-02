/**
 * Infinite-scroll list over a DRF paginated endpoint.
 *
 * Pehle gallery sirf page 1 (20 items) laati thi — baaki photos kabhi
 * dikhti hi nahi thin. Ye hook scroll ke saath agle pages laata hai.
 *
 *   const list = usePaginated((page) => galleryApi.photos({ page }), {
 *     filter: (g) => g.media_type === 'image',
 *     enabled: tab === 'image',
 *   });
 *   <FlatList data={list.items} onEndReached={list.loadMore} … />
 *
 * `filter` — server purana ho aur `?media_type=` ko ignore kare, tab bhi
 * sirf sahi items dikhen. Agar filter ke baad bahut kam items bachen, hook
 * khud agla page le aata hai (`minVisible`), taaki khaali screen par
 * spinner na atka rahe.
 *
 * `enabled` — lazy: Videos tab tabhi load hota hai jab khola jaaye.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { friendlyError } from '../utils/apiHelpers';

export default function usePaginated(fetchPage, {
  filter = null,
  enabled = true,
  minVisible = 12,
  maxAutoPages = 6,
  deps = [],
} = {}) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);        // last page loaded
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);       // first page
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [loadedOnce, setLoadedOnce] = useState(false);

  const busy = useRef(false);
  const mounted = useRef(true);
  const fetchRef = useRef(fetchPage);
  const filterRef = useRef(filter);
  fetchRef.current = fetchPage;
  filterRef.current = filter;

  useEffect(() => () => { mounted.current = false; }, []);

  const keep = (list) => (filterRef.current ? list.filter(filterRef.current) : list);

  // Mirror of `items` we can read synchronously. (A setState updater runs
  // later, during render — so counting "how many are visible now" inside
  // one would always see the old list.)
  const itemsRef = useRef([]);

  /**
   * Load pages starting at `startPage`, appending (or replacing when
   * `replace`). If the filter leaves too little on screen, keep fetching
   * the next page automatically — otherwise a list whose first pages are
   * all the "wrong" type shows nothing and never triggers onEndReached.
   */
  const loadFrom = useCallback(async (startPage, replace) => {
    if (busy.current) return;
    busy.current = true;
    setError('');
    let list = replace ? [] : itemsRef.current;
    let added = 0;
    const want = replace ? minVisible : 1;
    let p = startPage;
    try {
      for (let i = 0; i < maxAutoPages; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const res = await fetchRef.current(p);
        if (!mounted.current) return;
        const fresh = keep(res?.items || []);
        const next = !!res?.next;

        const seen = new Set(list.map((x) => String(x.id)));
        const unique = fresh.filter((x) => !seen.has(String(x.id)));
        list = list.concat(unique);
        added += unique.length;

        itemsRef.current = list;
        setItems(list);
        setPage(p);
        setHasNext(next);

        if (!next || added >= want) break;
        p += 1;
      }
    } catch (err) {
      if (mounted.current) setError(friendlyError(err));
    } finally {
      busy.current = false;
      if (mounted.current) {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
        setLoadedOnce(true);
      }
    }
  }, [maxAutoPages, minVisible]); // eslint-disable-line react-hooks/exhaustive-deps

  const reload = useCallback(() => {
    setLoading(true);
    setHasNext(true);
    return loadFrom(1, true);
  }, [loadFrom]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setHasNext(true);
    return loadFrom(1, true);
  }, [loadFrom]);

  const loadMore = useCallback(() => {
    if (busy.current || !hasNext || !loadedOnce || error) return;
    setLoadingMore(true);
    loadFrom(page + 1, false);
  }, [hasNext, loadedOnce, error, page, loadFrom]);

  useEffect(() => {
    if (enabled && !loadedOnce && !busy.current) reload();
  }, [enabled, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    items, loading: loading || (enabled && !loadedOnce && !error),
    loadingMore, refreshing, error, hasNext, loadedOnce,
    loadMore, refresh, reload,
  };
}
