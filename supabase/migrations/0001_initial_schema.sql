-- Enable required extension for gen_random_uuid()
create extension if not exists pgcrypto;

-- Create custom types if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interaction_type') THEN
        CREATE TYPE interaction_type AS ENUM ('update', 'call', 'meeting', 'email');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'meeting_type') THEN
        CREATE TYPE meeting_type AS ENUM ('meeting', 'analysis', 'review', 'call');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_level') THEN
        CREATE TYPE priority_level AS ENUM ('high', 'medium', 'low');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'action_category') THEN
        CREATE TYPE action_category AS ENUM ('portfolio', 'tax', 'meeting', 'risk', 'compliance');
    END IF;
END$$;

-- Create tables
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    date_of_birth DATE NOT NULL,
    marital_status TEXT,
    risk_profile TEXT,
    last_contact TIMESTAMP WITH TIME ZONE,
    aum TEXT,
    additional_info TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration TEXT,
    type TEXT NOT NULL,
    summary TEXT,
    transcript TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS professional_backgrounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
    occupation TEXT,
    education TEXT,
    industry TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financial_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
    investment_style TEXT,
    esg_preference TEXT,
    liquidity_needs TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS communication_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
    preferred_contact TEXT,
    meeting_frequency TEXT,
    report_detail_level TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recent_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT NOT NULL,
    type interaction_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS upcoming_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    title TEXT NOT NULL,
    type meeting_type NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recommended_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority priority_level NOT NULL,
    category action_category NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_recent_interactions_client_id ON recent_interactions(client_id);
CREATE INDEX IF NOT EXISTS idx_upcoming_meetings_client_id ON upcoming_meetings(client_id);
CREATE INDEX IF NOT EXISTS idx_recommended_actions_client_id ON recommended_actions(client_id);

-- Create RLS policies
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_backgrounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE recent_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE upcoming_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommended_actions ENABLE ROW LEVEL SECURITY;

-- Development-only permissive read policies (adjust for production)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'clients' AND policyname = 'dev_read_clients'
    ) THEN
        CREATE POLICY dev_read_clients ON clients FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'conversations' AND policyname = 'dev_read_conversations'
    ) THEN
        CREATE POLICY dev_read_conversations ON conversations FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'professional_backgrounds' AND policyname = 'dev_read_prof_bgs'
    ) THEN
        CREATE POLICY dev_read_prof_bgs ON professional_backgrounds FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'financial_preferences' AND policyname = 'dev_read_fin_prefs'
    ) THEN
        CREATE POLICY dev_read_fin_prefs ON financial_preferences FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'communication_preferences' AND policyname = 'dev_read_comm_prefs'
    ) THEN
        CREATE POLICY dev_read_comm_prefs ON communication_preferences FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'recent_interactions' AND policyname = 'dev_read_recent_interactions'
    ) THEN
        CREATE POLICY dev_read_recent_interactions ON recent_interactions FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'upcoming_meetings' AND policyname = 'dev_read_upcoming_meetings'
    ) THEN
        CREATE POLICY dev_read_upcoming_meetings ON upcoming_meetings FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'recommended_actions' AND policyname = 'dev_read_recommended_actions'
    ) THEN
        CREATE POLICY dev_read_recommended_actions ON recommended_actions FOR SELECT USING (true);
    END IF;
END$$;

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update updated_at columns
DO $$
BEGIN
    -- Clients
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_clients_updated_at') THEN
        CREATE TRIGGER update_clients_updated_at
        BEFORE UPDATE ON clients
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Conversations
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_conversations_updated_at') THEN
        CREATE TRIGGER update_conversations_updated_at
        BEFORE UPDATE ON conversations
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Professional Backgrounds
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_professional_backgrounds_updated_at') THEN
        CREATE TRIGGER update_professional_backgrounds_updated_at
        BEFORE UPDATE ON professional_backgrounds
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Financial Preferences
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_financial_preferences_updated_at') THEN
        CREATE TRIGGER update_financial_preferences_updated_at
        BEFORE UPDATE ON financial_preferences
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Communication Preferences
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_communication_preferences_updated_at') THEN
        CREATE TRIGGER update_communication_preferences_updated_at
        BEFORE UPDATE ON communication_preferences
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Recommended Actions
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_recommended_actions_updated_at') THEN
        CREATE TRIGGER update_recommended_actions_updated_at
        BEFORE UPDATE ON recommended_actions
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;
