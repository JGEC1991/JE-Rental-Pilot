-- Add file upload fields to revenue table
ALTER TABLE revenues 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS proof_of_payment_url text;

-- Add file upload fields to expenses table
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS attachment_file text;

-- Add custom fields support to all relevant tables
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS custom_fields jsonb DEFAULT '{}';

ALTER TABLE drivers
ADD COLUMN IF NOT EXISTS custom_fields jsonb DEFAULT '{}';

ALTER TABLE activities
ADD COLUMN IF NOT EXISTS custom_fields jsonb DEFAULT '{}';

ALTER TABLE revenues
ADD COLUMN IF NOT EXISTS custom_fields jsonb DEFAULT '{}';

ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS custom_fields jsonb DEFAULT '{}';
