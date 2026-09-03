/**
 * Response + error helpers. The backend uses DRF PageNumberPagination for
 * lists ({count,next,previous,results}) but a few JSON views return other
 * shapes — so we never blindly assume `.data` is an array.
 */

// Normalise any list-ish response into { items, count, next, previous }.
export function unwrapList(data) {
  if (Array.isArray(data)) {
    return { items: data, count: data.length, next: null, previous: null };
  }
  if (data && Array.isArray(data.results)) {
    return {
      items: data.results,
      count: data.count ?? data.results.length,
      next: data.next ?? null,
      previous: data.previous ?? null,
    };
  }
  return { items: [], count: 0, next: null, previous: null };
}

// Turn an axios error into a short, user-safe message (never a raw stack).
export function friendlyError(error) {
  if (__DEV__ && error?.response) {
    // eslint-disable-next-line no-console
    console.log('API error:', error.response.status, error.response.data);
  }
  if (error?.message === 'Network Error') {
    return 'No internet connection. Please check your network and try again.';
  }
  if (error?.code === 'ECONNABORTED') {
    return 'The request took too long. Please try again.';
  }
  const status = error?.response?.status;
  const data = error?.response?.data;
  if (data) {
    if (typeof data === 'string') return truncate(stripHtml(data));
    if (data.detail) return String(data.detail);
    if (data.message) return String(data.message);
    // DRF field errors -> first message
    const firstKey = Object.keys(data)[0];
    if (firstKey) {
      const val = data[firstKey];
      return `${firstKey}: ${Array.isArray(val) ? val[0] : val}`;
    }
  }
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return 'You do not have permission to do that.';
  if (status === 404) return 'Not found.';
  if (status >= 500) return 'The server had a problem. Please try again shortly.';
  return 'Something went wrong. Please try again.';
}

function stripHtml(s = '') {
  return s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
function truncate(s = '', n = 140) {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

export default { unwrapList, friendlyError };
