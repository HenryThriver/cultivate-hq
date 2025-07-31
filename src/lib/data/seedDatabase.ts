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
import { dummyContacts, dummyInsights, dummyActions, dummyAchievements } from './dummyData';
import type { Contact } from '@/types';

interface SeedOptions {
  userId: string;
  includeContacts?: boolean;
  includeArtifacts?: boolean;
  includeLoops?: boolean;
}

/**
 * Seed the database with executive-level dummy data
 */
export async function seedDatabase(options: SeedOptions) {
  const { userId, includeContacts = true, includeArtifacts = true, includeLoops = true } = options;
  
  console.log('🌱 Starting database seeding for sophisticated relationship portfolio...');
  
  try {
    let seededContacts: Contact[] = [];
    
    // 1. Seed Contacts
    if (includeContacts) {
      console.log('📊 Seeding executive contact profiles...');
      
      for (const contactData of dummyContacts) {
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
    }
    
    // 2. Seed Artifacts (Voice Memos, Meetings, etc.)
    if (includeArtifacts && seededContacts.length > 0) {
      console.log('🎯 Seeding strategic artifacts and insights...');
      
      // Create voice memo artifacts that generated the insights
      const voiceMemoArtifacts = [
        {
          contact_id: seededContacts[0]?.id, // Sarah Chen
          user_id: userId,
          type: 'voice_memo' as const,
          content: 'Coffee meeting recap: Sarah mentioned her need for a technical co-founder for her AI ethics startup. She\'s particularly interested in finding someone with ML infrastructure experience who shares her values around responsible AI development.',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
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
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          ai_parsing_status: 'completed' as const
        }
      ];
      
      for (const artifact of voiceMemoArtifacts) {
        const { error } = await supabase
          .from('artifacts')
          .insert(artifact);
          
        if (error) {
          console.error('Failed to insert artifact:', error);
        } else {
          console.log('✅ Created strategic artifact');
        }
      }
    }
    
    // 3. Seed Loops (POGs and Asks)
    if (includeLoops && seededContacts.length >= 2) {
      console.log('🔄 Seeding relationship loops and strategic exchanges...');
      
      // Create a POG loop for the Sarah-Marcus introduction
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
      
      const { error: loopError } = await supabase
        .from('artifacts')
        .insert(pogLoop);
        
      if (loopError) {
        console.error('Failed to insert loop:', loopError);
      } else {
        console.log('✅ Created strategic POG loop');
      }
    }
    
    console.log('🎉 Database seeding completed successfully!');
    console.log(`📈 Created ${seededContacts.length} executive contacts with strategic context`);
    
    return {
      success: true,
      seededContacts: seededContacts.length,
      message: 'Sophisticated relationship portfolio data seeded successfully'
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