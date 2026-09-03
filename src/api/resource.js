/** Factory that builds standard CRUD calls for a DRF resource. */
import api from './axios';
import { detail } from '../constants/endpoints';
import { unwrapList } from '../utils/apiHelpers';

export function createResource(path) {
  return {
    // params: { search, ordering, page, ...filters }
    async list(params = {}) {
      const { data } = await api.get(path, { params });
      return unwrapList(data);
    },
    async get(id) {
      const { data } = await api.get(detail(path, id));
      return data;
    },
    async create(payload, config = {}) {
      const { data } = await api.post(path, payload, config);
      return data;
    },
    async update(id, payload, config = {}) {
      const { data } = await api.patch(detail(path, id), payload, config);
      return data;
    },
    async remove(id) {
      await api.delete(detail(path, id));
      return true;
    },
    path,
  };
}
export default createResource;
