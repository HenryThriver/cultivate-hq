-- Add directionality fields to artifacts table for proper reciprocity tracking
-- These fields are essential for calculating who initiated vs received POGs and Asks

ALTER TABLE artifacts 
ADD COLUMN IF NOT EXISTS initiator_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS recipient_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS initiator_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS recipient_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS loop_status TEXT,
ADD COLUMN IF NOT EXISTS reciprocity_weight DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS impact_score DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS resolution_notes TEXT;

-- Add indexes for performance on directionality queries
CREATE INDEX IF NOT EXISTS idx_artifacts_initiator_user ON artifacts(initiator_user_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_recipient_user ON artifacts(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_initiator_contact ON artifacts(initiator_contact_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_recipient_contact ON artifacts(recipient_contact_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_loop_status ON artifacts(loop_status) WHERE type IN ('pog', 'ask', 'loop');

-- Add constraints for loop status
ALTER TABLE artifacts 
ADD CONSTRAINT check_loop_status 
CHECK (loop_status IS NULL OR loop_status IN ('queued', 'active', 'pending', 'closed', 'delivered', 'received', 'offered', 'requested', 'in_progress', 'brainstorm'));

-- Comments for documentation
COMMENT ON COLUMN artifacts.initiator_user_id IS 'User who initiated this artifact/exchange';
COMMENT ON COLUMN artifacts.recipient_user_id IS 'User who received this artifact/exchange';
COMMENT ON COLUMN artifacts.initiator_contact_id IS 'Contact who initiated this artifact/exchange';
COMMENT ON COLUMN artifacts.recipient_contact_id IS 'Contact who received this artifact/exchange';
COMMENT ON COLUMN artifacts.loop_status IS 'Status of POG/Ask loop (queued, active, pending, closed, etc.)';
COMMENT ON COLUMN artifacts.reciprocity_weight IS 'Weight for reciprocity calculations (0.00 to 5.00)';
COMMENT ON COLUMN artifacts.impact_score IS 'Impact score for this artifact (0.00 to 5.00)';
COMMENT ON COLUMN artifacts.resolution_notes IS 'Notes about how this artifact was resolved or completed';