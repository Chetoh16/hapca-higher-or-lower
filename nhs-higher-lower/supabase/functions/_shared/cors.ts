// lets the frontend call these functions from the browser
// defines which origins, headers and request types are allowed
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // tighten to your domain once deployed
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};