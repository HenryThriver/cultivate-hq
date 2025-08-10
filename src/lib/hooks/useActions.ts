import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/lib/contexts/ToastContext';
import type { DbAction } from '@/types/database';

export interface ActionItem {
  id: string;
  title: string;
  description?: string;
  action_type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'cancelled';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  due_date?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  user_id: string;
  contact_id?: string;
  artifact_id?: string;
  goal_id?: string;
  session_id?: string;
  notes?: string;
  estimated_duration_minutes?: number;
  action_data?: Record<string, unknown>;
}

// Transform database action to component format
const transformAction = (dbAction: DbAction): ActionItem => ({
  id: dbAction.id,
  title: dbAction.title,
  description: dbAction.description,
  action_type: dbAction.action_type,
  status: dbAction.status,
  priority: dbAction.priority,
  due_date: dbAction.due_date,
  created_at: dbAction.created_at,
  updated_at: dbAction.updated_at,
  completed_at: dbAction.completed_at,
  user_id: dbAction.user_id,
  contact_id: dbAction.contact_id,
  artifact_id: dbAction.artifact_id,
  goal_id: dbAction.goal_id,
  session_id: dbAction.session_id,
  notes: dbAction.notes,
  estimated_duration_minutes: dbAction.estimated_duration_minutes,
  action_data: dbAction.action_data,
});

// Hook to get actions by artifact ID
export const useActionsByArtifact = (artifactId: string | undefined) => {
  return useQuery({
    queryKey: ['actions', 'by-artifact', artifactId],
    queryFn: async () => {
      if (!artifactId) return [];
      
      const { data, error } = await supabase
        .from('actions')
        .select('*')
        .eq('artifact_id', artifactId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching actions by artifact:', error);
        throw error;
      }

      return data.map(transformAction);
    },
    enabled: !!artifactId,
  });
};

// Hook to get actions by contact ID
export const useActionsByContact = (contactId: string | undefined) => {
  return useQuery({
    queryKey: ['actions', 'by-contact', contactId],
    queryFn: async () => {
      if (!contactId) return [];
      
      const { data, error } = await supabase
        .from('actions')
        .select('*')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching actions by contact:', error);
        throw error;
      }

      return data.map(transformAction);
    },
    enabled: !!contactId,
  });
};

// Hook to create a new action
export const useCreateAction = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (actionData: {
      title: string;
      description?: string;
      action_type: string;
      priority?: 'urgent' | 'high' | 'medium' | 'low';
      status?: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'cancelled';
      contact_id?: string;
      artifact_id?: string;
      goal_id?: string;
      due_date?: string;
      estimated_duration_minutes?: number;
      notes?: string;
      action_data?: Record<string, any>;
    }) => {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('actions')
        .insert([{
          ...actionData,
          user_id: user.id,
          priority: actionData.priority || 'medium',
          status: actionData.status || 'pending',
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating action:', error);
        throw error;
      }

      return transformAction(data);
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['actions'] });
      if (data.artifact_id) {
        queryClient.invalidateQueries({ queryKey: ['actions', 'by-artifact', data.artifact_id] });
      }
      if (data.contact_id) {
        queryClient.invalidateQueries({ queryKey: ['actions', 'by-contact', data.contact_id] });
      }
      showToast('Action created successfully', 'success');
    },
    onError: (error) => {
      console.error('Failed to create action:', error);
      showToast('Failed to create action', 'error');
    },
  });
};

// Hook to update an action
export const useUpdateAction = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<Omit<ActionItem, 'id' | 'created_at' | 'updated_at' | 'user_id'>>
    }) => {
      // Verify user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('actions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id) // Ensure user can only update their own actions
        .select()
        .single();

      if (error) {
        console.error('Error updating action:', error);
        throw error;
      }

      return transformAction(data);
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['actions'] });
      if (data.artifact_id) {
        queryClient.invalidateQueries({ queryKey: ['actions', 'by-artifact', data.artifact_id] });
      }
      if (data.contact_id) {
        queryClient.invalidateQueries({ queryKey: ['actions', 'by-contact', data.contact_id] });
      }
      showToast('Action updated successfully', 'success');
    },
    onError: (error) => {
      console.error('Failed to update action:', error);
      showToast('Failed to update action', 'error');
    },
  });
};

// Hook to delete an action
export const useDeleteAction = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      // Verify user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('actions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Ensure user can only delete their own actions

      if (error) {
        console.error('Error deleting action:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      // Invalidate all action queries since we don't know which ones might be affected
      queryClient.invalidateQueries({ queryKey: ['actions'] });
      showToast('Action deleted successfully', 'success');
    },
    onError: (error) => {
      console.error('Failed to delete action:', error);
      showToast('Failed to delete action', 'error');
    },
  });
};