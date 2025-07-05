export type FeedbackTargetType = 
  | "video"
  | "image"
  | "audio"
  | "code"
  | "text"
  | "document";

export interface Feedback {
  id: number;
  user_id: string;
  document_id: number;
  target_type: FeedbackTargetType;
  target_id: string;
  comment: string;
  context_data?: {
    timestamp?: string;
    selection?: string;
    region?: { x: number; y: number; width: number; height: number };
    code_selection?: { start_line: number; end_line: number };
  };
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

export type SuggestionStatus = "pending" | "accepted" | "rejected";

export type SuggestionData = 
  | { type: "insertion"; position: number; text: string }
  | { type: "deletion"; start: number; end: a; text: string }
  | { type: "replacement"; start: number; end: number; new_text: string; old_text: string };

export interface Suggestion {
  id: number;
  user_id: string;
  document_id: number;
  target_id: string;
  status: SuggestionStatus;
  suggestion_data: SuggestionData;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
} 