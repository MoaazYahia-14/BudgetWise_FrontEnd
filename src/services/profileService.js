import api from './api';

export const updateRole = (roleData) => {
  return api.put('/profile/role', roleData);
};
