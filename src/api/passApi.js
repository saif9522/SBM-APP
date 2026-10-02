import { createResource } from './resource';
import { API } from '../constants/endpoints';
import listMine from './mine';

export const passes = createResource(API.passApplications);
/** Sirf logged-in user ke pass applications. */
export function myPasses(user, params = {}) {
  return listMine(passes, user, {
    params: { ordering: '-created_at', ...params },
    userParam: 'user',
    phoneParam: 'phone',
  });
}
export default { passes, myPasses };
