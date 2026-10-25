export default function Company() {
  return (
    <>
      <section
        className="company section wrap"
        id="company"
        aria-labelledby="company-title"
      >
        <div className="section-meta">
          <span className="chapter-label">
            <span className="small-star" aria-hidden="true">
              ✳
            </span>{" "}
            The people behind the signal
          </span>
        </div>
        <div className="company-layout">
          <div>
            <h2 id="company-title">
              Work directly
              <br />
              with the builders.
            </h2>
            <figure className="working-photo">
              <img
                src="/assets/working-session.png"
                alt="Illustrative working session: anonymous hands sketching a connected workflow beside a laptop."
                width="1536"
                height="1024"
                loading="lazy"
                decoding="async"
              />
              <figcaption>Illustrative working-session detail</figcaption>
            </figure>
          </div>
          <div className="company-copy">
            <p className="company-intro">
              A lean team in Metro Manila.
              <br />
              We work like your in-house developers.
            </p>
            <div className="company-statement">
              <span className="signal-dot" aria-hidden="true"></span>
              <p>
                From the first conversation to handoff, you work directly with
                the people building your system.
              </p>
            </div>
            <a className="button" href="#contact">
              Talk to the team{" "}
              <svg className="icon">
                <use href="#diagonal" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
