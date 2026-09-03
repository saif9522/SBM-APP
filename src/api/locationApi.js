import { createResource } from './resource';
import { API } from '../constants/endpoints';

export const cities = createResource(API.cities);
export const wards = createResource(API.wards);
export function wardsForCity(cityId) {
  return wards.list({ city: cityId });
}
export default { cities, wards, wardsForCity };
