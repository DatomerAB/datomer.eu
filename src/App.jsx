import './App.css'

function ParLogo() {
  return (
    <img
      src="/par-logo.png"
      alt="Pär"
      className="brand-symbol"
      width="52"
      height="68"
    />
  )
}

function DatomerLogo() {
  return (
    <img
      src="/datomer-logo.png"
      alt="Datomer"
      className="datomer-logo"
      width="160"
      height="52"
    />
  )
}

const proofPoints = [
  'Built for people and teams',
  'Simple to use',
  'Trusted by modern operations',
]

const steps = [
  {
    number: '01',
    title: 'Connect',
    description:
      'Bring together the tools, systems, and information your day depends on without extra friction.',
  },
  {
    number: '02',
    title: 'Organize',
    description:
      'Structure work in a clearer, calmer way so priorities are visible and decisions happen faster.',
  },
  {
    number: '03',
    title: 'Act',
    description:
      'Move from context to action with less back-and-forth and more confidence in the next step.',
  },
]

const features = [
  {
    title: 'Intuitive workflows',
    text: 'Clear processes and cleaner handoffs help teams stay aligned without overcomplicating the work.',
  },
  {
    title: 'Faster decisions',
    text: 'See what matters quickly, reduce noise, and act with context instead of guesswork.',
  },
  {
    title: 'Better visibility',
    text: 'One shared view of priorities, progress, and accountability keeps everyone in sync.',
  },
  {
    title: 'Secure by design',
    text: 'Data handling is designed with trust, clarity, and operational responsibility at the center.',
  },
]

const faqs = [
  {
    question: 'Who is Pär for?',
    answer:
      'Pär is designed for individuals, teams, and businesses that want a simpler and smarter way to manage digital work without unnecessary complexity.',
  },
  {
    question: 'Is Pär managed by a company I can trust?',
    answer:
      'Yes. Pär is managed and operated by Datomer AB, which gives the product a clear owner and a grounded business foundation.',
  },
  {
    question: 'How quickly can we get started?',
    answer:
      'Most users can get started quickly with a streamlined setup and a low-friction onboarding experience designed around clarity and ease of use.',
  },
  {
    question: 'What about security and privacy?',
    answer:
      'Pär is built with privacy and security in mind. We keep the product experience simple while supporting responsible data handling and transparent operations.',
  },
  {
    question: 'Do you offer support?',
    answer:
      'Support is available for managed users and business inquiries through Datomer AB, with clear contact paths for onboarding and product questions.',
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
            <a href="#about">About</a>
            <a href="#features">Features</a>
            <a href="#faq">FAQ</a>
            <a href="#contact">Contact</a>
          </div>

          <div className="header-right" aria-label="Datomer brand group">
            <a href="#top" className="datomer-link" aria-label="Datomer home">
              <DatomerLogo />
            </a>
            <a href="#contact" className="button button-primary">
              Book a demo
            </a>
          </div>
        </nav>
      </header>

      <main id="top">
        <section className="hero" id="about">
          <div className="container hero-inner">
            <p className="eyebrow">A smarter way to do more with less friction</p>
            <h1>Pär brings clarity, speed, and simplicity to modern digital work.</h1>
            <p className="lede">
              Pär helps people and teams move through everyday tasks with confidence,
              better visibility, and less unnecessary complexity.
            </p>

            <div className="cta-row">
              <a href="#contact" className="button button-primary">
                Get started
              </a>
              <a href="#features" className="button button-secondary">
                Learn more
              </a>
            </div>

            <ul className="mini-points" aria-label="Pär value points">
              <li>Clearer workflows</li>
              <li>More trust</li>
              <li>Less friction</li>
            </ul>
          </div>
        </section>

        <div className="proof-bar">
          <div className="container proof-grid">
            {proofPoints.map((item) => (
              <div key={item} className="proof-item">
                {item}
              </div>
            ))}
          </div>
        </div>

        <section className="section container" id="features">
          <div className="section-heading">
            <p className="eyebrow">Why Pär matters</p>
            <h2>Built for clarity, momentum, and better everyday decisions.</h2>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <article key={feature.title} className="feature-card">
                <div className="feature-icon" aria-hidden="true">
                  ✦
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section container section-alt" aria-label="How Pär works">
          <div className="section-heading narrow">
            <p className="eyebrow">How it works</p>
            <h2>Three simple steps from context to action.</h2>
          </div>

          <div className="steps-grid">
            {steps.map((step) => (
              <article key={step.number} className="step-card">
                <span className="step-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section container trust-section">
          <div className="trust-copy">
            <p className="eyebrow">Trust and credibility</p>
            <h2>Professional, clear, and built with responsibility in mind.</h2>
            <p>
              Pär is designed to support modern workflows with a strong emphasis on
              usability, transparency, and operational trust. The product is managed and
              operated by Datomer AB, helping users understand who stands behind the
              experience.
            </p>
          </div>

          <div className="trust-list" aria-label="Trust points">
            <div className="trust-item">
              <strong>Ownership</strong>
              <span>Pär is managed and operated by Datomer AB.</span>
            </div>
            <div className="trust-item">
              <strong>Privacy-first</strong>
              <span>Responsible handling and clear operational standards.</span>
            </div>
            <div className="trust-item">
              <strong>Support</strong>
              <span>Direct access to business inquiries and product conversations.</span>
            </div>
          </div>
        </section>

        <section className="section container faq-section" id="faq">
          <div className="section-heading narrow">
            <p className="eyebrow">FAQ</p>
            <h2>Questions people ask before they get started.</h2>
          </div>

          <div className="faq-list">
            {faqs.map((item) => (
              <details key={item.question} className="faq-item" open={item.question === 'Who is Pär for?'}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="cta-band" id="contact">
          <div className="container cta-inner">
            <div>
              <p className="eyebrow">Ready to try Pär?</p>
              <h2>Start with a clearer, smarter way to work.</h2>
            </div>

            <form className="contact-form">
              <label>
                <span>Email</span>
                <input type="email" placeholder="you@example.com" aria-label="Email address" />
              </label>
              <button type="submit" className="button button-primary">
                Book a demo
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <div className="brand footer-brand">
              <span className="brand-mark">Pär</span>
            </div>
            <p>Managed and operated by Datomer AB</p>
          </div>

          <div className="footer-links">
            <a href="#about">About</a>
            <a href="#features">Features</a>
            <a href="#faq">FAQ</a>
            <a href="#contact">Contact</a>
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
