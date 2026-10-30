export default function Contact() {
  return (
    <section
      className="contact section"
      id="contact"
      aria-labelledby="contact-title"
    >
      <div className="contact-signal" aria-hidden="true">
        <img
          className="contact-art"
          src="/assets/contact-network.png"
          width="1672"
          height="941"
          alt=""
          loading="lazy"
          decoding="async"
        />
        <canvas id="contact-particles"></canvas>
      </div>
      <div className="contact-inner wrap">
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
              Tell us what you’re working on,
              <br />
              and where you need a hand.
            </p>
          </div>
          <div className="contact-action">
            <p>Send us a note and tell us what you’re working on.</p>
            <a
              className="text-link"
              href="https://mail.google.com/mail/?view=cm&fs=1&to=axonenjin%40gmail.com&su=Let%E2%80%99s%20make%20a%20connection&body=Hi%20Axon%20Enjin%2C%0A%0AI%E2%80%99d%20like%20to%20make%20a%20connection.%0A"
              target="_blank"
              rel="noreferrer"
            >
              Email us on Gmail{" "}
              <svg className="icon" aria-hidden="true">
                <use href="#diagonal" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
