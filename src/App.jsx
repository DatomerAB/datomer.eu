import './App.css'

function ParLogo() {
  return (
    <img
      src="/par-logo.png"
      alt="Pär"
      className="brand-symbol"
      width="48"
      height="62"
    />
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

function App() {
  return (
    <div className="page-shell">
      <header className="topbar">
        <nav className="nav container" aria-label="Main navigation">
          <a href="#top" className="par-brand" aria-label="Pär home">
            <ParLogo />
            <span className="par-wordmark">Pär</span>
          </a>

          <div className="nav-links">
            <a href="#product">Product</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>

          <div className="header-right" aria-label="Datomer brand group">
            <a href="#top" className="datomer-link" aria-label="Datomer home">
              <DatomerLogo />
            </a>
            <a href="#download" className="button button-primary">
              Download
            </a>
          </div>
        </nav>
      </header>

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
              <a href="#download" className="button button-primary">
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

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <div className="footer-brand">
              <ParLogo />
              <span>Pär</span>
            </div>
            <p>Managed and operated by Datomer AB</p>
          </div>

          <div className="footer-links">
            <a href="#product">Product</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>

          <div className="footer-meta">
            <a href="mailto:hello@datomer.eu">hello@datomer.eu</a>
            <div className="legal-links">
              <a href="#">Privacy policy</a>
              <a href="#">Terms</a>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
