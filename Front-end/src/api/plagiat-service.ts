import axios from 'axios';
// import type { PlagiatAnalysisResult } from 'src/components/plagiat';
interface PlagiatAnalysisResult {
    totalWords?: number;
    totalCharacters?: number;
    totalParagraphs?: number;
    totalSentences?: number;
    uniqueWords?: number;
    similarity_score?: number;
    matches?: any[];
    matchesDistribution?: Record<string, number>;
}

const API_URL = 'http://localhost:5000/api/plagiat';

export const plagiatService = {
    analyzeReport: async (rapportId: number | string): Promise<{ analysis: PlagiatAnalysisResult }> => {
        const response = await axios.post(`${API_URL}/analyze/${rapportId}`, {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    },

    getAnalysis: async (rapportId: number | string): Promise<{ analysis: PlagiatAnalysisResult } | null> => {
        try {
            const response = await axios.get(`${API_URL}/result/${rapportId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching plagiarism analysis:", error);
            return null;
        }
    }
};
