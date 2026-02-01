export type ContentType = 'tv_show' | 'movie' | 'book';

export interface ScanRequest {
  title: string;
  content_type: ContentType;
}

export interface ContentWarning {
  category: string;
  severity: 'mild' | 'moderate' | 'strong';
  description: string;
  episodes_or_chapters?: string[];
}

export interface AgeRecommendation {
  minimum_age: number;
  ideal_age_range: string;
  reasoning: string;
}

export interface PositiveElement {
  category: string;
  description: string;
}

export interface DiscussionTopic {
  topic: string;
  suggested_questions: string[];
}

export interface ScanResult {
  title: string;
  content_type: ContentType;
  overall_rating: string;
  summary: string;
  content_warnings: ContentWarning[];
  age_recommendation: AgeRecommendation;
  positive_elements: PositiveElement[];
  discussion_topics: DiscussionTopic[];
  similar_alternatives?: string[];
  sources_consulted?: string[];
  cached?: boolean;
  scanned_at: string;
}

export interface ScanResponse {
  success: boolean;
  data?: ScanResult;
  error?: string;
  cached?: boolean;
}

export interface ApiError {
  error: string;
  details?: string;
}
