export default function Contact() {
  return (
    <>
      <section
        className="contact section wrap"
        id="contact"
        aria-labelledby="contact-title"
      >
        <div className="contact-signal" aria-hidden="true">
          <canvas id="contact-particles"></canvas>
        </div>
        <div className="section-meta">
          <span className="chapter-label">
            <span className="small-star" aria-hidden="true">
              ✳
            </span>{" "}
            Start a conversation
          </span>
          <span className="breadcrumb">AXON / 08</span>
        </div>
        <div className="contact-layout">
          <div>
            <h2 id="contact-title">
              Let’s make
              <br />
              <em>
                the
                <br /> connection.
              </em>
            </h2>
            <p>
              Tell us about your branches,
              <br />
              your tools, and what needs to work better.
            </p>
            <div className="contact-offers">
              <span>Operating Layer</span>
              <span>Modules + customization</span>
              <span>Custom AI software</span>
            </div>
          </div>
          <form id="contact-form" method="dialog">
            <div className="field-pair">
              <label>
                Name
                <input
                  name="name"
                  autoComplete="name"
                  placeholder="Your name"
                  required
                  maxLength={100}
                />
              </label>
              <label>
                Work email
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  required
                  maxLength={200}
                />
              </label>
            </div>
            <div className="field-pair">
              <label>
                Company
                <input
                  name="company"
                  autoComplete="organization"
                  placeholder="Your company"
                  maxLength={150}
                />
              </label>
              <label>
                Branches (optional)
                <input
                  name="branches"
                  type="number"
                  min="1"
                  max="100000"
                  placeholder="e.g. 3"
                />
              </label>
            </div>
            <label>
              What do you need help with?
              <textarea
                name="message"
                id="inquiry-message"
                rows={4}
                placeholder="Tell us about your current setup."
                required
                maxLength={5000}
              ></textarea>
            </label>
            <div className="form-action">
              <span className="form-note">
                Prepare your inquiry.
                <br />
                Nothing is sent from this form yet.
              </span>
              <button className="button" type="submit">
                Prepare inquiry{" "}
                <svg className="icon">
                  <use href="#diagonal" />
                </svg>
              </button>
            </div>
            <noscript>
              <p className="form-note">
                Enable JavaScript to prepare a copyable inquiry. This form does
                not submit to a server.
              </p>
            </noscript>
          </form>
        </div>
      </section>
    </>
  );
}
