/**
 * Bulk suggestion operations for contact relationships and actions
 */

interface Contact {
  id: string;
  name: string;
  title?: string;
  company?: string;
  email?: string;
  last_interaction?: Date;
  professional_context?: Record<string, unknown>;
  personal_context?: Record<string, unknown>;
}

interface NetworkRelationship {
  id: string;
  contact_a_id: string;
  contact_b_id: string;
  relationship_type: 'introduced_by_me' | 'known_connection' | 'target_connection';
  strength: 'weak' | 'medium' | 'strong';
  introduction_successful?: boolean;
  context?: string;
  created_at: Date;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
}

interface GoalTarget {
  id: string;
  goal_id: string;
  contact_id: string;
  target_description: string;
  target_type: 'introduction' | 'information' | 'opportunity' | 'exploration';
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'achieved' | 'archived';
}

interface Action {
  id: string;
  contact_id: string;
  title: string;
  description: string;
  type: 'pog' | 'ask' | 'follow_up' | 'introduction' | 'general';
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  due_date?: Date;
  suggested_by: 'ai' | 'user';
  confidence_score?: number; // 0-100
  context?: string;
}

export interface BulkSuggestion {
  id: string;
  type: 'relationship' | 'goal_target' | 'action' | 'introduction';
  title: string;
  description: string;
  confidence: number; // 0-100
  priority: 'high' | 'medium' | 'low';
  contacts: string[]; // Contact IDs involved
  suggestedAction: {
    type: string;
    data: Record<string, unknown>;
  };
  reasoning: string;
  timingOpportunity?: {
    type: 'career_event' | 'company_milestone' | 'personal_milestone' | 'follow_up_due';
    description: string;
    urgency: 'high' | 'medium' | 'low';
  };
}

/**
 * Analyzes contact network and generates relationship suggestions
 */
export function generateRelationshipSuggestions(
  contacts: Contact[],
  relationships: NetworkRelationship[],
  currentUserId: string
): BulkSuggestion[] {
  const suggestions: BulkSuggestion[] = [];

  // Find potential introductions
  const mutualConnectionSuggestions = findMutualConnectionOpportunities(
    contacts,
    relationships,
    currentUserId
  );
  suggestions.push(...mutualConnectionSuggestions);

  // Find weak relationships that could be strengthened
  const strengtheningSuggestions = findRelationshipStrengtheningOpportunities(
    contacts,
    relationships
  );
  suggestions.push(...strengtheningSuggestions);

  // Find dormant relationships to reactivate
  const reactivationSuggestions = findDormantRelationshipOpportunities(contacts);
  suggestions.push(...reactivationSuggestions);

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Generates goal-based action suggestions
 */
export function generateGoalActionSuggestions(
  goals: Goal[],
  goalTargets: GoalTarget[],
  contacts: Contact[],
  relationships: NetworkRelationship[]
): BulkSuggestion[] {
  const suggestions: BulkSuggestion[] = [];

  // For each active goal, analyze target contacts and suggest actions
  const activeGoals = goals.filter(g => g.isActive);

  for (const goal of activeGoals) {
    const goalTargetsForGoal = goalTargets.filter(gt => 
      gt.goal_id === goal.id && gt.status === 'active'
    );

    for (const target of goalTargetsForGoal) {
      const contact = contacts.find(c => c.id === target.contact_id);
      if (!contact) continue;

      // Suggest specific actions based on target type
      const actionSuggestions = generateTargetSpecificActions(
        goal,
        target,
        contact,
        relationships
      );
      suggestions.push(...actionSuggestions);
    }
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Finds opportunities for mutual connections/introductions
 */
function findMutualConnectionOpportunities(
  contacts: Contact[],
  relationships: NetworkRelationship[],
  currentUserId: string
): BulkSuggestion[] {
  const suggestions: BulkSuggestion[] = [];

  // Build a map of who knows whom
  const connectionMap = new Map<string, Set<string>>();
  
  relationships.forEach(rel => {
    if (!connectionMap.has(rel.contact_a_id)) {
      connectionMap.set(rel.contact_a_id, new Set());
    }
    if (!connectionMap.has(rel.contact_b_id)) {
      connectionMap.set(rel.contact_b_id, new Set());
    }
    
    connectionMap.get(rel.contact_a_id)!.add(rel.contact_b_id);
    connectionMap.get(rel.contact_b_id)!.add(rel.contact_a_id);
  });

  // Find contacts who might benefit from knowing each other
  for (let i = 0; i < contacts.length; i++) {
    for (let j = i + 1; j < contacts.length; j++) {
      const contactA = contacts[i];
      const contactB = contacts[j];

      // Skip if they already know each other
      if (connectionMap.get(contactA.id)?.has(contactB.id)) continue;

      // Check if they should be introduced based on professional context
      const introductionScore = calculateIntroductionValue(contactA, contactB);
      
      if (introductionScore > 60) {
        suggestions.push({
          id: `intro_${contactA.id}_${contactB.id}`,
          type: 'introduction',
          title: `Introduce ${contactA.name} to ${contactB.name}`,
          description: `Consider introducing these contacts based on mutual professional interests`,
          confidence: introductionScore,
          priority: introductionScore > 80 ? 'high' : 'medium',
          contacts: [contactA.id, contactB.id],
          suggestedAction: {
            type: 'create_introduction',
            data: {
              contactAId: contactA.id,
              contactBId: contactB.id,
              reason: generateIntroductionReason(contactA, contactB),
            },
          },
          reasoning: generateIntroductionReasoning(contactA, contactB),
        });
      }
    }
  }

  return suggestions;
}

/**
 * Finds relationships that could be strengthened
 */
function findRelationshipStrengtheningOpportunities(
  contacts: Contact[],
  relationships: NetworkRelationship[]
): BulkSuggestion[] {
  const suggestions: BulkSuggestion[] = [];

  const weakRelationships = relationships.filter(rel => 
    rel.strength === 'weak' && 
    rel.relationship_type === 'known_connection'
  );

  for (const relationship of weakRelationships) {
    const contactA = contacts.find(c => c.id === relationship.contact_a_id);
    const contactB = contacts.find(c => c.id === relationship.contact_b_id);
    
    if (!contactA || !contactB) continue;

    const strengtheningOpportunity = calculateStrengtheningOpportunity(
      contactA,
      contactB,
      relationship
    );

    if (strengtheningOpportunity > 50) {
      suggestions.push({
        id: `strengthen_${relationship.id}`,
        type: 'relationship',
        title: `Strengthen relationship with ${contactB.name}`,
        description: `Opportunity to deepen this relationship through targeted engagement`,
        confidence: strengtheningOpportunity,
        priority: strengtheningOpportunity > 75 ? 'high' : 'medium',
        contacts: [contactB.id],
        suggestedAction: {
          type: 'strengthen_relationship',
          data: {
            relationshipId: relationship.id,
            suggestedActions: generateStrengtheningActions(contactA, contactB),
          },
        },
        reasoning: generateStrengtheningReasoning(contactA, contactB, relationship),
      });
    }
  }

  return suggestions;
}

/**
 * Finds dormant relationships to reactivate
 */
function findDormantRelationshipOpportunities(contacts: Contact[]): BulkSuggestion[] {
  const suggestions: BulkSuggestion[] = [];
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);

  const dormantContacts = contacts.filter(contact => {
    if (!contact.last_interaction) return false;
    return contact.last_interaction < sixMonthsAgo;
  });

  for (const contact of dormantContacts) {
    const daysSinceLastInteraction = Math.floor(
      (now.getTime() - contact.last_interaction!.getTime()) / (1000 * 60 * 60 * 24)
    );

    const reactivationScore = calculateReactivationScore(contact, daysSinceLastInteraction);

    if (reactivationScore > 40) {
      suggestions.push({
        id: `reactivate_${contact.id}`,
        type: 'action',
        title: `Reconnect with ${contact.name}`,
        description: `Reactivate this relationship after ${Math.floor(daysSinceLastInteraction / 30)} months of inactivity`,
        confidence: reactivationScore,
        priority: reactivationScore > 70 ? 'high' : 'medium',
        contacts: [contact.id],
        suggestedAction: {
          type: 'create_action',
          data: {
            type: 'follow_up',
            title: `Reconnect with ${contact.name}`,
            description: generateReconnectionMessage(contact, daysSinceLastInteraction),
          },
        },
        reasoning: `Strong relationship dormant for ${Math.floor(daysSinceLastInteraction / 30)} months`,
      });
    }
  }

  return suggestions;
}

/**
 * Generates target-specific action suggestions
 */
function generateTargetSpecificActions(
  goal: Goal,
  target: GoalTarget,
  contact: Contact,
  relationships: NetworkRelationship[]
): BulkSuggestion[] {
  const suggestions: BulkSuggestion[] = [];

  switch (target.target_type) {
    case 'introduction':
      suggestions.push({
        id: `goal_intro_${target.id}`,
        type: 'action',
        title: `Request introduction from ${contact.name}`,
        description: `Leverage ${contact.name}'s network for ${goal.title}`,
        confidence: 75,
        priority: target.priority,
        contacts: [contact.id],
        suggestedAction: {
          type: 'create_action',
          data: {
            type: 'ask',
            title: `Introduction request - ${goal.title}`,
            description: target.target_description,
          },
        },
        reasoning: `${contact.name} is well-positioned to make strategic introductions for ${goal.title}`,
      });
      break;

    case 'information':
      suggestions.push({
        id: `goal_info_${target.id}`,
        type: 'action',
        title: `Gather insights from ${contact.name}`,
        description: `Leverage ${contact.name}'s expertise for ${goal.title}`,
        confidence: 80,
        priority: target.priority,
        contacts: [contact.id],
        suggestedAction: {
          type: 'create_action',
          data: {
            type: 'ask',
            title: `Insight gathering - ${goal.title}`,
            description: target.target_description,
          },
        },
        reasoning: `${contact.name}'s experience is valuable for achieving ${goal.title}`,
      });
      break;

    case 'opportunity':
      suggestions.push({
        id: `goal_opp_${target.id}`,
        type: 'action',
        title: `Explore opportunities with ${contact.name}`,
        description: `Discuss potential collaboration for ${goal.title}`,
        confidence: 70,
        priority: target.priority,
        contacts: [contact.id],
        suggestedAction: {
          type: 'create_action',
          data: {
            type: 'pog',
            title: `Opportunity exploration - ${goal.title}`,
            description: target.target_description,
          },
        },
        reasoning: `${contact.name} represents a strategic opportunity for ${goal.title}`,
      });
      break;

    case 'exploration':
      suggestions.push({
        id: `goal_explore_${target.id}`,
        type: 'action',
        title: `Build relationship with ${contact.name}`,
        description: `Strengthen connection for future ${goal.title} opportunities`,
        confidence: 65,
        priority: target.priority,
        contacts: [contact.id],
        suggestedAction: {
          type: 'create_action',
          data: {
            type: 'general',
            title: `Relationship building - ${goal.title}`,
            description: target.target_description,
          },
        },
        reasoning: `Building a stronger relationship with ${contact.name} supports ${goal.title}`,
      });
      break;
  }

  return suggestions;
}

/**
 * Calculates the value of introducing two contacts
 */
function calculateIntroductionValue(contactA: Contact, contactB: Contact): number {
  let score = 0;

  // Industry alignment
  if (contactA.company && contactB.company) {
    // Same industry but different companies = high value
    if (isSimilarIndustry(contactA.company, contactB.company) && contactA.company !== contactB.company) {
      score += 30;
    }
  }

  // Complementary roles
  if (contactA.title && contactB.title) {
    if (areComplementaryRoles(contactA.title, contactB.title)) {
      score += 25;
    }
  }

  // Professional context overlap
  const contextScore = calculateProfessionalContextOverlap(
    contactA.professional_context,
    contactB.professional_context
  );
  score += contextScore * 0.3;

  return Math.min(score, 100);
}

/**
 * Helper functions for various calculations
 */
function calculateStrengtheningOpportunity(
  contactA: Contact,
  contactB: Contact,
  relationship: NetworkRelationship
): number {
  let score = 50; // Base score for weak relationships

  // Recent activity bonus
  if (relationship.created_at > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) {
    score += 20;
  }

  // Professional relevance
  if (contactB.professional_context) {
    score += 15;
  }

  return Math.min(score, 100);
}

function calculateReactivationScore(contact: Contact, daysSinceLastInteraction: number): number {
  let score = 100 - (daysSinceLastInteraction / 30 * 10); // Decrease by 10 per month

  // Professional context bonus
  if (contact.professional_context) {
    score += 20;
  }

  // Title/company bonus
  if (contact.title || contact.company) {
    score += 10;
  }

  return Math.max(0, Math.min(score, 100));
}

function calculateProfessionalContextOverlap(contextA: Record<string, unknown>, contextB: Record<string, unknown>): number {
  if (!contextA || !contextB) return 0;
  
  // Simplified overlap calculation
  // In a real implementation, this would analyze skills, interests, etc.
  return Math.random() * 50; // Placeholder
}

function isSimilarIndustry(companyA: string, companyB: string): boolean {
  // Simplified industry matching
  // In a real implementation, this would use industry classification
  const keywordsA = companyA.toLowerCase().split(/[\s&-]+/);
  const keywordsB = companyB.toLowerCase().split(/[\s&-]+/);
  
  return keywordsA.some(keyword => keywordsB.includes(keyword));
}

function areComplementaryRoles(titleA: string, titleB: string): boolean {
  // Simplified role complementarity check
  const complementaryPairs = [
    ['ceo', 'cto'], ['ceo', 'cfo'], ['ceo', 'cmo'],
    ['founder', 'investor'], ['founder', 'advisor'],
    ['sales', 'marketing'], ['product', 'engineering'],
    ['design', 'engineering'], ['hr', 'operations']
  ];

  const titleALower = titleA.toLowerCase();
  const titleBLower = titleB.toLowerCase();

  return complementaryPairs.some(([roleA, roleB]) =>
    (titleALower.includes(roleA) && titleBLower.includes(roleB)) ||
    (titleALower.includes(roleB) && titleBLower.includes(roleA))
  );
}

function generateIntroductionReason(contactA: Contact, contactB: Contact): string {
  return `Both ${contactA.name} and ${contactB.name} work in related fields and could benefit from knowing each other.`;
}

function generateIntroductionReasoning(contactA: Contact, contactB: Contact): string {
  return `Professional alignment and complementary expertise suggest high mutual value`;
}

function generateStrengtheningActions(contactA: Contact, contactB: Contact): string[] {
  return [
    'Send a thoughtful follow-up message',
    'Share relevant industry insights',
    'Make a strategic introduction',
    'Invite to relevant event or meeting'
  ];
}

function generateStrengtheningReasoning(
  contactA: Contact,
  contactB: Contact,
  relationship: NetworkRelationship
): string {
  return `Recent connection with high potential for professional collaboration`;
}

function generateReconnectionMessage(contact: Contact, daysSinceLastInteraction: number): string {
  const months = Math.floor(daysSinceLastInteraction / 30);
  return `Reach out to ${contact.name} after ${months} months to reconnect and share updates`;
}

/**
 * Batch operations for applying suggestions
 */
export function createBulkActions(
  suggestions: BulkSuggestion[],
  selectedSuggestionIds: string[]
): Action[] {
  const actions: Action[] = [];

  const selectedSuggestions = suggestions.filter(s => 
    selectedSuggestionIds.includes(s.id)
  );

  for (const suggestion of selectedSuggestions) {
    if (suggestion.suggestedAction.type === 'create_action') {
      const actionData = suggestion.suggestedAction.data;
      
      actions.push({
        id: `bulk_${suggestion.id}`,
        contact_id: suggestion.contacts[0], // Primary contact
        title: actionData.title,
        description: actionData.description,
        type: actionData.type,
        priority: suggestion.priority,
        status: 'pending',
        suggested_by: 'ai',
        confidence_score: suggestion.confidence,
        context: suggestion.reasoning,
      });
    }
  }

  return actions;
}