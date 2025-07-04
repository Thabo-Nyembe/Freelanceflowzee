export type BulkOperationType = 
  | 'delete'
  | 'move'
  | 'tag'
  | 'update_privacy'
  | 'update_status';

export type BulkOperationStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed';

export type BulkOperationParameters = {
  project_id?: string;
  tags?: string[];
  is_public?: boolean;
  status?: string;
};

export type BulkOperation = {
  id: string;
  user_id: string;
  operation_type: BulkOperationType;
  status: BulkOperationStatus;
  video_ids: string[];
  parameters?: BulkOperationParameters;
  error_message?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  total_items: number;
  processed_items: number;
  failed_items: number;
};

export type CreateBulkOperationInput = {
  operation_type: BulkOperationType;
  video_ids: string[];
  parameters?: BulkOperationParameters;
}; 