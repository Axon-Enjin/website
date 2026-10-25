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
          <div className="chapter-label">
            <span className="small-star" aria-hidden="true">
              ✳
            </span>{" "}
            Technology that connects
          </div>
          <h1 id="hero-title">
            <span className="hero-title-line">People,</span>
            <br />
            <em>connected.</em>
          </h1>
          <p>
            One system for every branch.
            <br />
            Add the tools you need.
          </p>
          <div className="hero-actions">
            <a className="button" href="#modules">
              See modules{" "}
              <svg className="icon">
                <use href="#diagonal" />
              </svg>
            </a>
            <a className="text-link" href="#contact">
              Talk to us{" "}
              <svg className="icon">
                <use href="#diagonal" />
              </svg>
            </a>
          </div>
        </div>
        <div className="hero-footer wrap">
          <a href="#product">
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
