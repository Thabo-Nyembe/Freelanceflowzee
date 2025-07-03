'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getRollupReport } from '@/app/(app)/projects/actions';
import { toast } from 'sonner';
import { DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Copy, Check, Loader2, FileText } from 'lucide-react';

interface RollupReportButtonProps {
  projectId: string
}

export function RollupReportButton({ projectId }: RollupReportButtonProps) {
  const [report, setReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setIsDialogOpen(true);
    const result = await getRollupReport(projectId);

    if (result.error) {
      toast.error('Failed to generate report', {
        description: result.error,
      });
      setIsDialogOpen(false);
    } else if (result.report) {
      setReport(result.report);
    }
    setIsLoading(false);
  };

  const handleCopyToClipboard = () => {
    if (!report) return;
    navigator.clipboard.writeText(report);
    setHasCopied(true);
    toast.success('Report copied to clipboard!');
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={handleGenerateReport} variant="outline" size="sm">
          <FileText className="mr-2 h-4 w-4" />
          Roll-up Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>AI Roll-up Report</DialogTitle>
          <DialogDescription>
            An AI-generated summary of this project and all its sub-projects.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-60">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              <p className="ml-4 text-gray-600">Generating report...</p>
            </div>
          ) : report ? (
            <div className="max-h-[60vh] overflow-y-auto p-4 bg-gray-50 rounded-md border">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{report}</p>
            </div>
          ) : (
            <div className="text-center text-gray-500 p-8">
              <p>No report could be generated.</p>
            </div>
          )}
        </div>
        <DialogFooter>
          {!isLoading && report && (
            <Button variant="ghost" onClick={handleCopyToClipboard}>
              {hasCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {hasCopied ? 'Copied!' : 'Copy Report'}
            </Button>
          )}
          <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
