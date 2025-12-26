import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://apikeymanagement.onrender.com';

export const downloadService = {
  // Get all active versions (public - no auth required)
  async getActiveVersions() {
    try {
      const response = await axios.get(`${API_URL}/updates/versions/public/active`);
      return response.data;
    } catch (error) {
      console.error('Error fetching versions:', error);
      throw error;
    }
  },

  // Get specific version details (public)
  async getVersionDetails(versionId) {
    try {
      const response = await axios.get(`${API_URL}/updates/versions/${versionId}/public`);
      return response.data;
    } catch (error) {
      console.error('Error fetching version details:', error);
      throw error;
    }
  },

  // Check for latest version (public)
  async checkLatestVersion() {
    try {
      const response = await axios.get(`${API_URL}/updates/latest`);
      return response.data;
    } catch (error) {
      console.error('Error fetching latest version:', error);
      throw error;
    }
  },

  // Track download (public - for analytics)
  async trackDownload(versionId) {
    try {
      await axios.post(`${API_URL}/updates/versions/${versionId}/download-tracked`);
    } catch (error) {
      console.error('Error tracking download:', error);
    }
  },

  // Track installation (public - for analytics)
  async trackInstallation(versionId) {
    try {
      await axios.post(`${API_URL}/updates/versions/${versionId}/install-tracked`);
    } catch (error) {
      console.error('Error tracking installation:', error);
    }
  }
};
