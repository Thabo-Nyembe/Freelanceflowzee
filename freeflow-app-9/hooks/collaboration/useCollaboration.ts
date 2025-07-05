import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Feedback, Suggestion, SuggestionStatus, SuggestionData } from '@/lib/types/collaboration';

export function useCollaboration(documentId: number) {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (documentId) {
      fetchFeedback();
      fetchSuggestions();
    }
  }, [documentId]);

  const fetchFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('document_id', documentId);
      if (error) throw error;
      setFeedback(data || []);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .eq('document_id', documentId);
      if (error) throw error;
      setSuggestions(data || []);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const addFeedback = async (newFeedback: Omit<Feedback, 'id' | 'created_at' | 'user_id'>) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('feedback')
        .insert([{ ...newFeedback, user_id: user.id }])
        .select();
      
      if (error) throw error;
      
      if (data) {
        setFeedback(prev => [...prev, ...data]);
      }
      return data;
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const addSuggestion = async (suggestionData: SuggestionData, targetId: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const newSuggestion: Omit<Suggestion, 'id' | 'created_at' | 'user_id' | 'status' | 'resolved_at' | 'resolved_by'> = {
        document_id: documentId,
        target_id: targetId,
        suggestion_data: suggestionData,
      };

      const { data, error } = await supabase
        .from('suggestions')
        .insert([{ ...newSuggestion, user_id: user.id }])
        .select();
      
      if (error) throw error;
      
      if (data) {
        setSuggestions(prev => [...prev, ...data]);
      }
      return data;
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateSuggestionStatus = async (suggestionId: number, status: SuggestionStatus) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('suggestions')
        .update({ status, resolved_at: new Date().toISOString(), resolved_by: user.id })
        .eq('id', suggestionId)
        .select();

      if (error) throw error;

      if (data) {
        setSuggestions(prev => prev.map(s => s.id === suggestionId ? data[0] : s));
      }
      return data;
    } catch (err: any) {
      setError(err);
      return null;
    } finally {.
      setLoading(false);
    }
  };

  return { feedback, suggestions, loading, error, fetchFeedback, fetchSuggestions, addFeedback, addSuggestion, updateSuggestionStatus };
} 