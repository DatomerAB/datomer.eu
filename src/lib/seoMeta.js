export const PRODUCT_TITLES = {
  en: 'Pär by Datomer — Your AI. On your device.',
  sv: 'Pär by Datomer — Din AI. På din enhet.',
  de: 'Pär by Datomer — Deine KI. Auf deinem Gerät.',
}

export const PRODUCT_DESCRIPTIONS = {
  en: 'Pär is a private AI assistant that turns your local notes and files into continuous, personal intelligence. Your context stays rich and your data stays yours.',
  sv: 'Pär är en privat AI-assistent som gör dina lokala anteckningar och filer till kontinuerlig, personlig intelligens. Din kontext förblir rik och dina data förblir dina.',
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
