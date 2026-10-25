export default function Offers() {
  return (
    <>
      <section
        className="offers section"
        id="offers"
        aria-labelledby="offers-title"
      >
        <div className="wrap">
          <div className="section-meta">
            <span className="chapter-label">
              <span className="small-star" aria-hidden="true">
                ✳
              </span>{" "}
              Ways to work with us
            </span>
            <span className="breadcrumb">AXON / 05</span>
          </div>
          <div className="section-heading">
            <h2 id="offers-title">Software that fits.</h2>
            <p>
              Start with our tools. Tailor them.
              <br />
              Or build something new.
            </p>
          </div>
        </div>
        <div className="offer-rows">
          <article className="offer-row featured">
            <div className="wrap offer-inner">
              <span className="offer-index">
                01 <span>/ Connect</span>
              </span>
              <div className="offer-art" aria-hidden="true">
                <img
                  src="/assets/layer-system.svg"
                  width="400"
                  height="270"
                  alt=""
                />
              </div>
              <div className="offer-copy">
                <h3>Operating Layer</h3>
                <p>
                  One system for every branch.
                  <br />
                  Start with Core. Add the modules you need.
                </p>
              </div>
              <a href="#modules" className="button">
                Explore modules{" "}
                <svg className="icon">
                  <use href="#diagonal" />
                </svg>
              </a>
            </div>
          </article>
          <article className="offer-row">
            <div className="wrap offer-inner">
              <span className="offer-index">
                02 <span>/ Adapt</span>
              </span>
              <div className="offer-copy">
                <h3>Modules + customization</h3>
                <p>Our system, shaped around your fields and workflows.</p>
              </div>
              <a
                href="#contact"
                className="text-link"
                data-inquiry="Modules + customization"
              >
                Talk about your setup{" "}
                <svg className="icon">
                  <use href="#diagonal" />
                </svg>
              </a>
            </div>
          </article>
          <article className="offer-row">
            <div className="wrap offer-inner">
              <span className="offer-index">
                03 <span>/ Create</span>
              </span>
              <div className="offer-copy">
                <h3>Custom AI software</h3>
                <p>
                  Build + 12 months of maintenance by default. You own the app.
                </p>
                <p className="fine-print">
                  Axon keeps reusable libraries. Maintenance scope is agreed in
                  your proposal.
                </p>
              </div>
              <a
                href="#contact"
                className="text-link"
                data-inquiry="Custom AI software"
              >
                Discuss a build{" "}
                <svg className="icon">
                  <use href="#diagonal" />
                </svg>
              </a>
            </div>
          </article>
        </div>
        <div className="wrap buying-note">
          <p>
            Every business is different. Scope and pricing are quoted for your
            setup.
          </p>
          <button
            type="button"
            className="text-link"
            data-dialog="buying-dialog"
          >
            How buying works{" "}
            <svg className="icon">
              <use href="#diagonal" />
            </svg>
          </button>
        </div>
      </section>
    </>
  );
}
