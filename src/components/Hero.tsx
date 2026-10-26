export default function Hero() {
  return (
    <>
      <section className="hero" id="home" aria-labelledby="hero-title">
        <img
          className="hero-art"
          src="/assets/hero-network.png"
          width="1672"
          height="941"
          alt=""
          fetchPriority="high"
          decoding="async"
          aria-hidden="true"
        />
        <canvas id="sculpture" aria-hidden="true"></canvas>
        <div className="hero-shade" aria-hidden="true"></div>
        <div className="hero-content wrap">
          <h1 id="hero-title">
            <span className="hero-title-line">The one</span>
            <br />
            <em>who connects.</em>
          </h1>
          <p>
            We build and run software for businesses.
            <br />
            We work like your in-house developers.
          </p>
          <div className="hero-actions">
            <a className="button" href="#contact">
              Let’s collaborate{" "}
              <svg className="icon">
                <use href="#diagonal" />
              </svg>
            </a>
            <a className="text-link" href="#business-model">
              Explore our work{" "}
              <svg className="icon">
                <use href="#diagonal" />
              </svg>
            </a>
          </div>
        </div>
        <div className="hero-footer wrap">
          <a href="#purpose">
            Scroll to follow the signal <span aria-hidden="true">↓</span>
          </a>
          <span className="hero-footer-note">
            From one signal.
            <br />
            To a shared system.
          </span>
        </div>
      </section>
    </>
  );
}
