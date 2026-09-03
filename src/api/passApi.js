import { createResource } from './resource';
import { API } from '../constants/endpoints';

export const passes = createResource(API.passApplications);
export function myPasses(phone, params = {}) {
  return passes.list({ phone, ...params });
}
export default { passes, myPasses };
