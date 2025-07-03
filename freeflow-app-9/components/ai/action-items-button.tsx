"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { detectActionItems } from '@/app/(app)/projects/actions';
import { ListTodo, Loader2, AlertTriangle, Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ActionItemsButtonProps {
  projectId: string;
}

const priorityVariantMap: { [key: string]: 'destructive' | 'secondary' | 'outline' } = {
  High: 'destructive',
  Medium: 'secondary',
  Low: 'outline',
};

export function ActionItemsButton({ projectId }: ActionItemsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionItems, setActionItems] = useState<{ task: string; priority: string; }[]>([]);
  const [hasCopied, setHasCopied] = useState(false);

  const handleDetectActionItems = async () => {
    setIsOpen(true);
    setLoading(true);
    setError(null);
    setActionItems([]);

    const result = await detectActionItems(projectId);

    if (result.error) {
      setError(result.error);
    } else if (result.actionItems) {
      setActionItems(result.actionItems);
    }
    setLoading(false);
  };

  const handleCopyToClipboard = () => {
    const textToCopy = actionItems.map(item => `- [${item.priority}] ${item.task}`).join('\n');
    navigator.clipboard.writeText(textToCopy);
    setHasCopied(true);
    toast.success('Action items copied to clipboard!');
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={handleDetectActionItems}>
          <ListTodo className="mr-2 h-4 w-4" />
          Detect Action Items
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Suggested Action Items</DialogTitle>
          <DialogDescription>
            AI has analyzed the project and suggested the following tasks.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {loading && (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              <p className="ml-4 text-gray-600">Analyzing project content...</p>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center p-8 text-red-600">
              <AlertTriangle className="h-8 w-8 mb-2" />
              <p>{error}</p>
            </div>
          )}
          {!loading && !error && actionItems.length > 0 && (
            <div className="max-h-[50vh] overflow-y-auto p-4 bg-gray-50 rounded-md border">
              <ul className="space-y-3">
                {actionItems.map((item, index) => (
                  <li key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-start">
                      <input type="checkbox" id={`action-item-${index}`} className="mt-1 mr-3 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                      <label htmlFor={`action-item-${index}`} className="text-sm text-gray-800">{item.task}</label>
                    </div>
                    <Badge variant={priorityVariantMap[item.priority] || 'outline'}>{item.priority}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!loading && !error && actionItems.length === 0 && (
            <div className="text-center text-gray-500 p-8">
              <p>No specific action items were found in the project description.</p>
            </div>
          )}
        </div>
        <DialogFooter>
          {!loading && actionItems.length > 0 && (
            <Button variant="ghost" onClick={handleCopyToClipboard}>
              {hasCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {hasCopied ? 'Copied!' : 'Copy as Text'}
            </Button>
          )}
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
