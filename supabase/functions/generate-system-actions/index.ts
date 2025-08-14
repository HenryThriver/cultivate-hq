import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { corsHeaders } from '../_shared/cors.ts';

interface ActionGenerationContext {
  userId: string;
  goalId?: string;
  contactId?: string;
  triggerType: 'goal_health' | 'relationship_decay' | 'artifact_processing' | 'scheduled' | 'manual';
  metadata?: Record<string, any>;
}

interface SystemActionTemplate {
  id: string;
  template_key: string;
  action_type: string;
  title_template: string;
  description_template: string;
  priority: string;
  estimated_duration_minutes: number;
  trigger_conditions: any;
}

interface GeneratedAction {
  user_id: string;
  goal_id?: string;
  contact_id?: string;
  action_type: string;
  title: string;
  description: string;
  priority: string;
  duration_minutes: number;
  due_date?: string;
  system_generated: boolean;
  generation_trigger: string;
  template_id: string;
  context_metadata: Record<string, any>;
  status: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request context
    const context: ActionGenerationContext = await req.json();
    const { userId, goalId, contactId, triggerType, metadata = {} } = context;

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Generate actions based on trigger type
    const generatedActions = await generateActions(supabase, context);

    // Insert generated actions
    if (generatedActions.length > 0) {
      const { data: insertedActions, error: insertError } = await supabase
        .from('actions')
        .insert(generatedActions)
        .select();

      if (insertError) {
        throw insertError;
      }

      // Record generation history
      await recordGenerationHistory(supabase, {
        user_id: userId,
        goal_id: goalId,
        contact_id: contactId,
        trigger_type: triggerType,
        actions_generated: generatedActions.length,
        metadata,
      });

      return new Response(
        JSON.stringify({
          success: true,
          actions: insertedActions,
          count: insertedActions?.length || 0,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        actions: [],
        count: 0,
        message: 'No actions needed at this time',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error generating system actions:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function generateActions(
  supabase: any,
  context: ActionGenerationContext
): Promise<GeneratedAction[]> {
  const { userId, goalId, contactId, triggerType, metadata = {} } = context;
  const actions: GeneratedAction[] = [];

  // Fetch relevant templates based on trigger type
  const { data: templates, error: templateError } = await supabase
    .from('system_action_templates')
    .select('*')
    .eq('active', true);

  if (templateError) {
    throw templateError;
  }

  // Process each trigger type
  switch (triggerType) {
    case 'goal_health':
      if (goalId) {
        const goalActions = await generateGoalHealthActions(
          supabase,
          userId,
          goalId,
          templates,
          metadata
        );
        actions.push(...goalActions);
      }
      break;

    case 'relationship_decay':
      if (contactId) {
        const relationshipActions = await generateRelationshipMaintenanceActions(
          supabase,
          userId,
          contactId,
          templates,
          metadata
        );
        actions.push(...relationshipActions);
      }
      break;

    case 'scheduled':
      const scheduledActions = await generateScheduledActions(
        supabase,
        userId,
        templates,
        metadata
      );
      actions.push(...scheduledActions);
      break;

    case 'artifact_processing':
      // This will be handled by the existing parse-artifact function
      // We can generate follow-up actions based on artifact content
      if (metadata.artifactId) {
        const artifactActions = await generateArtifactFollowUpActions(
          supabase,
          userId,
          metadata.artifactId,
          templates
        );
        actions.push(...artifactActions);
      }
      break;
  }

  return actions;
}

async function generateGoalHealthActions(
  supabase: any,
  userId: string,
  goalId: string,
  templates: SystemActionTemplate[],
  metadata: Record<string, any>
): Promise<GeneratedAction[]> {
  const actions: GeneratedAction[] = [];

  // Fetch goal details with contact count
  const { data: goal, error: goalError } = await supabase
    .from('goals')
    .select(`
      *,
      goal_contacts!inner(
        contact_id
      )
    `)
    .eq('id', goalId)
    .single();

  if (goalError || !goal) {
    console.error('Error fetching goal:', goalError);
    return actions;
  }

  const contactCount = goal.goal_contacts?.length || 0;
  const targetContacts = goal.target_contacts || 10;

  // Check for empty goal
  if (contactCount === 0) {
    const template = templates.find(t => t.template_key === 'empty_goal_bootstrap');
    if (template) {
      actions.push(createActionFromTemplate(template, userId, goalId, undefined, {
        goal_title: goal.title,
      }));
    }
  }
  // Check for under-populated goal
  else if (contactCount < targetContacts * 0.5) {
    const template = templates.find(t => t.template_key === 'contact_discovery');
    if (template) {
      actions.push(createActionFromTemplate(template, userId, goalId, undefined, {
        goal_title: goal.title,
        current_contacts: contactCount,
        target_contacts: targetContacts,
      }));
    }
  }

  // Check for stale goal (no recent activity)
  const { data: recentActions } = await supabase
    .from('actions')
    .select('id')
    .eq('goal_id', goalId)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .limit(1);

  if (!recentActions || recentActions.length === 0) {
    const template = templates.find(t => t.template_key === 'stale_goal_revival');
    if (template) {
      actions.push(createActionFromTemplate(template, userId, goalId, undefined, {
        goal_title: goal.title,
        days_inactive: 30,
      }));
    }
  }

  // Add monthly review if it's the first Monday
  if (isFirstMondayOfMonth() && !metadata.skipMonthlyReview) {
    const template = templates.find(t => t.template_key === 'monthly_goal_review');
    if (template) {
      actions.push(createActionFromTemplate(template, userId, goalId, undefined, {
        goal_title: goal.title,
      }));
    }
  }

  return actions;
}

async function generateRelationshipMaintenanceActions(
  supabase: any,
  userId: string,
  contactId: string,
  templates: SystemActionTemplate[],
  metadata: Record<string, any>
): Promise<GeneratedAction[]> {
  const actions: GeneratedAction[] = [];

  // Fetch or calculate relationship health metrics
  const { data: healthMetrics } = await supabase
    .from('relationship_health_metrics')
    .select('*')
    .eq('user_id', userId)
    .eq('contact_id', contactId)
    .single();

  if (healthMetrics) {
    // Check for dormant relationship
    if (healthMetrics.relationship_strength === 'dormant' || 
        (healthMetrics.last_interaction_date && 
         daysSince(new Date(healthMetrics.last_interaction_date)) > 90)) {
      const template = templates.find(t => t.template_key === 'dormant_reconnection');
      if (template) {
        const { data: contact } = await supabase
          .from('contacts')
          .select('first_name, last_name')
          .eq('id', contactId)
          .single();

        actions.push(createActionFromTemplate(template, userId, undefined, contactId, {
          contact_name: `${contact?.first_name || ''} ${contact?.last_name || ''}`.trim(),
          days_since: healthMetrics.last_interaction_date 
            ? daysSince(new Date(healthMetrics.last_interaction_date))
            : 'many',
        }));
      }
    }

    // Check for reciprocity imbalance
    if (healthMetrics.reciprocity_balance < -2) {
      const template = templates.find(t => t.template_key === 'reciprocity_balance_pog');
      if (template) {
        const { data: contact } = await supabase
          .from('contacts')
          .select('first_name, last_name')
          .eq('id', contactId)
          .single();

        actions.push(createActionFromTemplate(template, userId, undefined, contactId, {
          contact_name: `${contact?.first_name || ''} ${contact?.last_name || ''}`.trim(),
          balance: healthMetrics.reciprocity_balance,
        }));
      }
    } else if (healthMetrics.reciprocity_balance > 2) {
      const template = templates.find(t => t.template_key === 'reciprocity_balance_ask');
      if (template) {
        const { data: contact } = await supabase
          .from('contacts')
          .select('first_name, last_name')
          .eq('id', contactId)
          .single();

        actions.push(createActionFromTemplate(template, userId, undefined, contactId, {
          contact_name: `${contact?.first_name || ''} ${contact?.last_name || ''}`.trim(),
          balance: healthMetrics.reciprocity_balance,
        }));
      }
    }
  }

  return actions;
}

async function generateScheduledActions(
  supabase: any,
  userId: string,
  templates: SystemActionTemplate[],
  metadata: Record<string, any>
): Promise<GeneratedAction[]> {
  const actions: GeneratedAction[] = [];

  // Weekly goal check (every Monday)
  if (new Date().getDay() === 1 && !metadata.skipWeeklyCheck) {
    const { data: goals } = await supabase
      .from('goals')
      .select('id, title')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (goals && goals.length > 0) {
      const template = templates.find(t => t.template_key === 'weekly_goal_check');
      if (template) {
        // Add weekly check for each active goal
        for (const goal of goals.slice(0, 3)) { // Limit to 3 goals to avoid overwhelming
          actions.push(createActionFromTemplate(template, userId, goal.id, undefined, {
            goal_title: goal.title,
          }));
        }
      }
    }
  }

  // Quarterly relationship audit (first day of quarter)
  if (isFirstDayOfQuarter() && !metadata.skipQuarterlyAudit) {
    const { data: goals } = await supabase
      .from('goals')
      .select('id, title')
      .eq('user_id', userId)
      .eq('status', 'active')
      .limit(1);

    if (goals && goals.length > 0) {
      const template = templates.find(t => t.template_key === 'quarterly_relationship_audit');
      if (template) {
        actions.push(createActionFromTemplate(template, userId, goals[0].id, undefined, {
          goal_title: goals[0].title,
        }));
      }
    }
  }

  return actions;
}

async function generateArtifactFollowUpActions(
  supabase: any,
  userId: string,
  artifactId: string,
  templates: SystemActionTemplate[]
): Promise<GeneratedAction[]> {
  const actions: GeneratedAction[] = [];

  // Fetch artifact details
  const { data: artifact } = await supabase
    .from('artifacts')
    .select(`
      *,
      artifact_suggestions(*)
    `)
    .eq('id', artifactId)
    .single();

  if (artifact && artifact.artifact_suggestions) {
    // Generate actions from AI suggestions
    for (const suggestion of artifact.artifact_suggestions) {
      if (suggestion.type === 'follow_up' && suggestion.metadata?.action_type) {
        actions.push({
          user_id: userId,
          goal_id: artifact.goal_id,
          contact_id: suggestion.metadata.contact_id,
          action_type: suggestion.metadata.action_type,
          title: suggestion.content,
          description: suggestion.metadata.description || '',
          priority: suggestion.metadata.priority || 'medium',
          duration_minutes: suggestion.metadata.duration || 15,
          system_generated: true,
          generation_trigger: 'artifact_processing',
          template_id: null,
          context_metadata: {
            artifact_id: artifactId,
            suggestion_id: suggestion.id,
          },
          status: 'pending',
        });
      }
    }
  }

  return actions;
}

function createActionFromTemplate(
  template: SystemActionTemplate,
  userId: string,
  goalId?: string,
  contactId?: string,
  variables: Record<string, any> = {}
): GeneratedAction {
  // Replace template variables with actual values
  let title = template.title_template;
  let description = template.description_template;

  for (const [key, value] of Object.entries(variables)) {
    title = title.replace(`{${key}}`, String(value));
    description = description.replace(`{${key}}`, String(value));
  }

  // Calculate due date based on priority
  const dueDate = calculateDueDate(template.priority);

  return {
    user_id: userId,
    goal_id: goalId,
    contact_id: contactId,
    action_type: template.action_type,
    title,
    description,
    priority: template.priority,
    duration_minutes: template.estimated_duration_minutes,
    due_date: dueDate,
    system_generated: true,
    generation_trigger: template.template_key,
    template_id: template.id,
    context_metadata: variables,
    status: 'pending',
  };
}

async function recordGenerationHistory(
  supabase: any,
  history: {
    user_id: string;
    goal_id?: string;
    contact_id?: string;
    trigger_type: string;
    actions_generated: number;
    metadata: Record<string, any>;
  }
): Promise<void> {
  const { error } = await supabase
    .from('action_generation_history')
    .insert(history);

  if (error) {
    console.error('Error recording generation history:', error);
  }
}

function calculateDueDate(priority: string): string {
  const now = new Date();
  let daysToAdd = 7; // Default to 1 week

  switch (priority) {
    case 'urgent':
      daysToAdd = 1;
      break;
    case 'high':
      daysToAdd = 3;
      break;
    case 'medium':
      daysToAdd = 7;
      break;
    case 'low':
      daysToAdd = 14;
      break;
  }

  now.setDate(now.getDate() + daysToAdd);
  return now.toISOString();
}

function daysSince(date: Date): number {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function isFirstMondayOfMonth(): boolean {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const dayOfMonth = now.getDate();
  
  // Check if it's Monday (1) and in the first week of the month
  return dayOfWeek === 1 && dayOfMonth <= 7;
}

function isFirstDayOfQuarter(): boolean {
  const now = new Date();
  const month = now.getMonth();
  const day = now.getDate();
  
  // First day of Q1 (Jan 1), Q2 (Apr 1), Q3 (Jul 1), or Q4 (Oct 1)
  return day === 1 && (month === 0 || month === 3 || month === 6 || month === 9);
}