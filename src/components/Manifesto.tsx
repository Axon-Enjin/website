import RuntimeRegion from "./RuntimeRegion";

export default function Manifesto() {
  return (
    <>
      <section
        className="manifesto section wrap"
        id="purpose"
        aria-labelledby="manifesto-title"
      >
        <div className="section-meta">
          <span className="chapter-label">
            <span className="small-star" aria-hidden="true">
              ✳
            </span>{" "}
            Why we build
          </span>
          <span className="breadcrumb">AXON / 03</span>
        </div>
        <div className="manifesto-layout">
          <span className="vertical-note" aria-hidden="true">
            The connection is human
          </span>
          <RuntimeRegion
            as="h2"
            id="manifesto-title"
            className="manifesto-copy"
            html={
              "Technology should bring people together. Across teams. Across branches. So everyone can work from the same page."
            }
          />
        </div>
        <div className="manifesto-signal" aria-hidden="true">
          <canvas id="manifesto-signal"></canvas>
        </div>
        <p className="manifesto-caption">
          Axon carries the signal. Enjin is where we connect.
        </p>
      </section>
    </>
  );
}
