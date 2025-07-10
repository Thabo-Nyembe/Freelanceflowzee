"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ListTodo } from 'lucide-react';
import { extractActionItems } from '@/app/(app)/dashboard/ai-assistant/actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from 'sonner';

interface ActionItem {
  task: string;
  assignee?: string;
  dueDate?: string;
}

interface ActionItemsButtonProps {
  projectId: string;
}

export const ActionItemsButton = ({ projectId }: ActionItemsButtonProps) => {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState<any>(false);
  const [isOpen, setIsOpen] = useState<any>(false);

  const handleExtract = async () => {
    setIsLoading(true);
    const result = await extractActionItems(projectId);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.actionItems) {
      if (result.actionItems.length === 0) {
        toast.info("No action items were found in this project.");
        return;
      }
      setActionItems(result.actionItems);
      setIsOpen(true);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <Button onClick={handleExtract} disabled={isLoading} variant="outline" size="sm">
        <ListTodo className="h-4 w-4 mr-2" />
        {isLoading ? 'Extracting...' : 'Get Action Items'}
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Detected Action Items</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="max-h-[400px] overflow-y-auto py-4">
              {actionItems.length > 0 ? (
                <ul className="space-y-4">
                  {actionItems.map((item, index) => (
                    <li key={index} className="p-3 bg-muted/50 rounded-md border">
                      <p className="font-semibold">{item.task}</p>
                      {(item.assignee || item.dueDate) && (
                        <div className="text-sm text-muted-foreground mt-1 flex items-center gap-x-4">
                          {item.assignee && <span>Assigned to: <strong>{item.assignee}</strong></span>}
                          {item.dueDate && <span>Due: <strong>{item.dueDate}</strong></span>}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No action items found.</p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => setIsOpen(false)}>Close</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
