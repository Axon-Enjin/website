export default function Company() {
  return (
    <>
      <section
        className="company section wrap"
        id="company"
        aria-labelledby="company-title"
      >
        <div className="company-layout">
          <div>
            <h2 id="company-title">
              A small team.
              <br />
              Close to the work.
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
              Four people in Metro Manila.
              <br />
              Working directly with you.
            </p>
            <div className="company-statement">
              <span className="signal-dot" aria-hidden="true"></span>
              <p>
                You work with the people building your software, from the first
                conversation to the work that follows.
              </p>
            </div>
            <a className="button" href="#contact">
              Let’s talk{" "}
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
