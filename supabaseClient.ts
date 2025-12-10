import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mccchztthxoxjiibnvkq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jY2NoenR0aHhveGppaWJudmtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMDI1NzUsImV4cCI6MjA4MDg3ODU3NX0.Jz52Ra27aVJtOrp9abg9Ynjct9AG9L2dulsB1ScegtM';

export const supabase = createClient(supabaseUrl, supabaseKey);