export { DiffViewer } from './DiffViewer';
export { PdfHighlighter } from './PdfHighlighter';
export { PlagiatScoreCard } from './PlagiatScoreCard';
export { PlagiatStats } from './PlagiatStats';
export { RiskIndicator } from './RiskIndicator';
export { SimilarityViewer } from './SimilarityViewer';

// Types
export interface PlagiatMatch {
    id: number;
    source_url: string;
    source?: string;
    similarity: number;
    text?: string;
    matched_text?: string;
    original_text?: string;
    content_snippet: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    page?: number;
}

export interface PlagiatAnalysisResult {
    id: number;
    similarity: number;
    status: string;
    sources: PlagiatMatch[];
    created_at: string;
    risk: string;
    originality: number;
    student?: string;
    rapport?: string;
    word_count?: number;
    unique_words?: number;
    readability_score?: number;
    detection_time?: number;
}
