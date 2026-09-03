import { createResource } from './resource';
import { API } from '../constants/endpoints';

export const complaints = createResource(API.complaints);
export function myComplaints(userId, params = {}) {
  return complaints.list({ user: userId, ordering: '-created_at', ...params });
}
export default { complaints, myComplaints };
