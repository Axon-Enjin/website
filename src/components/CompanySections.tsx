const stories = [
  {
    title: "KPMG Academic Innovation Challenge",
    result: "1st · Agentic Systems",
    type: "Build",
    description: "The constraint. The decision. The build.",
    href: "/articles/kpmg-academic-innovation.html",
    art: "/assets/assembly-network.png",
  },
  {
    title: "BPI DataWave 2025 — VESTA",
    result: "1st · Synergies track",
    type: "Case",
    description: "What we built, and what we learned.",
    href: "/articles/bpi-datawave-vesta.html",
    art: "/assets/hero-network.png",
  },
  {
    title: "Build on Stellar Philippines — Axial",
    result: "2nd runner-up",
    type: "Case",
    description: "A public build, explained.",
    href: "/articles/axial.html",
    art: "/assets/manifesto-network.png",
  },
];

function Arrow() {
  return (
    <svg className="icon" aria-hidden="true">
      <use href="#diagonal" />
    </svg>
  );
}

function SignalBridge() {
  return (
    <svg
      className="business-signal"
      viewBox="0 0 1280 250"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="business-blue">
          <stop stopColor="#184a9a" />
          <stop offset=".5" stopColor="#66d7ff" />
          <stop offset="1" stopColor="#276cff" />
        </linearGradient>
      </defs>
      {Array.from({ length: 28 }, (_, i) => {
        const d = `M -20 ${35 + i * 6} C 100 ${70 + i * 3}, 170 ${200 - i * 4}, 250 135 S 450 ${75 + i * 3}, 640 130 S 900 ${180 - i * 3}, 1030 132 S 1190 ${45 + i * 5}, 1300 ${25 + i * 7}`;
        return (
          <g key={i}>
            <path
              d={d}
              stroke="url(#business-blue)"
              opacity={0.12 + (i % 5) * 0.08}
              strokeWidth={i % 5 === 0 ? 1.4 : 0.65}
            />
            <path
              className="signal-impulse"
              d={d}
              stroke="#88e6ff"
              strokeWidth="1.6"
              pathLength="100"
              strokeDasharray="2 98"
              style={{
                animationDelay: `${-i * 0.47}s`,
                animationDuration: `${7 + (i % 4)}s`,
              }}
            />
          </g>
        );
      })}
      {[250, 640, 1030].map((x, i) => (
        <g key={x} className={`signal-junction junction-${i}`}>
          <path
            d={`M ${x - 55} 120 l 55 -20 l 55 20 l -55 20 Z M ${x - 55} 145 l 55 -20 l 55 20 l -55 20 Z`}
            fill="#103775"
            fillOpacity=".4"
            stroke="#2e85dd"
          />
          <circle cx={x} cy="132" r="12" fill="#246cff" opacity=".14" />
          <circle cx={x} cy="132" r="4" fill="#e3faff" />
        </g>
      ))}
    </svg>
  );
}

export function BusinessModel() {
  return (
    <section
      className="presence-section business-model"
      id="business-model"
      aria-labelledby="business-title"
    >
      <div className="wrap">
        <div className="presence-heading">
          <h2 id="business-title">
            Build the systems.
            <br />
            <em>Grow what comes next.</em>
          </h2>
          <p>
            Engineering becomes products.
            <br />
            Products power the services we build.
          </p>
        </div>
        <div className="business-pillars">
          <article>
            <h3>Technical engineering</h3>
            <p className="pillar-domains">
              Web2 · Web3 · AI
              <br />
              Trading systems · Cybersecurity
            </p>
            <p>Specialist software and systems, built around the work.</p>
          </article>
          <article>
            <h3>Venture building</h3>
            <dl>
              <div>
                <dt>Vaelryn</dt>
                <dd>Verification &amp; ranking infrastructure</dd>
              </div>
              <div>
                <dt>Axlefield</dt>
                <dd>ERP for multi-branch businesses</dd>
              </div>
            </dl>
            <p className="pillar-note">Product initiatives</p>
          </article>
          <article>
            <h3>Service agencies</h3>
            <span className="planned-label">Planned</span>
            <p>
              Use our venture-built products to power our own service agencies.
            </p>
            <p>More capacity through shared tools and automation.</p>
          </article>
        </div>
        <div className="business-visual" aria-hidden="true">
          <img
            src="/assets/business-signal.webp"
            width="2048"
            height="682"
            alt=""
            loading="lazy"
            decoding="async"
          />
          <SignalBridge />
        </div>
        <p className="business-sequence">
          Engineering <span aria-hidden="true">→</span> Ventures{" "}
          <span aria-hidden="true">→</span> Product-powered services
        </p>
      </div>
    </section>
  );
}

function ProjectSculpture() {
  return (
    <div className="project-sculpture-view" aria-hidden="true">
      <img
        className="project-artwork"
        src="/assets/axlefield-sculpture.webp"
        width="1536"
        height="1024"
        loading="lazy"
        decoding="async"
        alt=""
      />
      <span>Illustrative project view</span>
    </div>
  );
}

export function Ventures() {
  return (
    <section
      className="presence-section venture-section"
      id="ventures"
      aria-labelledby="venture-title"
    >
      <div className="wrap venture-layout">
        <div>
          <h2 id="venture-title">Axlefield.</h2>
          <p className="venture-endorsement">An Axon Enjin product.</p>
          <p className="venture-description">
            Tools that bring people, stock,
            <br />
            and everyday work together.
          </p>
          <a className="text-link" href="#axlefield-details">
            About Axlefield <Arrow />
          </a>
          <details id="axlefield-details">
            <summary>Explore the product</summary>
            <p>
              An ERP initiative for multi-branch businesses, connecting people,
              stock and everyday operations. Product scope and availability are
              discussed directly with the team.
            </p>
            <a className="text-link" href="#contact" data-inquiry="Axlefield">
              Ask about Axlefield <Arrow />
            </a>
          </details>
        </div>
        <ProjectSculpture />
      </div>
    </section>
  );
}

export function Proof() {
  return (
    <section
      className="presence-section proof-section"
      id="proof"
      aria-labelledby="proof-title"
    >
      <div className="wrap">
        <div className="presence-heading">
          <h2 id="proof-title">
            Work you
            <br />
            <em>can look into.</em>
          </h2>
          <p>
            Public builds. Clear decisions.
            <br />
            Lessons we can share.
          </p>
        </div>
        <div className="proof-list">
          {stories.map((story, i) => (
            <article key={story.href}>
              <span className="proof-node" aria-hidden="true" />
              <h3>{story.title}</h3>
              <p>{story.result}</p>
              <a className="text-link" href={story.href}>
                {i === 0 ? "Read the build" : "Read the story"} <Arrow />
              </a>
            </article>
          ))}
        </div>
        <a className="text-link proof-more" href="/articles/">
          More from the work <Arrow />
        </a>
      </div>
    </section>
  );
}

export function Articles() {
  return (
    <section
      className="presence-section articles-section"
      id="articles"
      aria-labelledby="articles-title"
    >
      <div className="wrap">
        <div className="presence-heading">
          <h2 id="articles-title">
            The work,
            <br className="mobile-break" /> <em>written down.</em>
          </h2>
          <a className="text-link" href="/articles/">
            All articles <Arrow />
          </a>
        </div>
        <div className="article-grid">
          {stories.map((story) => (
            <article key={story.href}>
              <a href={story.href}>
                <div className="article-art">
                  <img
                    src={story.art}
                    width="700"
                    height="480"
                    loading="lazy"
                    decoding="async"
                    alt=""
                  />
                </div>
                <span className="article-type">{story.type}</span>
                <h3>
                  {story.title.replace("Build on Stellar Philippines — ", "")}
                </h3>
                <p>{story.description}</p>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
