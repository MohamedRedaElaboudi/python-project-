// src/services/dashboard.service.ts
import axios from 'axios';
import { DashboardStats } from '../types/dashboard';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Intercepteur pour ajouter le token JWT
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error) // Correction ici
);

export const dashboardService = {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await axios.get(`${API_URL}/dashboard/stats`);
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des statistiques:', error);

      // Si l'erreur est 403 (non autorisé), rediriger vers la page de login
      if (error.response?.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }

      throw error;
    }
  },

  async getSoutenancesStats() {
    const response = await axios.get(`${API_URL}/soutenances/stats`);
    return response.data;
  },

  async getUsersStats() {
    const response = await axios.get(`${API_URL}/users/stats`);
    return response.data;
  },

  async getUpcomingSoutenances() {
    const response = await axios.get(`${API_URL}/soutenances/upcoming`);
    return response.data;
  }
};