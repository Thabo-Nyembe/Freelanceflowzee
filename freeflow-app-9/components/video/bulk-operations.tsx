import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBulkOperations } from '@/hooks/use-bulk-operations';
import { BulkOperation, BulkOperationType } from '@/lib/types/bulk-operations';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface BulkOperationsProps {
  selectedVideos: string[];
  onComplete?: () => void;
  onCancel?: () => void;
}

export function BulkOperations({
  selectedVideos,
  onComplete,
  onCancel,
}: BulkOperationsProps) {
  const { createBulkOperation, subscribeToBulkOperation, isLoading } = useBulkOperations();
  const [operation, setOperation] = useState<BulkOperation | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<BulkOperationType>('delete');

  const handleOperationStart = async () => {
    try {
      const operation = await createBulkOperation({
        operation_type: selectedOperation,
        video_ids: selectedVideos,
        parameters: {},
      });

      setOperation(operation);

      // Subscribe to operation updates
      subscribeToBulkOperation(operation.id, (updatedOperation) => {
        setOperation(updatedOperation);
        if (['completed', 'failed'].includes(updatedOperation.status)) {
          onComplete?.();
        }
      });
    } catch (error) {
      console.error('Error starting bulk operation:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'in_progress':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const progress = operation
    ? (operation.processed_items / operation.total_items) * 100
    : 0;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-4">
        <Select
          value={selectedOperation}
          onValueChange={(value) => setSelectedOperation(value as BulkOperationType)}
          disabled={isLoading || !!operation}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select operation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="delete">Delete Videos</SelectItem>
            <SelectItem value="move">Move to Project</SelectItem>
            <SelectItem value="tag">Add Tags</SelectItem>
            <SelectItem value="update_privacy">Update Privacy</SelectItem>
            <SelectItem value="update_status">Update Status</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={handleOperationStart}
          disabled={isLoading || !!operation}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting...
            </>
          ) : (
            'Start Operation'
          )}
        </Button>

        {!operation && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>

      {operation && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(operation.status)}>
              {operation.status}
            </Badge>
            <span className="text-sm text-gray-500">
              {operation.processed_items} / {operation.total_items} videos processed
            </span>
          </div>

          <Progress value={progress} className="h-2" />

          {operation.error_message && (
            <p className="text-sm text-red-500">{operation.error_message}</p>
          )}
        </div>
      )}
    </div>
  );
} 