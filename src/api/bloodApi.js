import { createResource } from './resource';
import { API } from '../constants/endpoints';
import listMine from './mine';

export const donors = createResource(API.bloodDonors);
export const requests = createResource(API.bloodRequests);
export const requestUpdates = createResource(API.bloodRequestUpdates);

export function searchDonors({ blood_group, search, page } = {}) {
  return donors.list({ is_active: true, blood_group, search, page });
}
/** Sirf logged-in user ki blood requests. (Donor search public rehta hai.) */
export function myBloodRequests(user, params = {}) {
  return listMine(requests, user, {
    params: { ordering: '-created_at', ...params },
    userParam: 'user',
    phoneParam: 'contact_number',
  });
}
export default { donors, requests, requestUpdates, searchDonors, myBloodRequests };
