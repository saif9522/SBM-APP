import { createResource } from './resource';
import { API } from '../constants/endpoints';

export const users = createResource(API.users);
export const familyMembers = createResource(API.familyMembers);

export function getProfile(userId) {
  return users.get(userId);
}
export function updateProfile(userId, payload, config = {}) {
  return users.update(userId, payload, config);
}
export default { users, familyMembers, getProfile, updateProfile };
