import { createClient } from 'jsr:@supabase/supabase-js@2';
import { create, verify } from 'https://deno.land/x/djwt@v3.0.1/mod.ts';

// the ! after the env var is a non-null assertion operator, which tells TypeScript that this value will not be null or undefinedsu
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!, 
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// starts HTTP server
// whenever a request comes in, this function is called with the request object
Deno.serve(async (req) => {

  // only allow POST requests which would be the user submitting their score after a game
  // rejects GET, PUT, etc.
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  // get the JSON content from the request body 
  const { username, score, metric, granularity, sessionToken } = await req.json();

  // validate the input data
  if (typeof username !== 'string' || username.trim().length === 0 || username.length > 24) {
    return new Response('Invalid username, make a better one', { status: 400 });
  }
  if (typeof score !== 'number' || !Number.isInteger(score) || score < 0 || score > 1000) {
    return new Response('Invalid score, what are you even doing?', { status: 400 });
  }

  // sessionToken was issued by a `start-session` function when the game began,
  // signed with a server-only secret, and contains `startedAt` and `username`.
  // verify the session token using the server secret, and extract the payload (which is the data being passed in the token)
  let payload: { startedAt: number; username: string };
  try {
    payload = await verify(sessionToken, Deno.env.get('SESSION_SECRET')!, 'HS512');
  } 
  // HS512 is a hashing algorithm used to sign the token, and the server secret is used to verify that the token was indeed issued by the server and not tampered with.
  // it just encrypts the data in the token and allows the server to verify that the token is valid and was issued by the server.
  catch {
    return new Response('Invalid or missing session', { status: 401 });
  }

  // calculate how many seconds it has been since the game started
  const elapsedSeconds = (Date.now() - payload.startedAt) / 1000;

  // it takes about at least half a second to get a point
  const MIN_SECONDS_PER_POINT = 0.5; 

  // if the score is too high for the time elapsed, reject it as cheating
  if (score > elapsedSeconds / MIN_SECONDS_PER_POINT) {
    return new Response('Be real, you did not get all that score in that time', { status: 400 });
  }

  // the function supabase.from(...).insert(...) always returns and object with
  // 1 - data 
  // 2- error
  // this function inserts a new row into the `leaderboard` table with the username, score, metric, and granularity.
  const { error } = await supabase.from('leaderboard').insert({
    username: username.trim(),
    score,
    metric,
    granularity,
  });

  // if there's an error send a handle it big boy
  if (error){
    return new Response(error.message, { status: 500 });
  } 
  // if everything is good, return a success response
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
});