import axios from 'axios';

// Définition des types pour TypeScript (Optionnel mais recommandé)
export interface AnalysisResult {
  summary: string;
  layout_validation: {
    score: string;
    issues: string[];
  };
  content_validation: {
    score: string;
    strengths: string[];
    weaknesses: string[];
    general_comment: string;
  };
}

// Configuration de base d'Axios (si vous n'en avez pas déjà une globale)
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '', // Votre URL API
});

export const auditService = {
  analyzeReport: async (file: File): Promise<AnalysisResult> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axiosInstance.post('/api/v1/evaluations/analyze-report', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.analysis;
    } catch (error) {
      console.error("Erreur d'audit:", error);
      throw error;
    }
  }
};