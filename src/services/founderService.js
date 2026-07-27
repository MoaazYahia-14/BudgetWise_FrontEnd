import api from './api';

export const getBusinessPlan = async () => {
  const res = await api.get('/founder/business-plan');
  return res.data.data;
};

export const updateBusinessPlan = async (data) => {
  const res = await api.put('/founder/business-plan', data);
  return res.data.data;
};

export const getCompanyBudget = async () => {
  const res = await api.get('/founder/company-budget');
  return res.data.data;
};

export const updateCompanyBudget = async (data) => {
  const res = await api.put('/founder/company-budget', data);
  return res.data.data;
};
