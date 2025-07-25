import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin, logAdminAction } from '@/lib/auth/admin';

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/admin/feature-flags/[id]
 * Get a specific feature flag (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const adminResult = await requireAdmin();
    if (!adminResult.isAdmin) {
      return adminResult.response!;
    }

    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Feature flag ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    const { data: flag, error } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Feature flag not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching feature flag:', error);
      return NextResponse.json(
        { error: 'Failed to fetch feature flag' },
        { status: 500 }
      );
    }

    if (adminResult.user) {
      await logAdminAction(
        adminResult.user.id,
        'VIEW_FEATURE_FLAG',
        'feature_flags',
        id
      );
    }

    return NextResponse.json({ flag });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/feature-flags/[id]
 * Update a feature flag (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const adminResult = await requireAdmin();
    if (!adminResult.isAdmin) {
      return adminResult.response!;
    }

    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Feature flag ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, enabled_globally } = body;

    const supabase = await createClient();
    
    // Interface for feature flag update data
    interface FeatureFlagUpdate {
      name?: string;
      description?: string;
      enabled_globally?: boolean;
      updated_at: string;
    }
    
    // Build update object with only provided fields
    const updateData: FeatureFlagUpdate = {
      updated_at: new Date().toISOString()
    };
    
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return NextResponse.json(
          { error: 'Flag name must be a non-empty string' },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }
    
    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }
    
    if (enabled_globally !== undefined) {
      updateData.enabled_globally = Boolean(enabled_globally);
    }

    const { data: flag, error } = await supabase
      .from('feature_flags')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Feature flag not found' },
          { status: 404 }
        );
      }
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'A feature flag with this name already exists' },
          { status: 409 }
        );
      }
      console.error('Error updating feature flag:', error);
      return NextResponse.json(
        { error: 'Failed to update feature flag' },
        { status: 500 }
      );
    }

    if (adminResult.user) {
      await logAdminAction(
        adminResult.user.id,
        'UPDATE_FEATURE_FLAG',
        'feature_flags',
        id,
        updateData,
        request
      );
    }

    return NextResponse.json({ flag });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/feature-flags/[id]
 * Delete a feature flag (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const adminResult = await requireAdmin();
    if (!adminResult.isAdmin) {
      return adminResult.response!;
    }

    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Feature flag ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // First get the flag to log its details
    const { data: existingFlag } = await supabase
      .from('feature_flags')
      .select('name, description')
      .eq('id', id)
      .single();

    // Delete the feature flag (cascade will handle user_feature_overrides)
    const { error } = await supabase
      .from('feature_flags')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Feature flag not found' },
          { status: 404 }
        );
      }
      console.error('Error deleting feature flag:', error);
      return NextResponse.json(
        { error: 'Failed to delete feature flag' },
        { status: 500 }
      );
    }

    if (adminResult.user) {
      await logAdminAction(
        adminResult.user.id,
        'DELETE_FEATURE_FLAG',
        'feature_flags',
        id,
        existingFlag ? { name: existingFlag.name, description: existingFlag.description } : undefined,
        request
      );
    }

    return NextResponse.json(
      { message: 'Feature flag deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}