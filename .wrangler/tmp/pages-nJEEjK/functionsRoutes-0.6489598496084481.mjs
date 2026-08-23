import { onRequestPost as __api_checkout_js_onRequestPost } from "/Users/jay.chinnaswamy/jay/datomer.eu/functions/api/checkout.js"
import { onRequestPost as __api_waitlist_js_onRequestPost } from "/Users/jay.chinnaswamy/jay/datomer.eu/functions/api/waitlist.js"

export const routes = [
    {
      routePath: "/api/checkout",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_checkout_js_onRequestPost],
    },
  {
      routePath: "/api/waitlist",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_waitlist_js_onRequestPost],
    },
  ]