import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, logAdminAction } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/admin/user-feature-overrides
 * Create or update a user feature flag override
 */
export async function POST(request: NextRequest) {
  const adminResult = await requireAdmin();
  if (!adminResult.isAdmin) {
    return adminResult.response;
  }

  try {
    const body = await request.json();
    const { user_id, feature_flag_id, enabled } = body;

    // Validate required fields
    if (!user_id || !feature_flag_id || enabled === undefined) {
      return NextResponse.json(
        { error: 'user_id, feature_flag_id, and enabled are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify the user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', user_id)
      .single();

    if (userError) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify the feature flag exists
    const { data: flag, error: flagError } = await supabase
      .from('feature_flags')
      .select('id, name')
      .eq('id', feature_flag_id)
      .single();

    if (flagError) {
      return NextResponse.json(
        { error: 'Feature flag not found' },
        { status: 404 }
      );
    }

    // Upsert the user feature override
    const { data, error } = await supabase
      .from('user_feature_overrides')
      .upsert({
        user_id,
        feature_flag_id,
        enabled: Boolean(enabled)
      }, {
        onConflict: 'user_id,feature_flag_id'
      })
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
      console.error('Error creating user feature override:', error);
      return NextResponse.json(
        { error: 'Failed to create user feature override' },
        { status: 500 }
      );
    }

    await logAdminAction(
      adminResult.user!.id,
      'create',
      'user_feature_override',
      data.id,
      { 
        user_email: user.email,
        flag_name: flag.name,
        enabled 
      },
      request
    );

    return NextResponse.json({ override: data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/user-feature-overrides:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/user-feature-overrides
 * Get user feature overrides with optional filtering
 */
export async function GET(request: NextRequest) {
  const adminResult = await requireAdmin();
  if (!adminResult.isAdmin) {
    return adminResult.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const flagId = searchParams.get('feature_flag_id');

    const supabase = await createClient();

    let query = supabase
      .from('user_feature_overrides')
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
      .order('created_at', { ascending: false });

    // Apply filters if provided
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (flagId) {
      query = query.eq('feature_flag_id', flagId);
    }

    const { data: overrides, error } = await query;

    if (error) {
      console.error('Error fetching user feature overrides:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user feature overrides' },
        { status: 500 }
      );
    }

    await logAdminAction(
      adminResult.user!.id,
      'read',
      'user_feature_override',
      undefined,
      { action: 'list_overrides', filters: { userId, flagId } },
      request
    );

    return NextResponse.json({ overrides });
  } catch (error) {
    console.error('Error in GET /api/admin/user-feature-overrides:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}