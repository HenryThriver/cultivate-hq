import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { Contact } from '@/types';
import type { Database } from '@/lib/supabase/types_db';

// Assuming your Supabase table is named 'contacts'
const CONTACTS_TABLE = 'contacts';

// Use the generated Insert type for creating contacts
export type ContactInsert = Database['public']['Tables']['contacts']['Insert'];

export const useContacts = () => {
  const queryClient = useQueryClient();

  // Fetch all contacts
  const getContacts = React.useCallback(async (): Promise<Contact[]> => {
    const { data, error } = await supabase.from(CONTACTS_TABLE).select('*');
    if (error) throw new Error(error.message);
    return data || [];
  }, []);

  const { data: contacts, isLoading: isLoadingContacts, error: contactsError } = useQuery<Contact[]>({
    queryKey: [CONTACTS_TABLE],
    queryFn: getContacts,
  });

  // Fetch a single contact by ID
  const getContactById = React.useCallback(async (id: string): Promise<Contact | null> => {
    const { data, error } = await supabase
      .from(CONTACTS_TABLE)
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      // Handle cases where the contact is not found gracefully for the query hook
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data;
  }, []);

  // Prefetch a contact - useful for hover effects or navigating to detail page
  const prefetchContact = React.useCallback(async (id: string): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: [CONTACTS_TABLE, id],
      queryFn: () => getContactById(id),
    });
  }, [queryClient, getContactById]);
  
  // Create a new contact - updated to accept ContactInsert type
  const createContactDB = React.useCallback(async (newContactData: ContactInsert): Promise<Contact> => {
    if (!newContactData.user_id) {
      throw new Error('User ID is required to create a contact.');
    }
    if (!newContactData.linkedin_url) {
      throw new Error('LinkedIn URL is required to create a contact through this flow.');
    }

    const { data, error } = await supabase
      .from(CONTACTS_TABLE)
      .insert(newContactData) 
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating contact:', error);
      throw new Error(error.message);
    }
    if (!data) throw new Error('Contact creation failed, no data returned.');
    return data as Contact; // Cast to local Contact type if its structure is a subset or matches Row
  }, []);

  const createContactMutation = useMutation<
    Contact, 
    Error, 
    ContactInsert,
    { previousContacts?: Contact[]; optimisticContact: Contact }
  >({
    mutationFn: createContactDB,
    // OPTIMIZATION: Add optimistic updates for better perceived performance
    onMutate: async (newContactData) => {
      // Cancel outgoing refetches to avoid optimistic update conflicts
      await queryClient.cancelQueries({ queryKey: [CONTACTS_TABLE] });
      
      // Snapshot the previous value for rollback
      const previousContacts = queryClient.getQueryData<Contact[]>([CONTACTS_TABLE]);
      
      // Create optimistic contact with temporary ID
      const optimisticContact: Contact = {
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...newContactData,
      } as Contact;
      
      // Optimistically update the contacts list
      queryClient.setQueryData([CONTACTS_TABLE], (old: Contact[] | undefined) => {
        return old ? [optimisticContact, ...old] : [optimisticContact];
      });
      
      return { previousContacts, optimisticContact };
    },
    onSuccess: (newContact, variables, context) => {
      // Replace optimistic contact with real contact
      queryClient.setQueryData([CONTACTS_TABLE], (old: Contact[] | undefined) => {
        if (!old || !context) return old;
        return old.map(contact => 
          contact.id === context.optimisticContact.id ? newContact : contact
        );
      });
      queryClient.setQueryData([CONTACTS_TABLE, newContact.id], newContact);
    },
    onError: (error, variables, context) => {
      console.error('Mutation error creating contact:', error.message);
      // Rollback optimistic update on error
      if (context?.previousContacts) {
        queryClient.setQueryData([CONTACTS_TABLE], context.previousContacts);
      }
    }
  });

  // Update an existing contact
  const updateContact = React.useCallback(async (updatedContact: Partial<Contact> & Pick<Contact, 'id'>): Promise<Contact> => {
    const { id, ...updateData } = updatedContact;
    const { data, error } = await supabase
      .from(CONTACTS_TABLE)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Contact update failed, no data returned.');
    return data;
  }, []);

  const updateContactMutation = useMutation<
    Contact, 
    Error, 
    Partial<Contact> & Pick<Contact, 'id'>,
    { previousContacts?: Contact[]; previousContact?: Contact; id: string }
  >({
    mutationFn: updateContact,
    // OPTIMIZATION: Add optimistic updates for contact updates
    onMutate: async (updatedContactData) => {
      const { id } = updatedContactData;
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [CONTACTS_TABLE] });
      await queryClient.cancelQueries({ queryKey: [CONTACTS_TABLE, id] });
      
      // Snapshot previous values for rollback
      const previousContacts = queryClient.getQueryData<Contact[]>([CONTACTS_TABLE]);
      const previousContact = queryClient.getQueryData<Contact>([CONTACTS_TABLE, id]);
      
      // Optimistically update the contact in the list
      queryClient.setQueryData([CONTACTS_TABLE], (old: Contact[] | undefined) => {
        if (!old) return old;
        return old.map(contact => 
          contact.id === id 
            ? { ...contact, ...updatedContactData, updated_at: new Date().toISOString() }
            : contact
        );
      });
      
      // Optimistically update the individual contact
      queryClient.setQueryData([CONTACTS_TABLE, id], (old: Contact | undefined) => {
        if (!old) return old;
        return { ...old, ...updatedContactData, updated_at: new Date().toISOString() };
      });
      
      return { previousContacts, previousContact, id };
    },
    onSuccess: (updatedContact) => {
      // Update with real data from server
      queryClient.setQueryData([CONTACTS_TABLE], (old: Contact[] | undefined) => {
        if (!old) return old;
        return old.map(contact => 
          contact.id === updatedContact.id ? updatedContact : contact
        );
      });
      queryClient.setQueryData([CONTACTS_TABLE, updatedContact.id], updatedContact);
    },
    onError: (error, variables, context) => {
      console.error('Mutation error updating contact:', error.message);
      // Rollback optimistic updates on error
      if (context?.previousContacts) {
        queryClient.setQueryData([CONTACTS_TABLE], context.previousContacts);
      }
      if (context?.previousContact && context?.id) {
        queryClient.setQueryData([CONTACTS_TABLE, context.id], context.previousContact);
      }
    }
  });

  // Delete a contact
  const deleteContact = React.useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase.from(CONTACTS_TABLE).delete().eq('id', id);
    if (error) throw new Error(error.message);
  }, []);

  const deleteContactMutation = useMutation<void, Error, string>({
    mutationFn: deleteContact,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [CONTACTS_TABLE] });
      // Remove the specific contact query from cache
      queryClient.removeQueries({ queryKey: [CONTACTS_TABLE, id] });
    },
  });

  return {
    // Queries
    contacts,
    isLoadingContacts,
    contactsError,
    getContactById, // Exposing this for direct use if needed, e.g. in server components or other hooks
    prefetchContact,

    // Mutations
    createContact: createContactMutation.mutateAsync,
    isCreatingContact: createContactMutation.isPending,
    createContactError: createContactMutation.error,
    
    updateContact: updateContactMutation.mutateAsync,
    isUpdatingContact: updateContactMutation.isPending,
    updateContactError: updateContactMutation.error,

    deleteContact: deleteContactMutation.mutateAsync,
    isDeletingContact: deleteContactMutation.isPending,
    deleteContactError: deleteContactMutation.error,
  };
}; 