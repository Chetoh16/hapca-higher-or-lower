// used for creating a session token when the game starts, which is then used to verify the score submission later
import { create } from 'https://deno.land/x/djwt@v3.0.1/mod.ts';

// starts an API endpoint (HTTP server) that listens for requests
// whenever a request is made, this function is called with the request object
Deno.serve(async (req) => {

  // get the username from the req (request body) which is sent from the frontend when the game starts
  const { username } = await req.json();

  // a JWT (JSON Web Token) is a string that contains data + a digital signature
  // the token is built by using a secret key and an encoding algorithm (HS512) to sign the data, 
  // which is then sent to the client (frontend) and can be verified later by the server using the same secret key
  const token = await create(

    // defines signing algorithm + token type
    { alg: 'HS512', typ: 'JWT' }, 

    // data stored inside the token (payload)
    { startedAt: Date.now(), username },

    // secret used to sign (prevents tampering)
    Deno.env.get('SESSION_SECRET')!,
  );

  /*
    HTTP response status codes

    Informational responses (100 – 199)
    Successful responses (200 – 299)
    Redirection messages (300 – 399)
    Client error responses (400 – 499)
    Server error responses (500 – 599)
  */

  // return the token to the client (frontend) in the response body.
  // turns JavaScript object into JSON (because HTTP responses must be text, not raw objects);
  // the client can then use this token to submit their score later, 
  // and the server can verify that the token is valid and was issued by the server.
  return new Response(JSON.stringify({ sessionToken: token }), { status: 200 });
});