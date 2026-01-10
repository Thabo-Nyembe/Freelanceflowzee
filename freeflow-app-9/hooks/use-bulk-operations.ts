import { useState } from 'react';
import { useSupabase } from '@/components/providers';
import { BulkOperation, CreateBulkOperationInput } from '@/lib/types/bulk-operations';
import { useToast } from '@/components/ui/use-toast';

export function useBulkOperations() {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<any>(false);

  const createBulkOperation = async (input: CreateBulkOperationInput) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('bulk_operations')
        .insert({
          ...input,
          total_items: input.video_ids.length,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Bulk operation created',
        description: `Processing ${input.video_ids.length} videos...`,
      });

      return data as BulkOperation;
    } catch (error) {
      console.error('Error creating bulk operation:', error);
      toast({
        title: 'Error',
        description: 'Failed to create bulk operation',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getBulkOperation = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('bulk_operations')
        .select()
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as BulkOperation;
    } catch (error) {
      console.error('Error fetching bulk operation:', error);
      throw error;
    }
  };

  const listBulkOperations = async () => {
    try {
      const { data, error } = await supabase
        .from('bulk_operations')
        .select()
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BulkOperation[];
    } catch (error) {
      console.error('Error listing bulk operations:', error);
      throw error;
    }
  };

  const subscribeToBulkOperation = (id: string, callback: (operation: BulkOperation) => void
  ) => {
    const subscription = supabase
      .channel(`bulk-operation-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bulk_operations',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          callback(payload.new as BulkOperation);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  return {
    createBulkOperation,
    getBulkOperation,
    listBulkOperations,
    subscribeToBulkOperation,
    isLoading,
  };
} 