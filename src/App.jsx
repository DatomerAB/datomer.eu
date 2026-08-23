import './App.css'
import { useEffect, useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'

const COMPANY = {
  name: 'Datomer AB',
  orgNumber: '559199-6540',
  address: 'Nyskogavägen 11',
  postcode: '123 63',
  city: 'Farsta',
  country: 'Sweden',
  email: 'hello@datomer.eu',
  domain: 'datomer.eu',
}

const FALLBACK_DOWNLOAD_URL =
  'https://github.com/DatomerAB/par-releases/releases/download/v0.1.0-beta.2026081301/Par_0.1.0-beta.2026081301_aarch64.dmg'

function useDownloadUrl() {
  const [url, setUrl] = useState(FALLBACK_DOWNLOAD_URL)

  useEffect(() => {
    let cancelled = false
    fetch('https://raw.githubusercontent.com/DatomerAB/par-releases/main/latest.json')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.version) return
        const version = data.version
        const tag = `v${version}`
        const dmg = `https://github.com/DatomerAB/par-releases/releases/download/${tag}/Par_${version}_aarch64.dmg`
        setUrl(dmg)
      })
      .catch(() => {
        // keep fallback URL
      })
    return () => {
      cancelled = true
    }
  }, [])

  return url
}

function ParLogo() {
  return (
    <svg
      className="brand-symbol"
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Pär"
      role="img"
    >
      <title>Pär</title>
      <defs>
        <linearGradient
          id="silver"
          x1="0"
          y1="0"
          x2="512"
          y2="512"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#8e9aa8" />
          <stop offset="25%" stopColor="#cbd5e1" />
          <stop offset="50%" stopColor="#f8fafc" />
          <stop offset="75%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#8e9aa8" />
        </linearGradient>
      </defs>
      <g
        transform="translate(0,512) scale(0.1,-0.1)"
        fill="url(#silver)"
        stroke="none"
      >
        <path d="M2560 4575 c-8 -2 -49 -9 -90 -15 -361 -58 -704 -304 -928 -666 -160 -258 -256 -552 -303 -934 -9 -68 -13 -504 -16 -1512 l-4 -1417 31 -16 c24 -12 31 -13 35 -3 3 7 6 661 8 1453 4 1576 1 1505 63 1785 56 251 170 515 302 699 79 111 218 256 316 328 142 105 327 186 501 218 125 24 358 16 465 -14 221 -64 379 -197 481 -406 114 -235 139 -545 69 -881 -90 -434 -371 -754 -747 -850 -85 -21 -117 -24 -288 -24 -226 0 -262 -8 -324 -75 -59 -64 -72 -119 -72 -303 0 -84 3 -157 6 -163 8 -12 42 -12 51 2 3 6 7 79 9 162 2 164 11 209 51 257 36 42 49 38 49 -12 0 -24 2 -192 3 -374 2 -296 4 -333 18 -338 43 -16 44 -3 44 401 l0 384 148 -7 c174 -8 285 8 422 59 140 53 233 112 343 216 165 159 276 349 336 579 l27 102 26 -52 c29 -61 127 -199 242 -343 43 -55 88 -113 98 -130 47 -77 2 -137 -135 -179 -103 -32 -152 -68 -168 -129 -15 -57 3 -114 58 -179 l45 -52 -37 -33 c-35 -30 -120 -64 -232 -93 -31 -8 -43 -16 -43 -29 0 -27 18 -37 77 -45 64 -8 131 -31 155 -53 33 -29 22 -59 -35 -102 -101 -74 -118 -132 -87 -291 11 -58 20 -114 20 -125 0 -78 -66 -167 -154 -209 -129 -61 -306 -60 -756 3 -393 55 -358 45 -385 111 -58 142 -235 401 -354 520 -169 167 -321 196 -432 81 -71 -74 -87 -166 -48 -285 69 -209 328 -360 712 -417 60 -8 91 -17 96 -28 14 -26 31 -144 31 -210 0 -53 -5 -72 -34 -124 -87 -156 -128 -363 -124 -622 3 -157 3 -160 25 -163 16 -2 26 4 33 20 12 28 116 536 137 668 8 52 20 108 26 124 16 43 103 123 171 156 132 64 247 76 571 56 159 -10 238 -1 341 40 74 30 147 90 174 144 39 76 42 121 20 257 -26 159 -22 175 65 244 70 54 75 63 75 119 0 45 -41 100 -89 120 l-30 12 57 29 c124 62 146 122 76 206 -51 60 -64 85 -64 118 0 41 39 71 132 99 98 30 164 73 184 121 32 78 13 124 -122 295 -257 325 -302 421 -291 611 29 486 -173 887 -521 1033 -108 46 -216 67 -362 71 -74 2 -142 2 -150 0z m-831 -2719 c97 -50 202 -166 341 -376 34 -52 80 -130 101 -173 l40 -78 -38 6 c-316 52 -472 114 -594 236 -78 77 -112 150 -111 240 0 75 38 142 92 162 40 15 122 6 169 -17z m739 -723 c72 -9 132 -21 132 -25 0 -4 -8 -8 -19 -8 -29 0 -171 -75 -217 -114 l-41 -35 -7 84 c-3 46 -9 90 -12 99 -8 21 0 21 164 -1z m-269 -595 c-21 -102 -38 -150 -25 -73 11 68 39 185 43 181 3 -2 -6 -51 -18 -108z" />
        <path d="M2885 3434 c-89 -46 -118 -131 -75 -218 31 -63 63 -81 142 -81 63 0 69 2 103 35 84 81 64 214 -38 260 -51 24 -92 25 -132 4z" />
      </g>
    </svg>
  )
}

function CompanyAddress() {
  return (
    <address className="company-address">
      <strong>{COMPANY.name}</strong>
      <br />
      {COMPANY.address}
      <br />
      {COMPANY.postcode} {COMPANY.city}
      <br />
      {COMPANY.country}
      <br />
      Org. nr: {COMPANY.orgNumber}
    </address>
  )
}

function DatomerLogo() {
  return (
    <img
      src="/datomer-logo.png"
      alt="Datomer"
      className="datomer-logo"
      width="140"
      height="46"
    />
  )
}

const highlights = [
  { icon: '🖥️', title: 'Local inference', text: 'Runs on your device using GGUF or Ollama models.' },
  { icon: '🔒', title: 'Encrypted vault', text: 'SQLCipher AES-256 encryption keeps your data safe.' },
  { icon: '👤', title: 'You own the keys', text: 'Your memory, files, and profile stay under your control.' },
]

const capabilities = [
  {
    icon: '🧠',
    title: 'Knows you',
    text: 'Persistent, encrypted memory means Pär remembers every conversation. Your profile, goals, and style are injected into every response.',
  },
  {
    icon: '🌍',
    title: 'Knows your world',
    text: 'Connect calendar, email, tasks, and notes. Pär refreshes context in the background so you never have to paste information again.',
  },
  {
    icon: '⚡',
    title: 'Acts for you',
    text: 'Smart model routing picks the best local model for each task. Routines, web search, and document exports get things done.',
  },
]

const features = [
  { title: 'Persistent memory', badge: 'Plus+', text: 'Cross-session history stored encrypted on-device. Find past conversations by meaning, not just keyword.' },
  { title: 'Personal Context Graph', badge: 'Plus+', text: 'A unified, continuously updated view of your profile, commitments, and live external state.' },
  { title: 'Smart model routing', badge: 'Plus+', text: 'Automatically chooses the right local model for chat, code, vision, or reasoning tasks.' },
  { title: 'Live integrations', badge: 'Plus+', text: 'Gmail, Google Calendar, Notion, Todoist, Slack, GitHub, and more — read and write on your behalf.' },
  { title: 'Local file intelligence', badge: 'Plus+', text: 'Drag in text, PDFs, and images. Build a personal knowledge base from folders on your machine.' },
  { title: 'Routines & templates', badge: 'Plus+', text: 'Saved workflows like Morning Briefing, Weekly Review, and Inbox Zero run on your schedule.' },
  { title: 'Semantic cache', badge: 'Plus+', text: 'Near-instant answers to repeated questions without re-running the model.' },
  { title: 'Full data portability', badge: 'All tiers', text: 'Export and import your vault, conversations, and profiles anytime. Your data is always yours.' },
]

const deployments = [
  {
    status: 'Available now',
    title: 'Pär Desktop',
    text: 'macOS app with on-device models and a local vault in ~/.peer/. Everything stays on your Mac.',
    best: 'Best for Mac users',
  },
  {
    status: 'Coming soon',
    title: 'Pär Web',
    text: 'Runs in your browser, talks to your own local backend. Windows, Linux, and Chromebook support.',
    best: 'Best for cross-platform',
  },
  {
    status: 'Coming soon',
    title: 'Pär Cloud',
    text: 'We host the model; your personal context stays on your device. PII-redacted by default.',
    best: 'Best for users without local GPUs',
  },
]

const pricing = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    highlight: false,
    cta: 'Download free',
    note: 'Upgrade to Plus for persistent cross-session history.',
    items: [
      'Local chat with GGUF or Ollama models',
      'Session memory (1 day / 20 messages)',
      'Basic model routing (first available model)',
      'One custom tone profile',
      'P2P device connect (best-effort)',
      'Community support',
    ],
  },
  {
    name: 'Plus',
    price: '$4',
    period: '/ month',
    yearly: 'or $39/year',
    highlight: true,
    cta: 'Get Plus',
    items: [
      'Everything in Free',
      'Persistent cross-session history',
      'Personal Context Graph',
      'Smart model routing + cascade',
      'Semantic cache & search',
      'File upload & local knowledge base',
      'Live web search',
      'Routines & templates',
    ],
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/ user / month',
    yearly: 'or $79/user/year · min 3 seats',
    highlight: false,
    cta: 'Contact sales',
    items: [
      'Everything in Plus',
      'Centralized model server',
      'Admin dashboard & seat management',
      'SSO (OIDC)',
      'Audit log',
      'Team knowledge base — coming soon',
      'API access — coming soon',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    yearly: 'Starting at $2,000/mo for up to 25 seats',
    highlight: false,
    cta: 'Contact sales',
    items: [
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
]

const privacyFeatures = [
  'Native GGUF support + optional Ollama integration',
  'SQLCipher AES-256 encrypted vault',
  'Personal context stripped for any optional cloud backend',
  'App lock with PIN and optional TOTP MFA',
  'Backup integrity verification',
]

const faqs = [
  {
    question: 'Does Pär send my data to the cloud?',
    answer:
      'No. Pär runs inference locally and stores your memory, files, and profile in an encrypted vault on your device. Optional cloud backends only receive PII-redacted context.',
  },
  {
    question: 'What models can I use?',
    answer:
      'Pär supports GGUF models natively and can connect to Ollama. You can bring your own models or use recommended local models for chat, code, vision, and reasoning.',
  },
  {
    question: 'Is there a Windows or Linux version?',
    answer:
      'Pär Desktop is available for macOS today. Pär Web, which supports Windows, Linux, and Chromebook by talking to your own local backend, is coming soon.',
  },
  {
    question: 'Can I export my data?',
    answer:
      'Yes. Full data portability is available on all tiers. You can export and import your vault, conversations, and profiles anytime.',
  },
  {
    question: 'How does licensing work?',
    answer:
      'Pär is one brand with one license and multiple deployment options. Start free, upgrade to Plus for persistent memory, or choose Pro / Enterprise for teams and advanced controls.',
  },
]

function TopBar() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const downloadUrl = useDownloadUrl()

  return (
    <header className="topbar">
      <nav className="nav container" aria-label="Main navigation">
        <Link to="/" className="par-brand" aria-label="Pär home">
          <ParLogo />
          <span className="par-wordmark">Pär</span>
        </Link>

        <div className="nav-links">
          {isHome ? (
            <>
              <a href="#product">Product</a>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#faq">FAQ</a>
            </>
          ) : (
            <>
              <Link to="/">Home</Link>
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
            </>
          )}
        </div>

        <div className="header-right" aria-label="Datomer brand group">
          <Link to="/" className="datomer-link" aria-label="Datomer home">
            <DatomerLogo />
          </Link>
          <a href={downloadUrl} className="button button-primary" download>
            Download
          </a>
        </div>
      </nav>
    </header>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <div className="footer-brand">
            <ParLogo />
            <span>Pär</span>
          </div>
          <p>Managed and operated by {COMPANY.name}</p>
          <CompanyAddress />
        </div>

        <div className="footer-links">
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/cookies">Cookies</Link>
        </div>

        <div className="footer-meta">
          <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
          <div className="legal-links">
            <Link to="/privacy">Privacy policy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/cookies">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function HomePage() {
  const downloadUrl = useDownloadUrl()

  return (
    <main id="top">
      <section className="hero" id="about">
          <div className="container hero-inner">
            <div className="hero-badge">
              <span className="dot" aria-hidden="true" />
              Private by design
            </div>
            <h1>Your AI. On your device.</h1>
            <p className="lede">
              Pär is the personal AI companion that actually remembers you. It learns your goals,
              connects to your tools, and runs entirely on your own hardware — no cloud required.
              Bring your own GGUF models or Ollama models.
            </p>

            <div className="cta-row">
              <a href={downloadUrl} className="button button-primary" download>
                Download for Mac
              </a>
              <a href="#product" className="button button-secondary">
                See how it works
              </a>
            </div>

            <div className="hero-highlights" aria-label="Core promises">
              {highlights.map((item) => (
                <div key={item.title} className="hero-highlight">
                  <span className="hero-highlight-icon" aria-hidden="true">{item.icon}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="proof-bar">
          <div className="container proof-grid">
            <div className="proof-item">
              <strong>Local-first</strong>
              <span>No cloud required</span>
            </div>
            <div className="proof-item">
              <strong>Encrypted vault</strong>
              <span>AES-256 protected</span>
            </div>
            <div className="proof-item">
              <strong>One agent</strong>
              <span>For your digital life</span>
            </div>
          </div>
        </div>

        <section className="section container capabilities-section" id="product">
          <div className="section-heading">
            <p className="eyebrow">Why Pär is different</p>
            <h2>Most AI assistants start every conversation from zero.</h2>
            <p className="section-subtitle">
              Pär builds a living model of who you are, what you are working on, and what matters
              to you — and keeps it under your control.
            </p>
          </div>

          <div className="capability-grid">
            {capabilities.map((item) => (
              <article key={item.title} className="capability-card">
                <span className="capability-icon" aria-hidden="true">{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section-alt" id="features">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Built for serious daily use</p>
              <h2>Everything you expect from a modern AI assistant, designed around privacy and ownership.</h2>
            </div>

            <div className="feature-grid">
              {features.map((feature) => (
                <article key={feature.title} className="feature-card">
                  <div className="feature-card-header">
                    <h3>{feature.title}</h3>
                    <span className="feature-badge">{feature.badge}</span>
                  </div>
                  <p>{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section container privacy-section">
          <div className="privacy-copy">
            <p className="eyebrow">Privacy is not a feature</p>
            <h2>It is the foundation.</h2>
            <p>
              Pär runs inference on your device using local models. Your memory, files, and profile
              live in an encrypted vault on your machine. No silent cloud sync. No training on your data.
            </p>
            <ul className="privacy-list" aria-label="Privacy foundations">
              {privacyFeatures.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="privacy-visual" aria-hidden="true">
            <div className="privacy-lock">
              <span>🔒</span>
            </div>
            <div className="privacy-pillars">
              <div className="privacy-pillar">
                <span>🖥️</span>
                <strong>Local inference</strong>
              </div>
              <div className="privacy-pillar">
                <span>🔒</span>
                <strong>Encrypted vault</strong>
              </div>
              <div className="privacy-pillar">
                <span>👤</span>
                <strong>You own the keys</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="section container deployments-section">
          <div className="section-heading">
            <p className="eyebrow">Choose where it runs</p>
            <h2>One brand, one license, multiple deployment options.</h2>
            <p className="section-subtitle">Pick the privacy level that fits your hardware.</p>
          </div>

          <div className="deployment-grid">
            {deployments.map((item) => (
              <article key={item.title} className={`deployment-card ${item.status === 'Available now' ? 'available' : ''}`}>
                <span className="deployment-status">{item.status}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <span className="deployment-best">{item.best}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="section section-alt" id="pricing">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Simple, transparent pricing</p>
              <h2>Start free. Upgrade when you want Pär to remember everything.</h2>
            </div>

            <div className="pricing-grid">
              {pricing.map((plan) => (
                <article key={plan.name} className={`pricing-card ${plan.highlight ? 'highlight' : ''}`}>
                  {plan.highlight && <span className="popular-badge">Most popular</span>}
                  <div className="pricing-header">
                    <h3>{plan.name}</h3>
                    <div className="pricing-price">
                      <strong>{plan.price}</strong>
                      <span>{plan.period}</span>
                    </div>
                    {plan.yearly && <span className="pricing-yearly">{plan.yearly}</span>}
                  </div>
                  <ul className="pricing-features">
                    {plan.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <button type="button" className={`button ${plan.highlight ? 'button-primary' : 'button-secondary'}`}>
                    {plan.cta}
                  </button>
                  {plan.note && <p className="pricing-note">{plan.note}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section container requirements-section">
          <div className="section-heading narrow">
            <p className="eyebrow">System requirements</p>
            <h2>Built for modern Macs.</h2>
          </div>

          <div className="requirements-card">
            <ul>
              <li>macOS 11 (Big Sur) or later</li>
              <li>Apple Silicon Mac (M1 or newer)</li>
              <li>8 GB RAM minimum (16 GB recommended)</li>
              <li>2 GB free disk space for the app; additional space for models</li>
              <li>Optional: Ollama installed for Ollama model support</li>
            </ul>
            <p className="requirements-note">
              Beta builds are currently unsigned. On first launch, right-click the app and select Open,
              then confirm in System Settings → Privacy & Security if prompted.
            </p>
          </div>
        </section>

        <section className="section container faq-section" id="faq">
          <div className="section-heading narrow">
            <p className="eyebrow">Frequently asked questions</p>
            <h2>Questions people ask before they get started.</h2>
          </div>

          <div className="faq-list">
            {faqs.map((item, index) => (
              <details key={item.question} className="faq-item" open={index === 0}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="cta-band" id="download">
          <div className="container cta-inner">
            <div>
              <p className="eyebrow">Ready to meet Pär?</p>
              <h2>Download the free beta for macOS and keep your AI entirely on your device.</h2>
            </div>

            <div className="cta-actions">
              <a href="#download" className="button button-primary">
                Download for Mac
              </a>
              <form className="waitlist-form">
                <label>
                  <span className="sr-only">Email</span>
                  <input type="email" placeholder="Enter your email" aria-label="Enter your email" />
                </label>
                <button type="submit" className="button button-secondary">
                  Join the waitlist
                </button>
              </form>
            </div>
          </div>
          <p className="container cta-disclaimer">
            Beta release. Requires macOS 11+. Apple Silicon recommended. GGUF models run natively; Ollama is optional.
          </p>
        </section>
    </main>
  )
}

function PageShell({ children, title }) {
  return (
    <div className="page-shell">
      <TopBar />
      {children}
      <Footer />
    </div>
  )
}

function AboutPage() {
  return (
    <main className="section container legal-page">
      <h1>About Pär</h1>
      <p>
        Pär is the local-first personal AI companion built by {COMPANY.name}. Our mission is to
        give people an AI that actually remembers them, runs on their own hardware, and keeps their
        data under their control.
      </p>
      <p>
        We believe the future of AI is private. That means your conversations, files, and context
        should live in an encrypted vault on your device — not on someone else's server.
      </p>

      <h2>Company details</h2>
      <CompanyAddress />

      <h2>Contact</h2>
      <p>
        Email: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
      </p>
    </main>
  )
}

function ContactPage() {
  return (
    <main className="section container legal-page">
      <h1>Contact</h1>
      <p>
        For questions, support, or partnership inquiries, reach out to us at{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
      </p>
      <CompanyAddress />
    </main>
  )
}

function PrivacyPage() {
  return (
    <main className="section container legal-page">
      <h1>Privacy Policy</h1>
      <p>
        <strong>Last updated:</strong> 23 August 2026
      </p>
      <p>
        This Privacy Policy explains how {COMPANY.name} ({""}
        {COMPANY.orgNumber}) processes personal data in connection with the Pär application and
        website.
      </p>

      <h2>1. Data controller</h2>
      <CompanyAddress />
      <p>
        Email: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
      </p>

      <h2>2. What data we process</h2>
      <ul>
        <li>
          <strong>App data:</strong> Pär stores your conversations, files, and personal context in
          an encrypted local vault on your device. We do not have access to this data.
        </li>
        <li>
          <strong>Website data:</strong> When you visit {COMPANY.domain}, we may collect standard
          server logs and analytics data to improve the site.
        </li>
        <li>
          <strong>Waitlist/email:</strong> If you sign up for updates, we store your email address
          to send you relevant communications. You can unsubscribe at any time.
        </li>
      </ul>

      <h2>3. Legal basis</h2>
      <p>
        We process personal data based on your consent, to fulfil a contract, or because we have a
        legitimate interest in operating and improving our services.
      </p>

      <h2>4. Third parties</h2>
      <p>
        We do not sell your data. We may use trusted service providers for hosting, analytics, and
        email delivery. These providers are bound by appropriate data protection agreements.
      </p>

      <h2>5. Your rights</h2>
      <p>
        Under the GDPR, you have the right to access, rectify, erase, restrict, and port your
        personal data. To exercise your rights, contact us at{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
      </p>
    </main>
  )
}

function TermsPage() {
  return (
    <main className="section container legal-page">
      <h1>Terms of Service</h1>
      <p>
        <strong>Last updated:</strong> 23 August 2026
      </p>
      <p>
        These Terms of Service govern your use of the Pär website and beta software provided by{' '}
        {COMPANY.name} ({COMPANY.orgNumber}).
      </p>

      <h2>1. Beta software</h2>
      <p>
        Pär is currently in beta. Features may change, break, or be removed. Do not rely on the beta
        for critical workflows.
      </p>

      <h2>2. License</h2>
      <p>
        We grant you a limited, non-exclusive, non-transferable license to use Pär for personal or
        internal business purposes, subject to these terms.
      </p>

      <h2>3. Your data</h2>
      <p>
        Pär is designed to keep your data on your device. You are responsible for backing up your
        local vault and keeping your device secure.
      </p>

      <h2>4. Liability</h2>
      <p>
        To the extent permitted by law, {COMPANY.name}'s liability is limited to the amount you
        paid for the service in the 12 months preceding the claim. We are not liable for data loss
        caused by your device or configuration.
      </p>

      <h2>5. Governing law</h2>
      <p>
        These terms are governed by the laws of Sweden. Disputes shall be resolved in the courts of
        Stockholm, Sweden.
      </p>
    </main>
  )
}

function CookiesPage() {
  return (
    <main className="section container legal-page">
      <h1>Cookie Policy</h1>
      <p>
        <strong>Last updated:</strong> 23 August 2026
      </p>
      <p>
        {COMPANY.name} uses cookies and similar technologies only where necessary for the operation
        of the website.
      </p>

      <h2>Cookies we use</h2>
      <ul>
        <li>
          <strong>Essential cookies:</strong> required for the site to function, such as routing
          and security.
        </li>
        <li>
          <strong>Analytics cookies:</strong> help us understand how visitors use the site. These
          are only used with your consent where required by law.
        </li>
      </ul>

      <h2>Managing cookies</h2>
      <p>
        You can manage or disable cookies through your browser settings. Disabling essential
        cookies may affect site functionality.
      </p>
    </main>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function App() {
  return (
    <div className="page-shell">
      <ScrollToTop />
      <TopBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
