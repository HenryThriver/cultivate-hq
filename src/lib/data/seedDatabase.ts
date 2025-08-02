/**
 * Database Seeding Script for Local Development
 * 
 * This script can be used to populate the local Supabase database with
 * compelling dummy data for testing and demonstration purposes.
 * 
 * Usage:
 * - Run during onboarding to show what a mature relationship portfolio looks like
 * - Use for testing dashboard components with realistic data
 * - Demonstrate relationship intelligence capabilities to stakeholders
 */

import { supabase } from '@/lib/supabase/client';
import { dummyContacts } from './dummyData';
import type { Contact } from '@/types';

interface SeedOptions {
  userId: string;
  includeContacts?: boolean;
  includeArtifacts?: boolean;
  includeLoops?: boolean;
}

// Helper to generate realistic action counts across weeks
const actionsThisWeek = 0;

/**
 * Seed the database with executive-level dummy data
 */
export async function seedDatabase(options: SeedOptions) {
  const { userId, includeContacts = true, includeArtifacts = true, includeLoops = true } = options;
  
  console.log('🌱 Starting database seeding for sophisticated relationship portfolio...');
  
  try {
    const seededContacts: Contact[] = [];
    const seededGoals: Array<{id: string; title: string}> = [];
    
    // 1. Create Strategic Goals first
    console.log('🎯 Creating strategic goals...');
    
    const goals = [
      {
        user_id: userId,
        title: 'Expand executive network in AI space',
        description: 'Build relationships with 20+ AI leaders for strategic partnerships',
        category: 'networking',
        status: 'active',
        progress_percentage: 65,
        target_contact_count: 20,
        is_primary: true
      },
      {
        user_id: userId,
        title: 'Secure board position at growth-stage startup',
        description: 'Leverage network to identify and secure board opportunity',
        category: 'career',
        status: 'active',
        progress_percentage: 45,
        target_contact_count: 10
      }
    ];
    
    for (const goal of goals) {
      const { data, error } = await supabase
        .from('goals')
        .insert(goal)
        .select()
        .single();
        
      if (!error && data) {
        seededGoals.push(data);
        console.log(`✅ Created goal: ${goal.title}`);
      }
    }
    
    // 2. Seed Contacts with relationship scores
    if (includeContacts) {
      console.log('📊 Seeding executive contact profiles...');
      
      const contactsWithScores = dummyContacts.map((contact, index) => ({
        ...contact,
        relationship_score: 6 + Math.floor(index * 0.8), // Scores from 6-9
        last_interaction_date: new Date(Date.now() - (index + 1) * 7 * 24 * 60 * 60 * 1000).toISOString()
      }));
      
      for (const contactData of contactsWithScores) {
        const contactToInsert = {
          ...contactData,
          user_id: userId,
          // Convert JSON fields to proper format
          professional_context: JSON.stringify(contactData.professional_context),
          personal_context: JSON.stringify(contactData.personal_context),
        };
        
        const { data: contact, error } = await supabase
          .from('contacts')
          .insert(contactToInsert)
          .select()
          .single();
          
        if (error) {
          console.error(`Failed to insert contact ${contactData.name}:`, error);
        } else {
          seededContacts.push(contact as Contact);
          console.log(`✅ Created contact: ${contactData.name}`);
        }
      }
      
      // Link contacts to goals
      if (seededGoals.length > 0 && seededContacts.length > 0) {
        console.log('🔗 Linking strategic contacts to goals...');
        
        const goalContacts = [
          {
            user_id: userId,
            goal_id: seededGoals[0].id, // AI network goal
            contact_id: seededContacts[0]?.id, // Sarah Chen
            relevance_score: 9,
            how_they_help: 'Key AI leader with partnership opportunities',
            status: 'active'
          },
          {
            user_id: userId,
            goal_id: seededGoals[0].id,
            contact_id: seededContacts[1]?.id, // Marcus Rodriguez
            relevance_score: 8,
            how_they_help: 'CTO with deep technical expertise and network',
            status: 'active'
          },
          {
            user_id: userId,
            goal_id: seededGoals[1].id, // Board position goal
            contact_id: seededContacts[2]?.id, // Jennifer Walsh
            relevance_score: 10,
            how_they_help: 'Former CEO with board experience and connections',
            status: 'active'
          }
        ];
        
        for (const gc of goalContacts) {
          await supabase.from('goal_contacts').insert(gc);
        }
      }
    }
    
    // 3. Seed comprehensive artifacts and actions for KPI data
    if (includeArtifacts && seededContacts.length > 0) {
      console.log('📈 Seeding artifacts, actions, and sessions for KPI tracking...');
      
      // Create relationship sessions spanning the quarter
      const sessions = [];
      for (let week = 0; week < 12; week++) {
        const sessionDate = new Date(Date.now() - (week * 7 + 2) * 24 * 60 * 60 * 1000);
        
        const session = {
          user_id: userId,
          session_type: 'strategic',
          status: 'completed',
          started_at: sessionDate.toISOString(),
          completed_at: new Date(sessionDate.getTime() + 45 * 60 * 1000).toISOString(),
          duration_minutes: 45,
          actions_completed: 3 + Math.floor(Math.random() * 3),
          goal_id: seededGoals[0]?.id
        };
        
        const { data: sessionData } = await supabase
          .from('relationship_sessions')
          .insert(session)
          .select()
          .single();
          
        if (sessionData) {
          sessions.push(sessionData);
        }
      }
      
      // Create actions distributed across the quarter
      const actionTypes = ['pog', 'ask', 'follow_up', 'connection'];
      let actionCount = 0;
      
      for (let week = 0; week < 12; week++) {
        const actionsThisWeek = 3 + Math.floor(week / 3); // Increasing trend
        
        for (let i = 0; i < actionsThisWeek; i++) {
          const dayOffset = week * 7 + Math.floor(Math.random() * 7);
          const actionDate = new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000);
          const contactIndex = Math.floor(Math.random() * Math.min(3, seededContacts.length));
          
          const action = {
            user_id: userId,
            contact_id: seededContacts[contactIndex]?.id,
            action_type: actionTypes[Math.floor(Math.random() * actionTypes.length)],
            title: `Strategic ${actionTypes[i % actionTypes.length]} action`,
            status: week < 10 ? 'completed' : 'pending', // Recent actions might be pending
            priority: 'high',
            created_at: actionDate.toISOString(),
            completed_at: week < 10 ? new Date(actionDate.getTime() + 24 * 60 * 60 * 1000).toISOString() : null,
            session_id: sessions[week]?.id,
            goal_id: seededGoals[Math.floor(Math.random() * seededGoals.length)]?.id
          };
          
          await supabase.from('actions').insert(action);
          actionCount++;
        }
      }
      
      console.log(`✅ Created ${actionCount} strategic actions`);
      
      // Create artifacts (responses to outreach)
      const artifactTypes = ['email', 'meeting', 'voice_memo', 'linkedin_message'];
      
      for (let week = 0; week < 12; week++) {
        const responseRate = 0.4 + (week / 12) * 0.35; // 40% to 75% response rate trend
        const artifactsThisWeek = Math.floor(actionsThisWeek * responseRate);
        
        for (let i = 0; i < artifactsThisWeek; i++) {
          const dayOffset = week * 7 + Math.floor(Math.random() * 7) + 1; // Day after action
          const artifactDate = new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000);
          const contactIndex = Math.floor(Math.random() * Math.min(3, seededContacts.length));
          
          const artifact = {
            contact_id: seededContacts[contactIndex]?.id,
            user_id: userId,
            type: artifactTypes[Math.floor(Math.random() * artifactTypes.length)] as 'email' | 'meeting',
            content: 'Response to strategic outreach - positive engagement',
            timestamp: artifactDate.toISOString(),
            ai_parsing_status: 'completed'
          };
          
          await supabase.from('artifacts').insert(artifact);
        }
      }
      
      // Create specific strategic artifacts
      const strategicArtifacts = [
        {
          contact_id: seededContacts[0]?.id, // Sarah Chen
          user_id: userId,
          type: 'voice_memo' as const,
          content: 'Coffee meeting recap: Sarah mentioned her need for a technical co-founder for her AI ethics startup. She\'s particularly interested in finding someone with ML infrastructure experience who shares her values around responsible AI development.',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          ai_parsing_status: 'completed' as const
        },
        {
          contact_id: seededContacts[2]?.id, // Jennifer Walsh
          user_id: userId,
          type: 'meeting' as const,
          content: JSON.stringify({
            title: 'Strategic Advisory Discussion',
            duration_minutes: 45,
            key_topics: ['Board positioning', 'Strategic advisory opportunities', 'Industry trends'],
            summary: 'Jennifer is actively evaluating board positions at high-growth companies. She mentioned her interest in companies focused on digital transformation and sustainable technology.'
          }),
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          ai_parsing_status: 'completed' as const
        }
      ];
      
      for (const artifact of strategicArtifacts) {
        await supabase.from('artifacts').insert(artifact);
      }
    }
    
    // 4. Seed Loops and Strategic Wins
    if (includeLoops && seededContacts.length >= 2) {
      console.log('🔄 Seeding loops, milestones, and strategic wins...');
      
      // Create loops
      const pogLoop = {
        contact_id: seededContacts[0]?.id, // Sarah Chen
        user_id: userId,
        type: 'loop' as const,
        content: JSON.stringify({
          type: 'INTRODUCTION',
          status: 'COMPLETED',
          title: 'Strategic AI Partnership Introduction',
          description: 'Facilitate introduction between Sarah Chen (TechFlow) and Marcus Rodriguez (InnovateAI) based on their complementary AI partnership needs',
          initiator: 'user',
          reciprocity_direction: 'giving',
          actions: [
            {
              id: 'action-1',
              status: 'COMPLETED',
              action_type: 'offer',
              notes: 'Initial introduction email sent',
              created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              completed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'action-2', 
              status: 'COMPLETED',
              action_type: 'delivery',
              notes: 'Successful partnership agreement signed - $2.3M ARR impact',
              created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            }
          ],
          completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          outcome: 'successful',
          satisfaction_score: 5,
          reciprocity_value: 5
        }),
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        ai_parsing_status: 'completed' as const
      };
      
      const { data: loopData, error: loopError } = await supabase
        .from('artifacts')
        .insert(pogLoop)
        .select()
        .single();
        
      if (loopError) {
        console.error('Failed to insert loop:', loopError);
      } else {
        console.log('✅ Created strategic POG loop');
        
        // Create loop analytics
        if (loopData) {
          await supabase.from('loop_analytics').insert({
            user_id: userId,
            contact_id: seededContacts[0]?.id,
            loop_artifact_id: loopData.id,
            loop_type: 'INTRODUCTION',
            status_transitions: {
              'QUEUED': new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              'ACTIVE': new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
              'COMPLETED': new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            completion_time_days: 6,
            reciprocity_impact: 9,
            success_score: 10
          });
        }
      }
      
      // Create goal milestones
      if (seededGoals.length > 0) {
        const milestones = [
          {
            user_id: userId,
            goal_id: seededGoals[0].id,
            title: 'Connected with 10 AI leaders',
            description: 'Reached halfway to target network size',
            status: 'completed',
            completed_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            order_index: 1
          },
          {
            user_id: userId,
            goal_id: seededGoals[0].id,
            title: 'Facilitated strategic partnership',
            description: 'Sarah-Marcus introduction led to $2.3M partnership',
            status: 'completed',
            completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            order_index: 2
          },
          {
            user_id: userId,
            goal_id: seededGoals[1].id,
            title: 'Board opportunity identified',
            description: 'Jennifer shared unlisted board position at growth startup',
            status: 'completed',
            completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            order_index: 1
          }
        ];
        
        for (const milestone of milestones) {
          await supabase.from('goal_milestones').insert(milestone);
        }
        
        console.log('✅ Created goal milestones');
      }
      
      // Create completed asks
      const asks = [
        {
          user_id: userId,
          contact_id: seededContacts[2]?.id, // Jennifer
          action_type: 'ask',
          title: 'Introduction to board opportunities',
          status: 'completed',
          priority: 'high',
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          goal_id: seededGoals[1]?.id
        },
        {
          user_id: userId,
          contact_id: seededContacts[0]?.id, // Sarah
          action_type: 'ask',
          title: 'Feedback on AI strategy document',
          status: 'completed',
          priority: 'medium',
          created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
          goal_id: seededGoals[0]?.id
        }
      ];
      
      for (const ask of asks) {
        await supabase.from('actions').insert(ask);
      }
      
      console.log('✅ Created strategic asks');
    }
    
    console.log('🎉 Database seeding completed successfully!');
    console.log(`📈 Created ${seededContacts.length} executive contacts with strategic context`);
    console.log(`🎯 Created ${seededGoals.length} strategic goals with milestones`);
    console.log(`💪 Seeded 12 weeks of relationship momentum data`);
    
    return {
      success: true,
      seededContacts: seededContacts.length,
      seededGoals: seededGoals.length,
      message: 'Sophisticated relationship portfolio with KPI data seeded successfully'
    };
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Clear all seeded data (useful for re-seeding)
 */
export async function clearSeedData(userId: string) {
  console.log('🧹 Clearing existing seed data...');
  
  try {
    // Delete in reverse dependency order
    await supabase.from('artifacts').delete().eq('user_id', userId);
    await supabase.from('contacts').delete().eq('user_id', userId);
    
    console.log('✅ Seed data cleared successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to clear seed data:', error);
    return { success: false, error };
  }
}

/**
 * Check if user already has seeded data
 */
export async function checkExistingSeedData(userId: string) {
  const { data: contacts } = await supabase
    .from('contacts')
    .select('id')
    .eq('user_id', userId)
    .limit(1);
    
  return contacts && contacts.length > 0;
}