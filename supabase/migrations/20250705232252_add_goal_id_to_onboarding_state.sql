-- Add goal_id column to onboarding_state for sequential goal creation
-- This allows tracking the goal record created at category selection

ALTER TABLE public.onboarding_state 
ADD COLUMN goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX idx_onboarding_state_goal_id ON public.onboarding_state(goal_id);

-- Add comment
COMMENT ON COLUMN public.onboarding_state.goal_id IS 'Goal record created during onboarding, updated sequentially as user progresses';