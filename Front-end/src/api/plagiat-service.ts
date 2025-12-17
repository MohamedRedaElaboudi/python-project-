import axios from 'axios';

export interface PlagiatSource {
    chunk_index: number;
    matched_text: string;
    original_text: string;
    page: number;
    score: number;
    similarity: number;
    source: string;
    source_url: string;
    text: string;
}

export interface PlagiatAnalysisResult {
    student: string;
    rapport: string;
    similarity: number;
    originality: number;
    risk: 'none' | 'low' | 'medium' | 'high';
    sources: PlagiatSource[];
    ai_score: number;
    chunks_analyzed: number;
    chunks_with_matches: number;
    avg_similarity: number;
    matches_saved: number;
    error?: string;
}

export interface PlagiatResponse {
    analysis: PlagiatAnalysisResult;
    status: string;
    matches_saved: number;
    analysis_id: number;
    message?: string;
}

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
});

export const plagiatService = {
    analyzeReport: async (rapportId: string | number): Promise<PlagiatResponse> => {
        try {
            const token = localStorage.getItem('token');
            const response = await axiosInstance.post(`/api/plagiat/analyze/${rapportId}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Erreur d'analyse plagiat:", error);
            throw error;
        }
    }
};
