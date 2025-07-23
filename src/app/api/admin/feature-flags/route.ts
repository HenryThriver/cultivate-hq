import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, logAdminAction } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/feature-flags
 * Get all feature flags with their current settings
 */
export async function GET(request: NextRequest) {
  const adminResult = await requireAdmin();
  if (!adminResult.isAdmin) {
    return adminResult.response;
  }

  try {
    const supabase = await createClient();

    // Get all feature flags with user override counts
    const { data: flags, error } = await supabase
      .from('feature_flags')
      .select(`
        id,
        name,
        description,
        enabled_globally,
        created_at,
        updated_at,
        user_feature_overrides(count)
      `)
      .order('name');

    if (error) {
      console.error('Error fetching feature flags:', error);
      return NextResponse.json(
        { error: 'Failed to fetch feature flags' },
        { status: 500 }
      );
    }

    // Transform the data to include override counts
    const transformedFlags = flags.map(flag => ({
      ...flag,
      override_count: flag.user_feature_overrides?.[0]?.count || 0,
      user_feature_overrides: undefined // Remove the raw count data
    }));

    await logAdminAction(
      adminResult.user!.id,
      'read',
      'feature_flag',
      undefined,
      { action: 'list_all_flags' },
      request
    );

    return NextResponse.json({ flags: transformedFlags });
  } catch (error) {
    console.error('Error in GET /api/admin/feature-flags:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/feature-flags
 * Create a new feature flag
 */
export async function POST(request: NextRequest) {
  const adminResult = await requireAdmin();
  if (!adminResult.isAdmin) {
    return adminResult.response;
  }

  try {
    const body = await request.json();
    const { name, description, enabled_globally = false } = body;

    // Validate required fields
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate name format (lowercase, alphanumeric, hyphens, underscores)
    if (!/^[a-z0-9_-]+$/.test(name)) {
      return NextResponse.json(
        { error: 'Name must contain only lowercase letters, numbers, hyphens, and underscores' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Create the feature flag
    const { data, error } = await supabase
      .from('feature_flags')
      .insert({
        name,
        description: description || null,
        enabled_globally: Boolean(enabled_globally)
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'A feature flag with this name already exists' },
          { status: 409 }
        );
      }
      console.error('Error creating feature flag:', error);
      return NextResponse.json(
        { error: 'Failed to create feature flag' },
        { status: 500 }
      );
    }

    await logAdminAction(
      adminResult.user!.id,
      'create',
      'feature_flag',
      data.id,
      { name, description, enabled_globally },
      request
    );

    return NextResponse.json({ flag: data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/feature-flags:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}