export const CONTACT_TOPICS = {
  consulting: {
    site: 'company',
    subject: {
      en: 'Datomer AB — Consulting enquiry',
      sv: 'Datomer AB — Förfrågan om konsulttjänster',
    },
    message: {
      en: "Hello Datomer,\n\nI'd like to talk about data and AI support for my organisation.\n\nWhat we want to achieve:\n\nWhere we are today:\n",
      sv: 'Hej Datomer,\n\nJag vill prata om stöd inom data och AI för min organisation.\n\nVad vi vill uppnå:\n\nVar vi står idag:\n',
    },
  },
  product: {
    site: 'product',
    subject: {
      en: 'Pär — Product question',
      sv: 'Pär — Fråga om produkten',
    },
    message: {
      en: 'Hello Pär team,\n\nI have a question about Pär:\n',
      sv: 'Hej Pär-teamet,\n\nJag har en fråga om Pär:\n',
    },
  },
  press: {
    site: 'product',
    subject: {
      en: 'Pär — Press enquiry',
      sv: 'Pär — Pressförfrågan',
    },
    message: {
      en: 'Hello,\n\nI am writing about Pär and would like to ask:\n\nPublication or outlet:\nDeadline (if any):\n',
      sv: 'Hej,\n\nJag skriver om Pär och vill gärna fråga:\n\nMedium:\nDeadline (om någon):\n',
    },
  },
}

export const DEFAULT_TOPIC_BY_SITE = { company: 'consulting', product: 'product' }

// Unknown or cross-site topics fall back to the site default so the subject always matches where the form lives.
export function resolveTopic(topic, site) {
  const entry = CONTACT_TOPICS[topic]
  if (entry && entry.site === site) return topic
  return DEFAULT_TOPIC_BY_SITE[site] || DEFAULT_TOPIC_BY_SITE.product
}

export function topicContent(topic, lang) {
  const entry = CONTACT_TOPICS[topic]
  const key = lang === 'sv' ? 'sv' : 'en'
  return { subject: entry.subject[key], message: entry.message[key] }
}
