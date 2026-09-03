import { createResource } from './resource';
import { API } from '../constants/endpoints';

export const donors = createResource(API.bloodDonors);
export const requests = createResource(API.bloodRequests);
export const requestUpdates = createResource(API.bloodRequestUpdates);

export function searchDonors({ blood_group, search, page } = {}) {
  return donors.list({ is_active: true, blood_group, search, page });
}
export function myBloodRequests(userId, params = {}) {
  return requests.list({ user: userId, ...params });
}
export default { donors, requests, requestUpdates, searchDonors, myBloodRequests };
