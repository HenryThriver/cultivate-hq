// System Action Generation Edge Function
// File: supabase/functions/generate-system-actions/index.ts
// Purpose: Intelligent generation of relationship building actions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ActionGenerationContext {
  userId: string;
  goalId?: string;
  contactId?: string;
  triggerType: 'goal_health' | 'relationship_decay' | 'artifact_processing' | 'scheduled';
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
  trigger_conditions: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse request body
    const { context } = await req.json() as { context: ActionGenerationContext }
    
    console.log('Generating actions for context:', JSON.stringify(context, null, 2))

    // Get relevant templates based on trigger type
    const { data: templates, error: templatesError } = await supabase
      .from('system_action_templates')
      .select('*')
      .eq('active', true)

    if (templatesError) {
      throw templatesError
    }

    const relevantTemplates = templates?.filter(template => {
      const conditions = template.trigger_conditions as Record<string, any>
      return conditions.trigger === context.triggerType
    }) || []

    console.log(`Found ${relevantTemplates.length} relevant templates`)

    const generatedActions: any[] = []

    // Generate actions based on context and templates
    for (const template of relevantTemplates) {
      const action = await generateActionFromTemplate(supabase, template, context)
      if (action) {
        generatedActions.push(action)
      }
    }

    console.log(`Generated ${generatedActions.length} actions`)

    return new Response(
      JSON.stringify({ 
        success: true,
        actions: generatedActions,
        context: context
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error generating system actions:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

async function generateActionFromTemplate(
  supabase: any,
  template: SystemActionTemplate,
  context: ActionGenerationContext
): Promise<any | null> {
  
  try {
    // Get contextual data for template interpolation
    let goalData: any = null
    let contactData: any = null

    if (context.goalId) {
      const { data } = await supabase
        .from('goals')
        .select(`
          *,
          goal_contacts(
            contact_id,
            contacts!inner(id, name, email)
          )
        `)
        .eq('id', context.goalId)
        .single()
      
      goalData = data
    }

    if (context.contactId) {
      const { data } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', context.contactId)
        .single()
      
      contactData = data
    }

    // Evaluate template conditions
    if (!evaluateConditions(template.trigger_conditions, context, goalData, contactData)) {
      console.log(`Conditions not met for template ${template.template_key}`)
      return null
    }

    // Interpolate template strings
    const interpolatedTitle = interpolateTemplate(template.title_template, {
      goal: goalData,
      contact: contactData,
      context: context,
      metadata: context.metadata
    })

    const interpolatedDescription = interpolateTemplate(template.description_template, {
      goal: goalData,
      contact: contactData, 
      context: context,
      metadata: context.metadata
    })

    // Create action data
    const actionData = {
      user_id: context.userId,
      action_type: template.action_type,
      title: interpolatedTitle,
      description: interpolatedDescription,
      priority: template.priority,
      status: 'pending',
      estimated_duration_minutes: template.estimated_duration_minutes,
      created_source: 'system_intelligence',
      system_generated: true,
      template_key: template.template_key,
      trigger_context: context,
      goal_id: context.goalId || null,
      contact_id: context.contactId || null,
    }

    console.log(`Generated action from template ${template.template_key}:`, actionData.title)

    return actionData

  } catch (error) {
    console.error(`Error generating action from template ${template.template_key}:`, error)
    return null
  }
}

function evaluateConditions(
  conditions: Record<string, any>,
  context: ActionGenerationContext,
  goalData: any,
  contactData: any
): boolean {
  
  const condition = conditions.condition

  switch (condition) {
    case 'contact_count_below_target':
      if (!goalData) return false
      const currentCount = goalData.goal_contacts?.length || 0
      const targetCount = goalData.target_contact_count || 50
      return currentCount < targetCount

    case 'no_activity_30_days':
      // Would check for recent actions/interactions - simplified for now
      return true

    case 'no_interaction_90_days':
      // Would check last interaction date - simplified for now  
      return true

    case 'meeting_without_notes':
      return context.metadata?.hasNotes === false

    case 'goal_needs_more_contacts':
      if (!goalData) return false
      return (goalData.goal_contacts?.length || 0) < (goalData.target_contact_count || 50)

    default:
      return true
  }
}

function interpolateTemplate(template: string, data: any): string {
  let result = template

  // Goal interpolations
  if (data.goal) {
    result = result.replace(/\{\{goal_title\}\}/g, data.goal.title || 'Unknown Goal')
    result = result.replace(/\{\{current_count\}\}/g, String(data.goal.goal_contacts?.length || 0))
    result = result.replace(/\{\{target_count\}\}/g, String(data.goal.target_contact_count || 50))
  }

  // Contact interpolations  
  if (data.contact) {
    result = result.replace(/\{\{contact_name\}\}/g, data.contact.name || 'Unknown Contact')
  }

  // Metadata interpolations
  if (data.metadata) {
    result = result.replace(/\{\{meeting_date\}\}/g, data.metadata.meeting_date || 'recent meeting')
  }

  return result
}