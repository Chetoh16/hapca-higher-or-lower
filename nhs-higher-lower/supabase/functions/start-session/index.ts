import { corsHeaders } from '../_shared/cors.ts';

// creates a token for a game session.
// token = encoded data + signature
async function makeToken(username: string, secret: string): Promise<string> {

  // store player name and game start time
  const payload = JSON.stringify({ username, startedAt: Date.now() });

  // converts text into bytes for crypto functions
  const enc = new TextEncoder();

  // turn the secret into a crypto key
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,      // key cannot be read back out
    ['sign']    // this key can only be used for signing, not verification
  );

  // create a signature from the payload
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));

  // convert signature to base64 text
  const b64 = btoa(String.fromCharCode(...new Uint8Array(sig)));

  // return payload + signature
  return btoa(payload) + '.' + b64;
}

// starts the API endpoint
Deno.serve(async (req) => {

  // andle the browser's CORS preflight check
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { username } = await req.json();

    // stop empty usernames
    if (!username) return new Response(
      JSON.stringify({ error: 'Give us your username' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

    // get secret stored in Supabase
    const secret = Deno.env.get('SESSION_SECRET');
    if (!secret) throw new Error('SESSION_SECRET environment variable is missing');

    // create a token tied to this username and the current time.
    // the frontend sends this token back when submitting a score,
    // so submit-score can verify the game session was legitimate.
    const sessionToken = await makeToken(username, secret);

    // send token back to frontend
    return new Response(
      JSON.stringify({ sessionToken }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {

    // log unexpected errors
    console.error(error);

    // send error response
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});