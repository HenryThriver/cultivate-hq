/**
 * Types for network intelligence features
 */

export interface ContactRelationship {
  id: string;
  contact_a_id: string;
  contact_b_id: string;
  relationship_type: 'introduced_by_me' | 'known_connection' | 'target_connection';
  strength: 'weak' | 'medium' | 'strong';
  context?: string;
  introduction_date?: string;
  introduction_successful?: boolean;
  created_at: string;
}

export interface GoalContactTarget {
  id: string;
  goal_id: string;
  contact_id: string;
  target_description: string;
  target_type: 'introduction' | 'information' | 'opportunity' | 'exploration';
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'achieved' | 'archived';
  achieved_at?: string;
  achievement_notes?: string;
  notes?: string;
  created_at: string;
  last_progress_update?: string;
}