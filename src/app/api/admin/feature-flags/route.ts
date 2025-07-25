import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin, logAdminAction } from '@/lib/auth/admin';

/**
 * GET /api/admin/feature-flags
 * Get all feature flags (admin only)
 */
export async function GET(): Promise<NextResponse> {
  try {
    const adminResult = await requireAdmin();
    if (!adminResult.isAdmin) {
      return adminResult.response!;
    }

    const supabase = await createClient();
    
    const { data: flags, error } = await supabase
      .from('feature_flags')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching feature flags:', error);
      return NextResponse.json(
        { error: 'Failed to fetch feature flags' },
        { status: 500 }
      );
    }

    if (adminResult.user) {
      await logAdminAction(
        adminResult.user.id,
        'LIST_FEATURE_FLAGS',
        'feature_flags'
      );
    }

    return NextResponse.json({ flags });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/feature-flags
 * Create a new feature flag (admin only)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const adminResult = await requireAdmin();
    if (!adminResult.isAdmin) {
      return adminResult.response!;
    }

    const body = await request.json();
    const { name, description, enabled_globally = false } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Flag name is required and must be a string' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    const { data: flag, error } = await supabase
      .from('feature_flags')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
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

    if (adminResult.user) {
      await logAdminAction(
        adminResult.user.id,
        'CREATE_FEATURE_FLAG',
        'feature_flags',
        flag.id,
        { name, description, enabled_globally },
        request
      );
    }

    return NextResponse.json({ flag }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}