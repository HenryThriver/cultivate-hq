import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin, logAdminAction } from '@/lib/auth/admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/feature-flags/[id]/toggle
 * Toggle a feature flag's global enabled status (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const adminResult = await requireAdmin();
    if (!adminResult.isAdmin) {
      return adminResult.response!;
    }

    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Feature flag ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // First get the current state
    const { data: currentFlag, error: fetchError } = await supabase
      .from('feature_flags')
      .select('name, enabled_globally')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Feature flag not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching feature flag:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch feature flag' },
        { status: 500 }
      );
    }

    // Toggle the enabled status
    const newEnabledStatus = !currentFlag.enabled_globally;
    
    const { data: flag, error: updateError } = await supabase
      .from('feature_flags')
      .update({ 
        enabled_globally: newEnabledStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error toggling feature flag:', updateError);
      return NextResponse.json(
        { error: 'Failed to toggle feature flag' },
        { status: 500 }
      );
    }

    if (adminResult.user) {
      await logAdminAction(
        adminResult.user.id,
        'TOGGLE_FEATURE_FLAG',
        'feature_flags',
        id,
        { 
          name: currentFlag.name,
          from: currentFlag.enabled_globally,
          to: newEnabledStatus
        },
        request
      );
    }

    return NextResponse.json({ 
      flag,
      message: `Feature flag ${newEnabledStatus ? 'enabled' : 'disabled'} globally`
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}