import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, logAdminAction } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/admin/user-feature-overrides/[id]
 * Update a user feature flag override
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const adminResult = await requireAdmin();
  if (!adminResult.isAdmin) {
    return adminResult.response;
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { enabled } = body;

    if (enabled === undefined) {
      return NextResponse.json(
        { error: 'enabled field is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Update the user feature override
    const { data, error } = await supabase
      .from('user_feature_overrides')
      .update({ enabled: Boolean(enabled) })
      .eq('id', id)
      .select(`
        id,
        user_id,
        feature_flag_id,
        enabled,
        created_at,
        updated_at,
        users(id, email, full_name),
        feature_flags(id, name, description)
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'User feature override not found' },
          { status: 404 }
        );
      }
      console.error('Error updating user feature override:', error);
      return NextResponse.json(
        { error: 'Failed to update user feature override' },
        { status: 500 }
      );
    }

    await logAdminAction(
      adminResult.user!.id,
      'update',
      'user_feature_override',
      id,
      { enabled },
      request
    );

    return NextResponse.json({ override: data });
  } catch (error) {
    console.error('Error in PUT /api/admin/user-feature-overrides/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/user-feature-overrides/[id]
 * Delete a user feature flag override
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const adminResult = await requireAdmin();
  if (!adminResult.isAdmin) {
    return adminResult.response;
  }

  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get override details before deletion for logging
    const { data: override } = await supabase
      .from('user_feature_overrides')
      .select(`
        id,
        enabled,
        users(email),
        feature_flags(name)
      `)
      .eq('id', id)
      .single();

    // Delete the user feature override
    const { error } = await supabase
      .from('user_feature_overrides')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'User feature override not found' },
          { status: 404 }
        );
      }
      console.error('Error deleting user feature override:', error);
      return NextResponse.json(
        { error: 'Failed to delete user feature override' },
        { status: 500 }
      );
    }

    await logAdminAction(
      adminResult.user!.id,
      'delete',
      'user_feature_override',
      id,
      { deleted_override: override },
      request
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/user-feature-overrides/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}