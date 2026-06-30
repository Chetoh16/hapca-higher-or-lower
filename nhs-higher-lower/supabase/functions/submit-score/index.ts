import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

// verifies a token that was issued by start-session.
async function verifyToken(token: string, secret: string): Promise<{ username: string; startedAt: number }> {
  const [payloadB64, sigB64] = token.split('.');

  // decode the payload (data) back to a JSON string
  const payload = atob(payloadB64); 

  // converts text into bytes because crypto functions work with binary data
  const enc = new TextEncoder();

  // import the secret as a key for verification
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  // decode the signature from base64 back to raw bytes
  const sig = Uint8Array.from(atob(sigB64), c => c.charCodeAt(0));

  // check the signature is valid for this payload
  const valid = await crypto.subtle.verify('HMAC', key, sig, enc.encode(payload));
  if (!valid){
    throw new Error('Invalid token - get a better one');
  } 
  
  // converts the text payload into a JavaScript object
  return JSON.parse(payload);
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// starts an HTTP endpoint
Deno.serve(async (req) => {

  // browsers send a test request before the real request
  if (req.method === 'OPTIONS'){
    return new Response('ok', { headers: corsHeaders });
  }

  // rejects GET requests or anything else
  if (req.method !== 'POST'){
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  } 

  try {

    // reads data sent from React
    const { username, score, metric, granularity, sessionToken } = await req.json();

    // basic input validation before touching the database
    if (typeof username !== 'string' || username.trim().length === 0 || username.length > 24){
      return new Response('Invalid username - try harder', { status: 400, headers: corsHeaders });
    }

    if (typeof score !== 'number' || !Number.isInteger(score) || score < 0 || score > 1000){
      return new Response('Invalid score - buddy come on', { status: 400, headers: corsHeaders });
    }

    // verify this was a real game and not someone entering 9999 for their score (undertale reference)
    const secret = Deno.env.get('SESSION_SECRET')!;
    let payload: { username: string; startedAt: number };
    try {
      payload = await verifyToken(sessionToken, secret);
    } 
    catch {
      return new Response('Invalid or missing session', { status: 401, headers: corsHeaders });
    }

    // basic anti-cheat
    // each answer takes at least 0.5 seconds so the score has to be reasonable
    const elapsedSeconds = (Date.now() - payload.startedAt) / 1000;
    if (score > elapsedSeconds / 0.5)
      return new Response('Score too high for elapsed time', { status: 400, headers: corsHeaders });

    // insert the score into the leaderboard
    const { error } = await supabase
      .from('leaderboard')
      .insert({ username: username.trim(), score, metric, granularity });

    if (error){
      return new Response(error.message, { status: 500, headers: corsHeaders });
    } 

    // success huzzah
    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});