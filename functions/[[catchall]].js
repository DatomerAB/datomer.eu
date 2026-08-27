// Catch-all Pages Function that delegates back to the static asset pipeline.
// Its only purpose is to ensure the root _middleware.js runs for every route
// (including SPA fallback paths such as /press), because Pages middleware is
// only invoked when a Function route matches the request path.

export async function onRequest(context) {
  return context.next()
}
