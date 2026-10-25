import RuntimeRegion from "./RuntimeRegion";

export default function Manifesto() {
  return (
    <>
      <section
        className="manifesto section"
        id="purpose"
        aria-labelledby="manifesto-title"
      >
        <div className="manifesto-stage">
          <div className="manifesto-frame wrap">
            <div className="manifesto-layout">
              <RuntimeRegion
                as="h2"
                id="manifesto-title"
                className="manifesto-copy"
                html={
                  "Technology should bring people together. Across teams. Across branches. So everyone can work from the same page."
                }
              />
            </div>
          </div>
          <div className="manifesto-signal" aria-hidden="true">
            <img
              src="/assets/manifesto-network.png"
              width="1672"
              height="941"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <canvas id="manifesto-signal"></canvas>
          </div>
        </div>
      </section>
    </>
  );
}
