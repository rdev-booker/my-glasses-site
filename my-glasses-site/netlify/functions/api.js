/**
 * Netlify Function — wraps the Express app with serverless-http.
 *
 * How it works:
 *   1. netlify.toml redirects  /api/*  →  /.netlify/functions/api/:splat
 *   2. Netlify invokes this handler with the original request path intact
 *   3. serverless-http adapts the Lambda event into an Express-compatible
 *      request, runs it through the app, and returns the response
 *
 * The database (db.js) automatically writes to /tmp when running in Lambda
 * so the JSON store works without any external service.
 */

const serverless = require('serverless-http');
const app        = require('../../server/app');

module.exports.handler = serverless(app);
