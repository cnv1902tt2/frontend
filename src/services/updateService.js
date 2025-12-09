import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://apikeymanagement.onrender.com';

export const updateService = {
  // Get all versions (admin)
  async getVersions(token) {
    const response = await axios.get(`${API_URL}/updates/versions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Create new version (admin)
  async createVersion(token, versionData) {
    const response = await axios.post(`${API_URL}/updates/versions`, versionData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Deactivate version (admin)
  async deactivateVersion(token, versionId) {
    const response = await axios.put(
      `${API_URL}/updates/versions/${versionId}/deactivate`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Delete version (admin)
  async deleteVersion(token, versionId) {
    const response = await axios.delete(`${API_URL}/updates/versions/${versionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Get update statistics (admin)
  async getStatistics(token) {
    const response = await axios.get(`${API_URL}/updates/statistics`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Calculate file checksum (admin)
  async calculateChecksum(token, filePath) {
    const response = await axios.post(
      `${API_URL}/updates/calculate-checksum`,
      { file_path: filePath },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Health check (public)
  async healthCheck() {
    const response = await axios.get(`${API_URL}/updates/health`);
    return response.data;
  }
};
