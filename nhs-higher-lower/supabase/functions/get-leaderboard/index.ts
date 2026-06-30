import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// the ! after the env var is a non-null assertion operator, which tells TypeScript that this value will not be null or undefinedsu
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!, 
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

Deno.serve(async (req) => {

  // Handle the browser's preflight check
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const { data, error } = await supabase
    .from('leaderboard')
    .select('username, score, metric, granularity, created_at')
    .order('score', { ascending: false }) // order by score descending
    .limit(50) // limit shown players
  
  if (error) {
    return new Response(error.message, {
      status: 500,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify({ leaderboard: data }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });


});