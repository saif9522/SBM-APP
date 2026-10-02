import { createResource } from './resource';
import { API } from '../constants/endpoints';
import listMine from './mine';

export const notifications = createResource(API.citizenNotifications);

/** Sirf logged-in user ke notifications. */
export function myNotifications(user, params = {}) {
  return listMine(notifications, user, {
    params: { ordering: '-created_at', ...params },
    userParam: 'user',
  });
}
export function markRead(id) {
  return notifications.update(id, { is_read: true });
}
export default { notifications, myNotifications, markRead };

export async function markAllRead(items = []) {
  const unread = items.filter((n) => !n.is_read);
  await Promise.all(unread.map((n) => markRead(n.id)));
  return true;
}
