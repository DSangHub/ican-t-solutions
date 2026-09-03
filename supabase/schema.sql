-- iCant Solutions — Supabase schema for templates & ratings
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Agent / customer message templates
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'call',
    business_tags TEXT[] DEFAULT '{}',
    issue_categories TEXT[] DEFAULT '{}',
    body TEXT NOT NULL,
    is_public BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Community business ratings
CREATE TABLE IF NOT EXISTS business_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id INTEGER NOT NULL,
    business_name TEXT,
    stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
    short_comment TEXT,
    long_comment TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE business_ratings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT CHECK (char_length(display_name) <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS requests (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business TEXT NOT NULL CHECK (char_length(business) <= 200),
    business_phone TEXT CHECK (char_length(business_phone) <= 40),
    account_reference TEXT CHECK (char_length(account_reference) <= 200),
    category TEXT NOT NULL,
    urgency TEXT NOT NULL DEFAULT 'Medium',
    description TEXT NOT NULL CHECK (char_length(description) <= 5000),
    status TEXT NOT NULL DEFAULT 'Received',
    timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
    chat JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON requests(user_id);

CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_channel ON templates(channel);
CREATE INDEX IF NOT EXISTS idx_ratings_business_id ON business_ratings(business_id);

-- Row Level Security: public catalog data; authenticated ownership for private data.
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read templates" ON templates;
DROP POLICY IF EXISTS "Public read ratings" ON business_ratings;
DROP POLICY IF EXISTS "Anyone can insert ratings" ON business_ratings;
DROP POLICY IF EXISTS "Signed-in users insert own ratings" ON business_ratings;
DROP POLICY IF EXISTS "Users read own profile" ON profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
DROP POLICY IF EXISTS "Users read own requests" ON requests;
DROP POLICY IF EXISTS "Users insert own requests" ON requests;
DROP POLICY IF EXISTS "Users update own requests" ON requests;
DROP POLICY IF EXISTS "Users delete own requests" ON requests;

CREATE POLICY "Public read templates" ON templates
    FOR SELECT USING (is_public = true);

CREATE POLICY "Public read ratings" ON business_ratings
    FOR SELECT USING (true);

CREATE POLICY "Signed-in users insert own ratings" ON business_ratings
    FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users read own profile" ON profiles FOR SELECT TO authenticated USING ((SELECT auth.uid()) = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = id) WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users read own requests" ON requests FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users insert own requests" ON requests FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users update own requests" ON requests FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users delete own requests" ON requests FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

REVOKE ALL ON profiles, requests FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles, requests TO authenticated;
REVOKE INSERT, UPDATE, DELETE ON business_ratings FROM anon;
GRANT SELECT ON business_ratings TO anon;
GRANT SELECT, INSERT ON business_ratings TO authenticated;

-- Seed templates (idempotent via slug)
INSERT INTO templates (slug, title, category, channel, business_tags, issue_categories, body, sort_order) VALUES
(
    'cancellation-retention',
    'Service Cancellation — Retention Call',
    'Cancellation',
    'call',
    ARRAY['Comcast', 'Xfinity', 'AT&T', 'Spectrum'],
    ARRAY['Cancellation / Termination'],
    'Hello, I am calling as an authorized representative for {{customer_name}} regarding account {{account}}.

{{customer_name}} has requested cancellation of their {{business}} service effective immediately. They have been unable to complete cancellation through automated channels since {{description}}.

Please process the cancellation without early termination fees, confirm the final bill date, and email written confirmation to the account holder. Reference: {{request_id}}. Urgency: {{urgency}}.',
    1
),
(
    'billing-dispute',
    'Billing Dispute — Formal Review',
    'Billing',
    'call',
    ARRAY['PG&E', 'Comcast', 'Chase'],
    ARRAY['Billing / Charges'],
    'I am authorized to speak on behalf of {{customer_name}} (account {{account}}) regarding a billing dispute with {{business}}.

Issue summary: {{description}}

We request a Level 2 billing review, itemized usage breakdown, and a hold on collections while the dispute is investigated. Case reference: {{request_id}}. Contact: {{phone}}.',
    2
),
(
    'fraud-escalation',
    'Fraud Claim — Executive Escalation',
    'Escalation',
    'call',
    ARRAY['Chase', 'Bank of America', 'Wells Fargo'],
    ARRAY['Complaint / Escalation', 'Billing / Charges'],
    'Authorized representative call for {{customer_name}}, account ending {{account}}.

Unauthorized charge dispute: {{description}}

Request immediate temporary credit, fraud case opening, and supervisor escalation. This matter is marked {{urgency}} priority. iCant case {{request_id}}.',
    3
),
(
    'portal-login-assist',
    'Secure Portal — Agent Login Script',
    'Portal',
    'portal',
    ARRAY[]::TEXT[],
    ARRAY['Account Access / Login Issues'],
    'Portal session for {{business}} (request {{request_id}}).

Customer has authorized iCant agent access to their secure account portal to: {{description}}

Account reference: {{account}}. Agent will use vault credentials shared via Secure Portal tab. All actions logged.',
    4
),
(
    'email-confirmation',
    'Written Confirmation Request',
    'Follow-up',
    'email',
    ARRAY[]::TEXT[],
    ARRAY['Cancellation / Termination', 'Refund Request', 'Billing / Charges'],
    'Subject: Written confirmation requested — {{business}} account {{account}}

Dear {{business}} Support,

This email confirms our authorized request on behalf of {{customer_name}} (iCant case {{request_id}}):

{{description}}

Please reply with written confirmation including reference numbers. Urgency: {{urgency}}.',
    5
),
(
    'refund-request',
    'Refund Request — Supervisor Script',
    'Refund',
    'call',
    ARRAY['United Airlines', 'Amazon', 'Netflix'],
    ARRAY['Refund Request'],
    'Calling regarding refund for {{customer_name}}, account/order {{account}} with {{business}}.

{{description}}

We request full refund processing today with email confirmation. Authorized under case {{request_id}}. Priority: {{urgency}}.',
    6
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    body = EXCLUDED.body,
    business_tags = EXCLUDED.business_tags,
    issue_categories = EXCLUDED.issue_categories,
    updated_at = now();
