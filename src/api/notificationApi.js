import { createResource } from './resource';
import { API } from '../constants/endpoints';

export const notifications = createResource(API.citizenNotifications);

export function myNotifications(userId, params = {}) {
  return notifications.list({ user: userId, ordering: '-created_at', ...params });
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
