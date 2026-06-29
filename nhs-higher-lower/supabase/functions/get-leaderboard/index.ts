import { createClient } from 'jsr:@supabase/supabase-js@2';
import { create, verify } from 'https://deno.land/x/djwt@v3.0.1/mod.ts';

// the ! after the env var is a non-null assertion operator, which tells TypeScript that this value will not be null or undefinedsu
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!, 
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

Deno.serve(async (req) => {

  const { data, error } = await supabase
    .from('leaderboard')
    .select('username, score, metric, granularity')
    .order('score', { ascending: false }) // order by score descending
    .limit(10) // limit to top 10 scores
  

  return new Response(JSON.stringify({ leaderboard: data }), {
    status: 200,
  });


});