-- Create enum for bulk operation types
CREATE TYPE bulk_operation_type AS ENUM (
  'delete',
  'move',
  'tag',
  'update_privacy',
  'update_status'
);

-- Create enum for bulk operation status
CREATE TYPE bulk_operation_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'failed'
);

-- Create table for bulk operations
CREATE TABLE bulk_operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operation_type bulk_operation_type NOT NULL,
  status bulk_operation_status NOT NULL DEFAULT 'pending',
  video_ids UUID[] NOT NULL,
  parameters JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  total_items INTEGER NOT NULL,
  processed_items INTEGER NOT NULL DEFAULT 0,
  failed_items INTEGER NOT NULL DEFAULT 0
);

-- Create index for faster queries
CREATE INDEX bulk_operations_user_id_idx ON bulk_operations(user_id);
CREATE INDEX bulk_operations_status_idx ON bulk_operations(status);

-- Add RLS policies
ALTER TABLE bulk_operations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bulk operations"
  ON bulk_operations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bulk operations"
  ON bulk_operations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bulk operations"
  ON bulk_operations FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to process bulk operations
CREATE OR REPLACE FUNCTION process_bulk_operation(operation_id UUID)
RETURNS void AS $$
DECLARE
  op bulk_operations%ROWTYPE;
  video_id UUID;
  success_count INTEGER := 0;
  fail_count INTEGER := 0;
BEGIN
  -- Get operation details
  SELECT * INTO op FROM bulk_operations WHERE id = operation_id;
  
  -- Update status to in_progress
  UPDATE bulk_operations 
  SET status = 'in_progress', updated_at = NOW()
  WHERE id = operation_id;

  -- Process each video
  FOREACH video_id IN ARRAY op.video_ids
  LOOP
    BEGIN
      CASE op.operation_type
        WHEN 'delete' THEN
          DELETE FROM videos WHERE id = video_id AND user_id = op.user_id;
        
        WHEN 'move' THEN
          UPDATE videos 
          SET project_id = (op.parameters->>'project_id')::UUID
          WHERE id = video_id AND user_id = op.user_id;
        
        WHEN 'tag' THEN
          UPDATE videos 
          SET tags = COALESCE(tags, '{}') || (op.parameters->>'tags')::TEXT[]
          WHERE id = video_id AND user_id = op.user_id;
        
        WHEN 'update_privacy' THEN
          UPDATE videos 
          SET is_public = (op.parameters->>'is_public')::BOOLEAN
          WHERE id = video_id AND user_id = op.user_id;
        
        WHEN 'update_status' THEN
          UPDATE videos 
          SET status = op.parameters->>'status'
          WHERE id = video_id AND user_id = op.user_id;
      END CASE;

      success_count := success_count + 1;
    EXCEPTION WHEN OTHERS THEN
      fail_count := fail_count + 1;
    END;
    
    -- Update progress
    UPDATE bulk_operations 
    SET processed_items = success_count,
        failed_items = fail_count,
        updated_at = NOW()
    WHERE id = operation_id;
  END LOOP;

  -- Update final status
  UPDATE bulk_operations 
  SET status = CASE 
    WHEN fail_count = op.total_items THEN 'failed'
    ELSE 'completed'
  END,
  completed_at = NOW(),
  updated_at = NOW(),
  error_message = CASE 
    WHEN fail_count > 0 
    THEN format('Failed to process %s out of %s items', fail_count, op.total_items)
    ELSE NULL
  END
  WHERE id = operation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 