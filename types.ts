export enum AppState {
  IDLE = 'IDLE',
  PARSING = 'PARSING',
  READY = 'READY',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}

export interface Suggestion {
  id: string;
  type: 'rewrite' | 'addition' | 'removal' | 'format';
  originalText?: string;
  suggestedText: string;
  reason: string;
  impact: 'high' | 'medium' | 'low';
}

export interface QualityMetric {
  score: number; // 0-10
  feedback: string;
}

export interface AnalysisResult {
  atsScore: number; // 0-100
  summary: string;
  quality: {
    clarity: QualityMetric;
    relevance: QualityMetric;
    keywords: QualityMetric;
    formatting: QualityMetric;
  };
  missingKeywords: string[];
  suggestions: Suggestion[];
}

export interface FileData {
  name: string;
  type: string;
  content: string; // Base64 or Text content depending on use
}