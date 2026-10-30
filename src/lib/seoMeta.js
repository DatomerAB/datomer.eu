export const PRODUCT_TITLES = {
  en: 'Pär by Datomer — Your AI. On your device.',
  sv: 'Pär by Datomer — Din AI. På din enhet.',
  de: 'Pär by Datomer — Deine KI. Auf deinem Gerät.',
}

export const PRODUCT_DESCRIPTIONS = {
  en: 'Bring your day together, turn notes into next steps and reuse routines with Pär, a personal AI assistant that runs on your device. You choose what to connect.',
  sv: 'Samla dagens arbete, gör anteckningar till nästa steg och återanvänd rutiner med Pär, en personlig AI-assistent på din enhet. Du väljer vad du ansluter.',
  de: 'Pär ist ein privater KI-Assistent, der deine lokalen Notizen und Dateien in fortlaufende, persönliche Intelligenz verwandelt. Dein Kontext bleibt reich, deine Daten bleiben deine.',
}

export const COMPANY_FACTS = {
  name: 'Datomer AB',
  slogan: "Shaping the 'data you'",
  services: [
    'Data engineering',
    'AI agents',
    'Privacy-focused AI implementation',
    'Data governance',
    'Data and technology strategy',
    'Data and AI platforms',
  ],
}

// Attribute values are interpolated into HTML strings in the Pages middleware, so quotes and ampersands must be escaped.
export function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// JSON-LD sits inside a script tag, so a literal "</script" or "<!--" inside a string must not survive.
export function safeJson(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
