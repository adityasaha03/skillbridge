import { apiRequest } from './apiClient';

export const fetchUserProfile = async () => {
  const data = await apiRequest('/api/v1/users/profile');
  return data.profile;
};

export const updateUserProfile = async (profileData) => {
  const data = await apiRequest('/api/v1/users/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
  return data.profile;
};

export const updateUserSkills = async ({ wantToLearn, canTeach }) => {
  const data = await apiRequest('/api/v1/users/skills', {
    method: 'PUT',
    body: JSON.stringify({ wantToLearn, canTeach }),
  });
  return data;
};
