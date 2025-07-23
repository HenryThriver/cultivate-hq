import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, logAdminAction } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/feature-flags/[id]
 * Get a specific feature flag with detailed information
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const adminResult = await requireAdmin();
  if (!adminResult.isAdmin) {
    return adminResult.response;
  }

  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get the feature flag with user overrides
    const { data: flag, error } = await supabase
      .from('feature_flags')
      .select(`
        id,
        name,
        description,
        enabled_globally,
        created_at,
        updated_at,
        user_feature_overrides(
          id,
          user_id,
          enabled,
          created_at,
          users(id, email, full_name)
        )
      `)
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

    await logAdminAction(
      adminResult.user!.id,
      'read',
      'feature_flag',
      id,
      { action: 'get_flag_details' },
      request
    );

    return NextResponse.json({ flag });
  } catch (error) {
    console.error('Error in GET /api/admin/feature-flags/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/feature-flags/[id]
 * Update a feature flag
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const adminResult = await requireAdmin();
  if (!adminResult.isAdmin) {
    return adminResult.response;
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, enabled_globally } = body;

    // Validate name format if provided
    if (name && !/^[a-z0-9_-]+$/.test(name)) {
      return NextResponse.json(
        { error: 'Name must contain only lowercase letters, numbers, hyphens, and underscores' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Build update object with only provided fields
    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (enabled_globally !== undefined) updates.enabled_globally = Boolean(enabled_globally);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided for update' },
        { status: 400 }
      );
    }

    // Update the feature flag
    const { data, error } = await supabase
      .from('feature_flags')
      .update(updates)
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

    await logAdminAction(
      adminResult.user!.id,
      'update',
      'feature_flag',
      id,
      { updates },
      request
    );

    return NextResponse.json({ flag: data });
  } catch (error) {
    console.error('Error in PUT /api/admin/feature-flags/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/feature-flags/[id]
 * Delete a feature flag
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const adminResult = await requireAdmin();
  if (!adminResult.isAdmin) {
    return adminResult.response;
  }

  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get flag details before deletion for logging
    const { data: flag } = await supabase
      .from('feature_flags')
      .select('name, description')
      .eq('id', id)
      .single();

    // Delete the feature flag (cascades to user_feature_overrides)
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

    await logAdminAction(
      adminResult.user!.id,
      'delete',
      'feature_flag',
      id,
      { deleted_flag: flag },
      request
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/feature-flags/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}