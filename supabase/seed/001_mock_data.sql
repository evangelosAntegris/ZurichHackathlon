-- Insert clients
INSERT INTO clients (id, name, email, date_of_birth, marital_status, risk_profile, last_contact, aum, additional_info, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Alice Smith', 'alice.smith@example.com', '1963-09-24', 'Divorced', 'Conservative', '2025-01-10T14:30:00Z', '$2.6M', 'Planning to retire in 2 years. Focused on wealth preservation. Recently widowed, adjusting to single income.', '2023-01-15T10:00:00Z', '2025-01-10T14:30:00Z'),
  ('22222222-2222-2222-2222-222222222222', 'Robert Johnson', 'robert.johnson@example.com', '1975-03-15', 'Married', 'Moderate', '2025-01-08T11:15:00Z', '$1.8M', 'Tech executive looking to diversify portfolio. Two children approaching college age.', '2023-03-20T09:00:00Z', '2025-01-08T11:15:00Z');

-- Insert professional backgrounds
INSERT INTO professional_backgrounds (id, client_id, occupation, education, industry, created_at, updated_at)
VALUES 
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Business Owner, Manufacturing', 'MS Engineering, MIT', 'Manufacturing', '2023-01-15T10:00:00Z', '2023-01-15T10:00:00Z'),
  ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'CTO', 'PhD Computer Science, Stanford', 'Technology', '2023-03-20T09:00:00Z', '2023-03-20T09:00:00Z');

-- Insert financial preferences
INSERT INTO financial_preferences (id, client_id, investment_style, esg_preference, liquidity_needs, created_at, updated_at)
VALUES 
  ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Aggressive growth', 'Low priority', 'Low', '2023-01-15T10:00:00Z', '2024-06-15T14:00:00Z'),
  ('66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'Balanced', 'Medium priority', 'Medium', '2023-03-20T09:00:00Z', '2024-06-20T09:00:00Z');

-- Insert communication preferences
INSERT INTO communication_preferences (id, client_id, preferred_contact, meeting_frequency, report_detail_level, created_at, updated_at)
VALUES 
  ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', 'In-person', 'Bi-monthly', 'Comprehensive', '2023-01-15T10:00:00Z', '2023-01-15T10:00:00Z'),
  ('88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-222222222222', 'Video Call', 'Monthly', 'Summary', '2023-03-20T09:00:00Z', '2023-03-20T09:00:00Z');

-- Insert conversations
INSERT INTO conversations (id, client_id, title, date, duration, type, summary, created_at, updated_at)
VALUES 
  ('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', 'Retirement Income Planning', '2025-01-10T09:00:00Z', '50 min', 'call', 'Alice expressed concerns about retirement income sustainability given recent market volatility. Discussed converting traditional IRA to Roth IRA for tax diversification.', '2025-01-10T09:00:00Z', '2025-01-10T10:00:00Z'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Portfolio Review Q4', '2024-12-15T14:00:00Z', '35 min', 'meeting', 'Q4 portfolio review showed strong performance with 8.2% annual return. Alice satisfied with conservative approach but concerned about inflation impact.', '2024-12-15T14:00:00Z', '2024-12-15T15:00:00Z'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Investment Strategy', '2025-01-05T11:00:00Z', '45 min', 'call', 'Discussed diversifying Robert''s tech-heavy portfolio. He''s interested in international markets and alternative investments.', '2025-01-05T11:00:00Z', '2025-01-05T12:00:00Z');

-- Insert recent interactions
INSERT INTO recent_interactions (id, client_id, date, description, type, created_at)
VALUES 
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', '2025-03-20T10:00:00Z', 'Updated risk profile last week', 'update', '2025-03-20T10:00:00Z'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', '2025-03-06T14:00:00Z', 'Quarterly portfolio review call', 'call', '2025-03-06T14:00:00Z'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', '2025-03-15T16:00:00Z', 'Discussed college savings plans', 'call', '2025-03-15T16:00:00Z');

-- Insert upcoming meetings
INSERT INTO upcoming_meetings (id, client_id, date, title, type, description, created_at)
VALUES 
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', '2025-04-05T14:00:00Z', 'Estate Planning Review', 'meeting', 'Review of will and trust documents', '2025-01-15T10:00:00Z'),
  ('11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', '2025-04-20T10:30:00Z', 'Healthcare Cost Analysis', 'analysis', 'Analysis of projected healthcare costs in retirement', '2025-01-15T10:00:00Z'),
  ('22222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', '2025-04-10T13:00:00Z', 'Portfolio Rebalancing', 'review', 'Quarterly portfolio rebalancing discussion', '2025-03-20T09:00:00Z');

-- Insert recommended actions
INSERT INTO recommended_actions (id, client_id, title, description, priority, category, completed, due_date, created_at, updated_at)
VALUES 
  ('33333333-3333-3333-3333-333333333334', '11111111-1111-1111-1111-111111111111', 'Portfolio Rebalancing', 'Technology sector overweight by 7% relative to target allocation', 'high', 'portfolio', FALSE, '2025-04-15', '2025-01-10T10:00:00Z', '2025-01-10T10:00:00Z'),
  ('44444444-4444-4444-4444-444444444445', '11111111-1111-1111-1111-111111111111', 'Tax-Loss Harvesting', 'Potential savings of $32,500 before year-end', 'medium', 'tax', FALSE, '2025-12-31', '2025-01-10T10:00:00Z', '2025-01-10T10:00:00Z'),
  ('55555555-5555-5555-5555-555555555556', '11111111-1111-1111-1111-111111111111', 'Meeting Preparation', 'Estate Planning Review on Apr 5, 2025', 'medium', 'meeting', FALSE, '2025-04-01', '2025-01-10T10:00:00Z', '2025-01-10T10:00:00Z'),
  ('66666666-6666-6666-6666-666666666667', '22222222-2222-2222-2222-222222222222', 'College Savings Plan', 'Set up 529 plan for children''s education', 'high', 'portfolio', FALSE, '2025-06-30', '2025-03-15T16:00:00Z', '2025-03-15T16:00:00Z');
