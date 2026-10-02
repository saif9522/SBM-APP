import { createResource } from './resource';
import { API } from '../constants/endpoints';
import listMine from './mine';

export const complaints = createResource(API.complaints);
/** Sirf logged-in user ki complaints. */
export function myComplaints(user, params = {}) {
  return listMine(complaints, user, {
    params: { ordering: '-created_at', ...params },
    userParam: 'user',
  });
}
export default { complaints, myComplaints };
