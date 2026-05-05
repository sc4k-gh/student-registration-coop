// Sets env vars before any module loads so config/supabase.js doesn't throw.
process.env.PORT = process.env.PORT || '8000';
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://test.local';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-key';
