import { createResource } from './resource';
import { API } from '../constants/endpoints';

export const contactMessages = createResource(API.contactMessages);
export function sendMessage(payload) {
  return contactMessages.create(payload);
}
export default { contactMessages, sendMessage };
