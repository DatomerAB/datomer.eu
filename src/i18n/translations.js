export const translations = {
  en: {
    nav: {
      product: 'Product',
      features: 'Features',
      pricing: 'Pricing',
      faq: 'FAQ',
      home: 'Home',
      about: 'About',
      contact: 'Contact',
      download: 'Download',
    },
    hero: {
      badge: 'Private by design',
      headline: 'Your AI. On your device.',
      lede:
        'Pär is the personal AI companion that actually remembers you. It learns your goals, connects to your tools, and runs entirely on your own hardware — no cloud required. Bring your own GGUF models or Ollama models.',
      downloadMac: 'Download for Mac',
      seeHowItWorks: 'See how it works',
    },
    highlights: {
      localInference: { title: 'Local inference', text: 'Runs on your device using GGUF or Ollama models.' },
      encryptedVault: { title: 'Encrypted vault', text: 'SQLCipher AES-256 encryption keeps your data safe.' },
      ownTheKeys: { title: 'You own the keys', text: 'Your memory, files, and profile stay under your control.' },
    },
    proof: {
      localFirst: { strong: 'Local-first', span: 'No cloud required' },
      encrypted: { strong: 'Encrypted vault', span: 'AES-256 protected' },
      oneAgent: { strong: 'One agent', span: 'For your digital life' },
    },
    capabilities: {
      eyebrow: 'Why Pär is different',
      headline: 'Most AI assistants start every conversation from zero.',
      subtitle:
        'Pär builds a living model of who you are, what you are working on, and what matters to you — and keeps it under your control.',
      knowsYou: {
        title: 'Knows you',
        text: 'Persistent, encrypted memory means Pär remembers every conversation. Your profile, goals, and style are injected into every response.',
      },
      knowsWorld: {
        title: 'Knows your world',
        text: 'Connect calendar, email, tasks, and notes. Pär refreshes context in the background so you never have to paste information again.',
      },
      actsForYou: {
        title: 'Acts for you',
        text: 'Smart model routing picks the best local model for each task. Routines, web search, and document exports get things done.',
      },
    },
    features: {
      eyebrow: 'Built for serious daily use',
      headline: 'Everything you expect from a modern AI assistant, designed around privacy and ownership.',
      persistentMemory: { title: 'Persistent memory', badge: 'Plus+', text: 'Cross-session history stored encrypted on-device. Find past conversations by meaning, not just keyword.' },
      contextGraph: { title: 'Personal Context Graph', badge: 'Plus+', text: 'A unified, continuously updated view of your profile, commitments, and live external state.' },
      modelRouting: { title: 'Smart model routing', badge: 'Plus+', text: 'Automatically chooses the right local model for chat, code, vision, or reasoning tasks.' },
      integrations: { title: 'Live integrations', badge: 'Plus+', text: 'Gmail, Google Calendar, Notion, Todoist, Slack, GitHub, and more — read and write on your behalf.' },
      fileIntelligence: { title: 'Local file intelligence', badge: 'Plus+', text: 'Drag in text, PDFs, and images. Build a personal knowledge base from folders on your machine.' },
      routines: { title: 'Routines & templates', badge: 'Plus+', text: 'Saved workflows like Morning Briefing, Weekly Review, and Inbox Zero run on your schedule.' },
      semanticCache: { title: 'Semantic cache', badge: 'Plus+', text: 'Near-instant answers to repeated questions without re-running the model.' },
      portability: { title: 'Full data portability', badge: 'All tiers', text: 'Export and import your vault, conversations, and profiles anytime. Your data is always yours.' },
    },
    privacyHome: {
      eyebrow: 'Privacy is not a feature',
      headline: 'It is the foundation.',
      text:
        'Pär runs inference on your device using local models. Your memory, files, and profile live in an encrypted vault on your machine. No silent cloud sync. No training on your data.',
      features: [
        'Native GGUF support + optional Ollama integration',
        'SQLCipher AES-256 encrypted vault',
        'Personal context stripped for any optional cloud backend',
        'App lock with PIN and optional TOTP MFA',
        'Backup integrity verification',
      ],
      pillars: {
        localInference: 'Local inference',
        encryptedVault: 'Encrypted vault',
        ownTheKeys: 'You own the keys',
      },
    },
    deployments: {
      eyebrow: 'Choose where it runs',
      headline: 'One brand, one license, multiple deployment options.',
      subtitle: 'Pick the privacy level that fits your hardware.',
      available: 'Available now',
      comingSoon: 'Coming soon',
      desktop: {
        title: 'Pär Desktop',
        text: 'macOS app with on-device models and a local vault in ~/.peer/. Everything stays on your Mac.',
        best: 'Best for Mac users',
      },
      web: {
        title: 'Pär Web',
        text: 'Runs in your browser, talks to your own local backend. Windows, Linux, and Chromebook support.',
        best: 'Best for cross-platform',
      },
      cloud: {
        title: 'Pär Cloud',
        text: 'We host the model; your personal context stays on your device. PII-redacted by default.',
        best: 'Best for users without local GPUs',
      },
    },
    language: {
      label: 'Language',
    },
    downloadForm: {
      title: 'Download Pär beta',
      subtitle: 'Enter your details to get the latest macOS beta. We will email you when updates are available.',
      name: 'Full name',
      email: 'Email address',
      phone: 'Phone number',
      country: 'Country',
      selectCountry: 'Select country',
      sending: 'Sending…',
      submit: 'Download for Mac',
      success: 'Thanks! Your download should start automatically.',
      downloadAgain: 'Download again',
      consent: 'By downloading, you agree to receive occasional product updates. You can unsubscribe anytime.',
    },
    payment: {
      unavailable: 'Payment is not configured yet.',
      processing: 'Please wait…',
      error: 'Payment failed. Please try again or contact us.',
      successTitle: 'Thank you!',
      successText: 'Your payment was received. We have sent a confirmation email with next steps.',
    },
    pricing: {
      eyebrow: 'Simple, transparent pricing',
      headline: 'Start free. Upgrade when you want Pär to remember everything.',
      billing: { monthly: 'Monthly', yearly: 'Yearly' },
      free: {
        name: 'Free',
        price: '$0',
        period: 'forever',
        cta: 'Download free',
        note: 'Upgrade to Plus for persistent cross-session history.',
      },
      plus: {
        name: 'Plus',
        price: '$2',
        period: '/ month',
        yearly: 'or $20/year',
        cta: 'Get Plus',
      },
      pro: {
        name: 'Pro',
        price: '$5',
        period: '/ user / month',
        yearly: 'or $49/user/year · min 3 seats',
        cta: 'Contact sales',
      },
      enterprise: {
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        yearly: 'Starting at $2,000/mo for up to 25 seats',
        cta: 'Contact sales',
      },
      popularBadge: 'Most popular',
    },
    pricingFeatures: {
      free: [
        'Local chat with GGUF or Ollama models',
        'Session memory (1 day / 20 messages)',
        'Basic model routing (first available model)',
        'One custom tone profile',
        'P2P device connect (best-effort)',
        'Community support',
      ],
      plus: [
        'Everything in Free',
        'Persistent cross-session history',
        'Personal Context Graph',
        'Smart model routing + cascade',
        'Semantic cache & search',
        'File upload & local knowledge base',
        'Live web search',
        'Routines & templates',
      ],
      pro: [
        'Everything in Plus',
        'Centralized model server',
        'Admin dashboard & seat management',
        'SSO (OIDC)',
        'Audit log',
        'Team knowledge base — coming soon',
        'API access — coming soon',
      ],
      enterprise: [
        'Everything in Pro',
        'On-premise deployment (Docker / Helm)',
        'Multi-user identity & audit log',
        'Local accounts (no SSO required)',
        'Self-hosted team relay',
        'Compliance export & deletion certificates',
        'Custom fine-tuning — coming soon',
        'White-label options — coming soon',
      ],
    },
    requirements: {
      eyebrow: 'System requirements',
      headline: 'Built for modern Macs.',
      items: [
        'macOS 11 (Big Sur) or later',
        'Apple Silicon Mac (M1 or newer)',
        '8 GB RAM minimum (16 GB recommended)',
        '2 GB free disk space for the app; additional space for models',
        'Supports GGUF models and Ollama models',
      ],
      note: 'Beta builds are currently unsigned. On first launch, right-click the app and select Open, then confirm in System Settings → Privacy & Security if prompted.',
    },
    faq: {
      eyebrow: 'Frequently asked questions',
      headline: 'Questions people ask before they get started.',
      q1: 'Does Pär send my data to the cloud?',
      a1:
        'No. Pär runs inference locally and stores your memory, files, and profile in an encrypted vault on your device. Optional cloud backends only receive PII-redacted context.',
      q2: 'What models can I use?',
      a2:
        'Pär supports GGUF models natively and can connect to Ollama. You can bring your own models or use recommended local models for chat, code, vision, and reasoning.',
      q3: 'Is there a Windows or Linux version?',
      a3:
        'Pär Desktop is available for macOS today. Pär Web, which supports Windows, Linux, and Chromebook by talking to your own local backend, is coming soon.',
      q4: 'Can I export my data?',
      a4:
        'Yes. Full data portability is available on all tiers. You can export and import your vault, conversations, and profiles anytime.',
      q5: 'How does licensing work?',
      a5:
        'Pär is one brand with one license and multiple deployment options. Start free, upgrade to Plus for persistent memory, or choose Pro / Enterprise for teams and advanced controls.',
    },
    cta: {
      eyebrow: 'Ready to meet Pär?',
      headline: 'Download the free beta for macOS and keep your AI entirely on your device.',
      downloadMac: 'Download for Mac',
      waitlistPlaceholder: 'Enter your email',
      joinWaitlist: 'Join the waitlist',
      disclaimer: 'Beta release. Requires macOS 11+. Apple Silicon recommended. GGUF models run natively; Ollama is optional.',
    },
    footer: {
      managedBy: 'Managed and operated by Datomer AB',
      legal: { privacy: 'Privacy', terms: 'Terms', cookies: 'Cookies' },
    },
    about: {
      title: 'About Pär',
      intro:
        'Pär is the local-first personal AI companion built by Datomer AB. Our mission is to give people an AI that actually remembers them, runs on their own hardware, and keeps their data under their control.',
      mission:
        'We believe the future of AI is private. That means your conversations, files, and context should live in an encrypted vault on your device — not on someone else\'s server.',
      companyTitle: 'Company details',
      contactTitle: 'Contact',
      emailLabel: 'Email',
    },
    contact: {
      title: 'Contact',
      intro: 'For questions, support, or partnership inquiries, reach out to us at',
    },
    privacy: {
      title: 'Privacy Policy',
      updated: 'Last updated',
      intro:
        'This Privacy Policy explains how {{company}} processes personal data in connection with the Pär application and website.',
      introParams: { company: 'Datomer AB' },
      controllerTitle: '1. Data controller',
      whatTitle: '2. What data we process',
      what: {
        app: 'App data',
        appText: 'Pär stores your conversations, files, and personal context in an encrypted local vault on your device. We do not have access to this data.',
        website: 'Website data',
        websiteText: 'When you visit datomer.eu, we may collect standard server logs and analytics data to improve the site.',
        waitlist: 'Waitlist/email',
        waitlistText: 'If you sign up for updates, we store your email address to send you relevant communications. You can unsubscribe at any time.',
      },
      basisTitle: '3. Legal basis',
      basisText:
        'We process personal data based on your consent, to fulfil a contract, or because we have a legitimate interest in operating and improving our services.',
      thirdTitle: '4. Third parties',
      thirdText:
        'We do not sell your data. We may use trusted service providers for hosting, analytics, and email delivery. These providers are bound by appropriate data protection agreements.',
      rightsTitle: '5. Your rights',
      rightsText:
        'Under the GDPR, you have the right to access, rectify, erase, restrict, and port your personal data. To exercise your rights, contact us at',
    },
    terms: {
      title: 'Terms of Service',
      updated: 'Last updated',
      intro:
        'These Terms of Service govern your use of the Pär website and beta software provided by {{company}} ({{orgNumber}}).',
      introParams: { company: 'Datomer AB', orgNumber: '559199-6540' },
      betaTitle: '1. Beta software',
      betaText:
        'Pär is currently in beta. Features may change, break, or be removed. Do not rely on the beta for critical workflows.',
      licenseTitle: '2. License',
      licenseText:
        'We grant you a limited, non-exclusive, non-transferable license to use Pär for personal or internal business purposes, subject to these terms.',
      dataTitle: '3. Your data',
      dataText:
        'Pär is designed to keep your data on your device. You are responsible for backing up your local vault and keeping your device secure.',
      liabilityTitle: '4. Liability',
      liabilityText:
        "To the extent permitted by law, Datomer AB's liability is limited to the amount you paid for the service in the 12 months preceding the claim. We are not liable for data loss caused by your device or configuration.",
      lawTitle: '5. Governing law',
      lawText: 'These terms are governed by the laws of Sweden. Disputes shall be resolved in the courts of Stockholm, Sweden.',
    },
    cookies: {
      title: 'Cookie Policy',
      updated: 'Last updated',
      intro:
        'Datomer AB uses cookies and similar technologies only where necessary for the operation of the website.',
      typesTitle: 'Cookies we use',
      essential: 'Essential cookies',
      essentialText: 'required for the site to function, such as routing and security.',
      analytics: 'Analytics cookies',
      analyticsText: 'help us understand how visitors use the site. These are only used with your consent where required by law.',
      manageTitle: 'Managing cookies',
      manageText:
        'You can manage or disable cookies through your browser settings. Disabling essential cookies may affect site functionality.',
    },
  },
  sv: {
    nav: {
      product: 'Produkt',
      features: 'Funktioner',
      pricing: 'Priser',
      faq: 'Frågor',
      home: 'Hem',
      about: 'Om oss',
      contact: 'Kontakt',
      download: 'Ladda ner',
    },
    hero: {
      badge: 'Privat från grunden',
      headline: 'Din AI. På din enhet.',
      lede:
        'Pär är den personliga AI-kompisen som faktiskt kommer ihåg dig. Den lär sig dina mål, kopplar ihop sig med dina verktyg och körs helt på din egen hårdvara — inget moln behövs. Använd dina egna GGUF-modeller eller Ollama-modeller.',
      downloadMac: 'Ladda ner för Mac',
      seeHowItWorks: 'Se hur det fungerar',
    },
    highlights: {
      localInference: { title: 'Lokal inferens', text: 'Körs på din enhet med GGUF- eller Ollama-modeller.' },
      encryptedVault: { title: 'Krypterat valv', text: 'SQLCipher AES-256-kryptering håller dina data säkra.' },
      ownTheKeys: { title: 'Du äger nycklarna', text: 'Ditt minne, dina filer och din profil förblir under din kontroll.' },
    },
    proof: {
      localFirst: { strong: 'Lokal-först', span: 'Inget moln krävs' },
      encrypted: { strong: 'Krypterat valv', span: 'AES-256-skyddat' },
      oneAgent: { strong: 'En agent', span: 'För ditt digitala liv' },
    },
    capabilities: {
      eyebrow: 'Det som skiljer Pär',
      headline: 'De flesta AI-assistenter börjar varje konversation från noll.',
      subtitle:
        'Pär bygger en levande modell av vem du är, vad du arbetar med och vad som betyder något för dig — och håller den under din kontroll.',
      knowsYou: {
        title: 'Känner dig',
        text: 'Bestående, krypterat minne innebär att Pär kommer ihåg varje konversation. Din profil, dina mål och din stil matas in i varje svar.',
      },
      knowsWorld: {
        title: 'Känner din värld',
        text: 'Koppla ihop kalender, e-post, uppgifter och anteckningar. Pär uppdaterar sammanhanget i bakgrunden så att du aldrig behöver klistra in information igen.',
      },
      actsForYou: {
        title: 'Handlar åt dig',
        text: 'Smart modellroutning väljer den bästa lokala modellen för varje uppgift. Rutiner, webbsökning och dokumentexport får saker gjorda.',
      },
    },
    features: {
      eyebrow: 'Byggt för seriös daglig användning',
      headline: 'Allt du förväntar dig av en modern AI-assistent, utformat kring integritet och ägandeskap.',
      persistentMemory: { title: 'Bestående minne', badge: 'Plus+', text: 'Sessionsöverskridande historik lagrad krypterat på enheten. Hitta tidigare konversationer efter innebörd, inte bara nyckelord.' },
      contextGraph: { title: 'Personlig kontextgraf', badge: 'Plus+', text: 'En enhetlig, kontinuerligt uppdaterad vy av din profil, åtaganden och live extern status.' },
      modelRouting: { title: 'Smart modellroutning', badge: 'Plus+', text: 'Väljer automatiskt rätt lokala modell för chatt, kod, bild eller resonemangsuppgifter.' },
      integrations: { title: 'Live-integrationer', badge: 'Plus+', text: 'Gmail, Google Kalender, Notion, Todoist, Slack, GitHub och fler — läs och skriv i dina verktyg.' },
      fileIntelligence: { title: 'Lokal filintelligens', badge: 'Plus+', text: 'Dra in text, PDF:er och bilder. Bygg en personlig kunskapsbas från mappar på din dator.' },
      routines: { title: 'Rutiner och mallar', badge: 'Plus+', text: 'Sparade arbetsflöden som Morgonbriefing, Veckogenomgång och Inkorg Noll körs enligt ditt schema.' },
      semanticCache: { title: 'Semantiskt cache', badge: 'Plus+', text: 'Nästan omedelbara svar på upprepade frågor utan att köra modellen igen.' },
      portability: { title: 'Full dataportabilitet', badge: 'Alla nivåer', text: 'Exportera och importera ditt valv, konversationer och profiler när som helst. Dina data är alltid dina.' },
    },
    privacyHome: {
      eyebrow: 'Integritet är inte en funktion',
      headline: 'Det är grunden.',
      text:
        'Pär kör inferens på din enhet med lokala modeller. Ditt minne, dina filer och din profil lever i ett krypterat valv på din dator. Ingen tyst molnsynkronisering. Ingen träning på dina data.',
      features: [
        'Inbyggt GGUF-stöd + valfri Ollama-integration',
        'SQLCipher AES-256-krypterat valv',
        'Personlig kontext rensas för valfritt molnbaserat backend',
        'Applås med PIN och valfri TOTP-MFA',
        'Verifiering av backupintegritet',
      ],
      pillars: {
        localInference: 'Lokal inferens',
        encryptedVault: 'Krypterat valv',
        ownTheKeys: 'Du äger nycklarna',
      },
    },
    deployments: {
      eyebrow: 'Välj var det körs',
      headline: 'Ett varumärke, en licens, flera distributionsalternativ.',
      subtitle: 'Välj den integritetsnivå som passar din hårdvara.',
      available: 'Tillgänglig nu',
      comingSoon: 'Kommer snart',
      desktop: {
        title: 'Pär Desktop',
        text: 'macOS-app med lokala modeller och ett lokalt valv i ~/.peer/. Allt stannar på din Mac.',
        best: 'Bäst för Mac-användare',
      },
      web: {
        title: 'Pär Web',
        text: 'Körs i din webbläsare, pratar med ditt eget lokala backend. Stöd för Windows, Linux och Chromebook.',
        best: 'Bäst för flera plattformar',
      },
      cloud: {
        title: 'Pär Cloud',
        text: 'Vi hostar modellen; din personliga kontext stannar på din enhet. PII-redigerat som standard.',
        best: 'Bäst för användare utan lokala GPU:er',
      },
    },
    pricing: {
      eyebrow: 'Enkel, transparent prissättning',
      headline: 'Börja gratis. Uppgradera när du vill att Pär ska komma ihåg allt.',
      billing: { monthly: 'Månadsvis', yearly: 'Årsvis' },
      free: {
        name: 'Gratis',
        price: '0 kr',
        period: 'för alltid',
        cta: 'Ladda ner gratis',
        note: 'Uppgradera till Plus för bestående sessionsöverskridande historik.',
      },
      plus: {
        name: 'Plus',
        price: '20 kr',
        period: '/ månad',
        yearly: 'eller 240 kr/år',
        cta: 'Skaffa Plus',
      },
      pro: {
        name: 'Pro',
        price: '50 kr',
        period: '/ användare / månad',
        yearly: 'eller 600 kr/användare/år · minst 3 platser',
        cta: 'Kontakta oss',
      },
      enterprise: {
        name: 'Enterprise',
        price: 'Skräddarsytt',
        period: '',
        yearly: 'Från 20 000 kr/mån för upp till 25 platser',
        cta: 'Kontakta oss',
      },
      popularBadge: 'Mest populär',
    },
    pricingFeatures: {
      free: [
        'Lokal chatt med GGUF- eller Ollama-modeller',
        'Sessionsminne (1 dag / 20 meddelanden)',
        'Grundläggande modellroutning (första tillgängliga modellen)',
        'En anpassad tonprofil',
        'P2P-enhetsanslutning (best effort)',
        'Community-support',
      ],
      plus: [
        'Allt i Gratis',
        'Bestående sessionsöverskridande historik',
        'Personlig kontextgraf',
        'Smart modellroutning + kaskad',
        'Semantiskt cache & sök',
        'Filuppladdning & lokal kunskapsbas',
        'Live webbsökning',
        'Rutiner & mallar',
      ],
      pro: [
        'Allt i Plus',
        'Centraliserad modellserver',
        'Adminpanel & plathantering',
        'SSO (OIDC)',
        'Revisionslogg',
        'Teamkunskapsbas — kommer snart',
        'API-åtkomst — kommer snart',
      ],
      enterprise: [
        'Allt i Pro',
        'On-premise-distribution (Docker / Helm)',
        'Multi-user-identitet & revisionslogg',
        'Lokala konton (inget SSO krävs)',
        'Självhostad team-relay',
        'Compliance-export & raderingsintyg',
        'Anpassad fine-tuning — kommer snart',
        'White-label-alternativ — kommer snart',
      ],
    },
    requirements: {
      eyebrow: 'Systemkrav',
      headline: 'Byggt för moderna Mac-datorer.',
      items: [
        'macOS 11 (Big Sur) eller senare',
        'Apple Silicon Mac (M1 eller nyare)',
        '8 GB RAM minimum (16 GB rekommenderas)',
        '2 GB ledigt diskutrymme för appen; ytterligare utrymme för modeller',
        'Stöder GGUF-modeller och Ollama-modeller',
      ],
      note: 'Beta-versionerna är för närvarande osignerade. Vid första starten, högerklicka på appen och välj Öppna, bekräfta sedan i Systeminställningar → Integritet & säkerhet om du tillfrågas.',
    },
    faq: {
      eyebrow: 'Vanliga frågor',
      headline: 'Frågor folk ställer innan de kommer igång.',
      q1: 'Skickar Pär mina data till molnet?',
      a1:
        'Nej. Pär kör inferens lokalt och lagrar ditt minne, filer och profil i ett krypterat valv på din enhet. Valfria molnbaserade backend får endast PII-redigerad kontext.',
      q2: 'Vilka modeller kan jag använda?',
      a2:
        'Pär stöder GGUF-modeller direkt och kan ansluta till Ollama. Du kan använda egna modeller eller rekommenderade lokala modeller för chatt, kod, bild och resonemang.',
      q3: 'Finns det en Windows- eller Linux-version?',
      a3:
        'Pär Desktop finns för macOS idag. Pär Web, som stöder Windows, Linux och Chromebook genom att prata med ditt eget lokala backend, kommer snart.',
      q4: 'Kan jag exportera mina data?',
      a4:
        'Ja. Full dataportabilitet finns på alla nivåer. Du kan exportera och importera ditt valv, konversationer och profiler när som helst.',
      q5: 'Hur fungerar licensiering?',
      a5:
        'Pär är ett varumärke med en licens och flera distributionsalternativ. Börja gratis, uppgradera till Plus för bestående minne, eller välj Pro / Enterprise för team och avancerad kontroll.',
    },
    cta: {
      eyebrow: 'Redo att träffa Pär?',
      headline: 'Ladda ner den kostnadsfria betaversionen för macOS och behåll din AI helt på din enhet.',
      downloadMac: 'Ladda ner för Mac',
      waitlistPlaceholder: 'Ange din e-post',
      joinWaitlist: 'Gå med i väntelistan',
      disclaimer: 'Betaversion. Kräver macOS 11+. Apple Silicon rekommenderas. GGUF-modeller körs direkt; Ollama är valfritt.',
    },
    footer: {
      managedBy: 'Hanteras och drivs av Datomer AB',
      legal: { privacy: 'Integritet', terms: 'Villkor', cookies: 'Cookies' },
    },
    language: {
      label: 'Språk',
    },
    downloadForm: {
      title: 'Ladda ner Pär beta',
      subtitle: 'Ange dina uppgifter för att få den senaste betaversionen för macOS. Vi mejlar dig när uppdateringar finns.',
      name: 'Fullständigt namn',
      email: 'E-postadress',
      phone: 'Telefonnummer',
      country: 'Land',
      selectCountry: 'Välj land',
      sending: 'Skickar…',
      submit: 'Ladda ner för Mac',
      success: 'Tack! Din nedladdning bör starta automatiskt.',
      downloadAgain: 'Ladda ner igen',
      consent: 'Genom att ladda ner godkänner du att få produktuppdateringar. Du kan avanmäla dig när som helst.',
    },
    payment: {
      unavailable: 'Betalning är inte konfigurerad än.',
      processing: 'Vänta…',
      error: 'Betalningen misslyckades. Försök igen eller kontakta oss.',
      successTitle: 'Tack!',
      successText: 'Din betalning har mottagits. Vi har skickat ett bekräftelsemejl med nästa steg.',
    },
    about: {
      title: 'Om Pär',
      intro:
        'Pär är den lokala personliga AI-kompisen byggd av Datomer AB. Vår mission är att ge människor en AI som faktiskt kommer ihåg dem, körs på deras egen hårdvara och håller deras data under deras kontroll.',
      mission:
        'Vi tror att framtiden för AI är privat. Det betyder att dina konversationer, filer och kontext ska leva i ett krypterat valv på din enhet — inte på någon annans server.',
      companyTitle: 'Företagsuppgifter',
      contactTitle: 'Kontakt',
      emailLabel: 'E-post',
    },
    contact: {
      title: 'Kontakt',
      intro: 'För frågor, support eller samarbetsförfrågningar, kontakta oss på',
    },
    privacy: {
      title: 'Integritetspolicy',
      updated: 'Senast uppdaterad',
      intro:
        'Denna integritetspolicy förklarar hur {{company}} behandlar personuppgifter i samband med Pär-applikationen och webbplatsen.',
      introParams: { company: 'Datomer AB' },
      controllerTitle: '1. Personuppgiftsansvarig',
      whatTitle: '2. Vilka personuppgifter behandlar vi',
      what: {
        app: 'Appdata',
        appText: 'Pär lagrar dina konversationer, filer och personliga kontext i ett krypterat lokalt valv på din enhet. Vi har inte tillgång till dessa data.',
        website: 'Webbplatsdata',
        websiteText: 'När du besöker datomer.eu kan vi samla in vanliga serverloggar och analysdata för att förbättra webbplatsen.',
        waitlist: 'Väntelista/e-post',
        waitlistText: 'Om du anmäler dig för uppdateringar lagrar vi din e-postadress för att skicka relevant kommunikation. Du kan avanmäla dig när som helst.',
      },
      basisTitle: '3. Rättslig grund',
      basisText:
        'Vi behandlar personuppgifter baserat på ditt samtycke, för att uppfylla ett avtal, eller för att vi har ett berättigat intresse av att driva och förbättra våra tjänster.',
      thirdTitle: '4. Tredje parter',
      thirdText:
        'Vi säljer inte dina data. Vi kan använda betrodda tjänsteleverantörer för hosting, analys och e-postleverans. Dessa leverantörer är bundna av lämpliga dataskyddsavtal.',
      rightsTitle: '5. Dina rättigheter',
      rightsText:
        'Enligt GDPR har du rätt att få tillgång till, rätta, radera, begränsa och överföra dina personuppgifter. För att utöva dina rättigheter, kontakta oss på',
    },
    terms: {
      title: 'Användarvillkor',
      updated: 'Senast uppdaterad',
      intro:
        'Dessa användarvillkor reglerar din användning av Pärs webbplats och betaversion som tillhandahålls av {{company}} ({{orgNumber}}).',
      introParams: { company: 'Datomer AB', orgNumber: '559199-6540' },
      betaTitle: '1. Betaversion',
      betaText:
        'Pär är för närvarande i beta. Funktioner kan ändras, sluta fungera eller tas bort. Lita inte på betaversionen för kritiska arbetsflöden.',
      licenseTitle: '2. Licens',
      licenseText:
        'Vi ger dig en begränsad, icke-exklusiv, icke-överlåtbar licens att använda Pär för personliga eller interna affärsändamål, i enlighet med dessa villkor.',
      dataTitle: '3. Dina data',
      dataText:
        'Pär är utformat för att hålla dina data på din enhet. Du ansvarar för att säkerhetskopiera ditt lokala valv och hålla din enhet säker.',
      liabilityTitle: '4. Ansvar',
      liabilityText:
        'I den utsträckning lagen tillåter är Datomer AB:s ansvar begränsat till det belopp du betalat för tjänsten under de 12 månaderna före kravet. Vi är inte ansvariga för dataförlust orsakad av din enhet eller konfiguration.',
      lawTitle: '5. Tillämplig lag',
      lawText: 'Dessa villkor regleras av svensk lag. Tvister ska lösas i svensk domstol i Stockholm.',
    },
    cookies: {
      title: 'Cookiepolicy',
      updated: 'Senast uppdaterad',
      intro:
        'Datomer AB använder cookies och liknande tekniker endast där det är nödvändigt för webbplatsens drift.',
      typesTitle: 'Cookies vi använder',
      essential: 'Nödvändiga cookies',
      essentialText: 'krävs för att webbplatsen ska fungera, till exempel för routning och säkerhet.',
      analytics: 'Analys-cookies',
      analyticsText: 'hjälper oss att förstå hur besökare använder webbplatsen. Dessa används endast med ditt samtycke där lagen kräver det.',
      manageTitle: 'Hantera cookies',
      manageText:
        'Du kan hantera eller inaktivera cookies via din webbläsares inställningar. Inaktivering av nödvändiga cookies kan påverka webbplatsens funktionalitet.',
    },
  },
}
