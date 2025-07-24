import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import type { 
  AdminAction, 
  AdminResourceType, 
  AuditDetails,
  LogAdminActionParams 
} from '@/types/database-rpc';

/**
 * Result type for admin check operations
 */
export interface AdminCheckResult {
  isAdmin: boolean;
  user: User | null;
  error: string | null;
  response: NextResponse | null;
}

/**
 * Checks if the current authenticated user has admin privileges
 * Returns appropriate error responses for unauthorized or non-admin users
 */
export async function checkIsAdmin(): Promise<AdminCheckResult> {
  const supabase = await createClient();
  
  // Get current authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return {
      isAdmin: false,
      user: null,
      error: 'Unauthorized',
      response: NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      )
    };
  }

  // Check if user has admin privileges
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (userError) {
    console.error('Error checking admin status:', userError);
    return {
      isAdmin: false,
      user,
      error: 'Database error',
      response: NextResponse.json(
        { error: 'Internal server error' }, 
        { status: 500 }
      )
    };
  }

  if (!userData?.is_admin) {
    return {
      isAdmin: false,
      user,
      error: 'Forbidden',
      response: NextResponse.json(
        { error: 'Admin access required' }, 
        { status: 403 }
      )
    };
  }

  return {
    isAdmin: true,
    user,
    error: null,
    response: null
  };
}

/**
 * Middleware function to protect API routes with admin access
 * Usage: const adminResult = await requireAdmin(); if (!adminResult.isAdmin) return adminResult.response;
 */
export async function requireAdmin(): Promise<AdminCheckResult> {
  return await checkIsAdmin();
}

/**
 * Logs an admin action to the audit log with type safety
 */
export async function logAdminAction(
  adminUserId: string,
  action: AdminAction,
  resourceType: AdminResourceType,
  resourceId?: string,
  details?: AuditDetails,
  request?: Request
): Promise<void> {
  try {
    const supabase = await createClient();
    
    // Extract IP and user agent from request if provided
    let ipAddress: string | null = null;
    let userAgent: string | null = null;
    
    if (request) {
      // Get IP address from various headers
      ipAddress = request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 request.headers.get('cf-connecting-ip') ||
                 null;
      
      userAgent = request.headers.get('user-agent');
    }

    const rpcParams: LogAdminActionParams = {
      p_admin_user_id: adminUserId,
      p_action: action,
      p_resource_type: resourceType,
      p_resource_id: resourceId || null,
      p_details: details ? JSON.stringify(details) : null,
      p_ip_address: ipAddress,
      p_user_agent: userAgent
    };

    // TODO: Uncomment when log_admin_action RPC function is created in database
    // const { error: rpcError } = await supabase.rpc('log_admin_action', rpcParams);
    // 
    // if (rpcError) {
    //   console.error('RPC error logging admin action:', rpcError);
    //   throw rpcError;
    // }
    
    // Temporary: Log to console until RPC function is implemented
    console.log('Admin action logged:', rpcParams);
  } catch (error) {
    console.error('Failed to log admin action:', error);
    // Don't throw - logging should not break the main operation
  }
}

/**
 * Client-side hook to check if current user is admin
 * This should only be used for UI display purposes, not security
 */
export function useIsAdmin() {
  // This will be implemented in the client-side hooks file
  // For now, return a placeholder
  return { isAdmin: false, loading: true };
}