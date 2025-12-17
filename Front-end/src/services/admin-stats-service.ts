import axios from 'axios';
import { DashboardStats } from '../types/dashboard';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const adminStatsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await axios.get(`${API_URL}/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des stats:', error);
      throw error;
    }
  },

  async getUpcomingSoutenances(): Promise<any[]> {
    const response = await axios.get(`${API_URL}/admin/soutenances/upcoming`);
    return response.data;
  },

  async getUsersByRole(): Promise<any[]> {
    const response = await axios.get(`${API_URL}/admin/users/by-role`);
    return response.data;
  }
};