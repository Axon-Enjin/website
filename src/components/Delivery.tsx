import RuntimeRegion from "./RuntimeRegion";
import understand from "../../assets/delivery-understand.svg?raw";
import build from "../../assets/delivery-build.svg?raw";
import handoff from "../../assets/delivery-handoff.svg?raw";
const figures = [understand, build, handoff];

export default function Delivery() {
  return (
    <>
      <section
        className="delivery section wrap"
        id="how-we-work"
        aria-labelledby="delivery-title"
      >
        <div className="section-meta">
          <span className="chapter-label">
            <span className="small-star" aria-hidden="true">
              ✳
            </span>{" "}
            How we work
          </span>
        </div>
        <div className="section-heading">
          <h2 id="delivery-title">
            Close to your team.
            <br />
            <span className="ice">From first call to handoff.</span>
          </h2>
          <p>
            We plan the work with you,
            <br />
            then build and test it together.
          </p>
        </div>
        <div className="delivery-grid">
          <article>
            <span className="figure-label">
              FIG 01 / <span>Understand</span>
            </span>
            <RuntimeRegion
              as="div"
              className="technical-figure"
              data-delivery-revision="3"
              aria-hidden="true"
              html={figures[0]}
            />
            <h3>Understand the work.</h3>
            <ol className="stage-list">
              <li>
                <span>01</span>Inquiry
              </li>
              <li>
                <span>02</span>Discovery
              </li>
              <li>
                <span>03</span>Proposal
              </li>
              <li>
                <span>04</span>Agreement
              </li>
            </ol>
          </article>
          <article>
            <span className="figure-label">
              FIG 02 / <span>Build</span>
            </span>
            <RuntimeRegion
              as="div"
              className="technical-figure"
              data-delivery-revision="3"
              aria-hidden="true"
              html={figures[1]}
            />
            <h3>Build it together.</h3>
            <ol className="stage-list" start={5}>
              <li>
                <span>05</span>Kickoff
              </li>
              <li>
                <span>06</span>Build / Configure
              </li>
            </ol>
          </article>
          <article>
            <span className="figure-label">
              FIG 03 / <span>Handoff</span>
            </span>
            <RuntimeRegion
              as="div"
              className="technical-figure"
              data-delivery-revision="3"
              aria-hidden="true"
              html={figures[2]}
            />
            <h3>Test. Train. Go live.</h3>
            <ol className="stage-list" start={7}>
              <li>
                <span>07</span>Testing + Training
              </li>
              <li>
                <span>08</span>Go-live + Handoff
              </li>
            </ol>
          </article>
        </div>
        <p className="aftercare">
          <span className="signal-dot"></span>After go-live: maintenance, as
          agreed.
        </p>
      </section>
    </>
  );
}
