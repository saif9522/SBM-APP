import { createResource } from './resource';
import { API } from '../constants/endpoints';

export const donations = createResource(API.donations);
export function myDonations(phone, params = {}) {
  return donations.list({ phone, ordering: '-created_at', ...params });
}
export default { donations, myDonations };
