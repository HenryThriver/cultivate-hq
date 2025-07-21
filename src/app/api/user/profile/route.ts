import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile data (from users table with self-contact info)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      // If no user record exists, this should have been created by the trigger
      // but we can create it manually as a fallback using upsert to prevent race conditions
      if (profileError.code === 'PGRST116') {
        // Use upsert to handle race conditions
        const { data: createdUser, error: createError } = await supabase
          .from('users')
          .upsert({
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.full_name || user.email || 'My Profile',
            subscription_status: 'free',
            preferences: {},
            notification_settings: {}
          }, {
            onConflict: 'id'
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user record:', createError);
          return NextResponse.json(
            { error: 'Failed to create user profile' },
            { status: 500 }
          );
        }

        // Also ensure onboarding state exists
        const { error: onboardingError } = await supabase
          .from('onboarding_state')
          .insert({
            user_id: user.id,
            current_screen: 1,
            completed_screens: [],
            started_at: new Date().toISOString(),
            last_activity_at: new Date().toISOString(),
          })
          .select()
          .single();

        // Don't fail if onboarding state already exists
        if (onboardingError && onboardingError.code !== '23505') {
          console.warn('Warning: Could not create onboarding state:', onboardingError);
        }

        // Return the created user as profile (the trigger should have created self-contact)
        return NextResponse.json({ profile: createdUser });
      }

      console.error('Error fetching user profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error in GET /api/user/profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Handle initial goal creation at category selection
    if (body.create_initial_goal) {
      const { goal_category } = body;

      // Validate goal category
      const VALID_GOAL_CATEGORIES = ['career', 'business', 'personal', 'learning', 'networking', 'health'];
      if (!goal_category || !VALID_GOAL_CATEGORIES.includes(goal_category)) {
        return NextResponse.json(
          { error: 'Invalid goal category. Must be one of: ' + VALID_GOAL_CATEGORIES.join(', ') },
          { status: 400 }
        );
      }

      // Create initial goal record with just category
      const { data: newGoal, error: goalError } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          title: `Goal: ${goal_category}`, // Temporary title, will be updated by AI
          description: 'Goal details will be added from voice memo analysis.',
          category: goal_category,
          created_from: 'onboarding',
          status: 'draft', // Draft until voice memo is processed
          is_primary: true
        })
        .select()
        .single();

      if (goalError) {
        console.error('Error creating initial goal:', goalError);
        return NextResponse.json({ error: 'Failed to create initial goal' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        goal: newGoal,
        message: 'Initial goal created successfully'
      });
    }
    
    // Handle updating an existing goal
    if (body.update_existing_goal) {
      const { goal_id, title, description } = body;

      if (!goal_id) {
        return NextResponse.json({ error: 'Goal ID is required for updates' }, { status: 400 });
      }

      // Update the existing goal record
      const { data: updatedGoal, error: goalUpdateError } = await supabase
        .from('goals')
        .update({
          title: title,
          description: description
        })
        .eq('id', goal_id)
        .eq('user_id', user.id) // Ensure user owns the goal
        .select()
        .single();

      if (goalUpdateError) {
        console.error('Error updating goal:', goalUpdateError);
        return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
      }

      // Also update the user profile to maintain consistency
      const { error: profileUpdateError } = await supabase
        .from('users')
        .update({
          primary_goal: title,
          goal_description: description
        })
        .eq('id', user.id);

      if (profileUpdateError) {
        console.warn('Warning: Failed to update user profile with goal changes:', profileUpdateError);
        // Don't fail the operation since the goal update succeeded
      }

      return NextResponse.json({ 
        success: true, 
        goal: updatedGoal,
        message: 'Goal updated successfully'
      });
    }
    
    // Handle associating contacts with existing goal
    if (body.associate_contacts_with_goal) {
      const { goal_id, imported_contacts } = body;

      if (!goal_id || !imported_contacts || imported_contacts.length === 0) {
        return NextResponse.json({ error: 'Goal ID and contacts are required' }, { status: 400 });
      }

      // Associate imported contacts with the goal
      const goalContactInserts = imported_contacts.map((contact: any) => ({
        user_id: user.id,
        goal_id: goal_id,
        contact_id: contact.id,
        relevance_score: 0.8, // High relevance since manually selected
        notes: `Added during onboarding for goal achievement`
      }));

      const { error: goalContactError } = await supabase
        .from('goal_contacts')
        .insert(goalContactInserts);

      if (goalContactError) {
        console.error('Error associating contacts with goal:', goalContactError);
        return NextResponse.json({ error: 'Failed to associate contacts with goal' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        contacts_associated: imported_contacts.length,
        message: 'Contacts associated with goal successfully'
      });
    }
    
    // Handle goal creation from onboarding
    if (body.create_goal_from_onboarding) {
      const { 
        goal_category, 
        voice_memo_id, 
        primary_goal, 
        goal_description,
        imported_contacts 
      } = body;

      // Create comprehensive goal record
      const { data: newGoal, error: goalError } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          title: primary_goal,
          description: goal_description,
          category: goal_category,
          voice_memo_id: voice_memo_id,
          created_from: 'onboarding',
          status: 'active',
          is_primary: true
        })
        .select()
        .single();

      if (goalError) {
        console.error('Error creating goal:', goalError);
        return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
      }

      // Associate imported contacts with the goal
      if (imported_contacts && imported_contacts.length > 0) {
        const goalContactInserts = imported_contacts.map((contact: any) => ({
          user_id: user.id,
          goal_id: newGoal.id,
          contact_id: contact.id,
          relevance_score: 0.8, // High relevance since manually selected
          notes: `Added during onboarding for goal: ${primary_goal}`
        }));

        const { error: goalContactError } = await supabase
          .from('goal_contacts')
          .insert(goalContactInserts);

        if (goalContactError) {
          console.error('Error associating contacts with goal:', goalContactError);
          // Don't fail the whole operation
        }
      }

      return NextResponse.json({ 
        success: true, 
        goal: newGoal,
        message: 'Goal created successfully from onboarding data'
      });
    }

    // Existing profile update logic
    const userUpdates: Record<string, any> = {};
    const contactUpdates: Record<string, any> = {};

    // Handle user-level updates
    if (body.primary_goal !== undefined) {
      userUpdates.primary_goal = body.primary_goal;
    }
    if (body.goal_description !== undefined) {
      userUpdates.goal_description = body.goal_description;
    }

    // Handle contact-level updates (linkedin_url goes to self-contact)
    if (body.linkedin_url !== undefined) {
      contactUpdates.linkedin_url = body.linkedin_url;
    }

    // Update user profile if there are user-level changes
    if (Object.keys(userUpdates).length > 0) {
      const { error: userUpdateError } = await supabase
        .from('users')
        .update(userUpdates)
        .eq('id', user.id);

      if (userUpdateError) {
        console.error('Error updating user profile:', userUpdateError);
        return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
      }
    }

    // Update self-contact if there are contact-level changes
    if (Object.keys(contactUpdates).length > 0) {
      const { error: contactUpdateError } = await supabase
        .from('contacts')
        .update(contactUpdates)
        .eq('user_id', user.id)
        .eq('is_self_contact', true);

      if (contactUpdateError) {
        console.error('Error updating self-contact:', contactUpdateError);
        return NextResponse.json({ error: 'Failed to update contact info' }, { status: 500 });
      }
    }

    // Get the updated profile data
    const { data: updatedProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      console.error('Error fetching updated profile:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch updated profile' }, { status: 500 });
    }

    return NextResponse.json({ profile: updatedProfile });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 