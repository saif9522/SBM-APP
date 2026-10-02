import { createResource } from './resource';
import { API } from '../constants/endpoints';
import listMine from './mine';

export const donations = createResource(API.donations);
/** Sirf logged-in user ke donations (user FK ya phone se match). */
export function myDonations(user, params = {}) {
  return listMine(donations, user, {
    params: { ordering: '-created_at', ...params },
    userParam: 'user',
    phoneParam: 'phone',
  });
}
export default { donations, myDonations };
