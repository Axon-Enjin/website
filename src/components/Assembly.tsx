import overviewMarkup from "../content/assembly-overview.html?raw";
import RuntimeRegion from "./RuntimeRegion";

export default function Assembly() {
  return (
    <>
      <section
        className="assembly"
        id="how-it-works"
        aria-labelledby="assembly-title"
      >
        <div id="product" className="anchor-target"></div>
        <div className="assembly-sticky">
          <div className="assembly-atmosphere" aria-hidden="true">
            <img
              className="assembly-art"
              src="/assets/assembly-network.png"
              width="1672"
              height="941"
              alt=""
              loading="lazy"
              decoding="async"
            />
          </div>
          <canvas id="assembly-particles" aria-hidden="true"></canvas>
          <div className="wrap assembly-heading">
            <div>
              <p className="chapter-label">
                <span className="small-star" aria-hidden="true">
                  ✳
                </span>{" "}
                The Operating Layer
              </p>
              <h2 id="assembly-title">
                Separate branches.
                <br />
                <span className="ice">One shared view.</span>
              </h2>
            </div>
            <span className="breadcrumb">AXON / 02</span>
          </div>
          <div className="assembly-scene wrap">
            <div className="app-window assembly-browser" id="branch-app">
              <div className="window-toolbar">
                <span className="window-dots" aria-hidden="true">
                  <i></i>
                  <i></i>
                  <i></i>
                </span>
                <span className="app-brand">
                  <img
                    src="/assets/axon-mark.svg"
                    width="23"
                    height="16"
                    alt=""
                  />
                  AXON ENJIN
                </span>
                <span className="window-product">Operating Layer</span>
                <label className="branch-picker">
                  <span className="sr-only">
                    Filter illustrative branch view
                  </span>
                  <select id="branch-filter">
                    <option value="all">All branches</option>
                    <option value="a">Branch A</option>
                    <option value="b">Branch B</option>
                    <option value="c">Branch C</option>
                  </select>
                </label>
              </div>
              <div className="app-body">
                <div
                  className="app-rail"
                  role="tablist"
                  aria-label="Product examples"
                  aria-orientation="vertical"
                >
                  <span className="rail-overview">
                    <svg className="icon" aria-hidden="true">
                      <use href="#grid" />
                    </svg>
                    <span>Overview</span>
                  </span>
                  <button
                    type="button"
                    role="tab"
                    id="workflow-inventory"
                    aria-controls="workflow-panel"
                    aria-selected="true"
                    data-workflow="inventory"
                  >
                    <svg className="icon" aria-hidden="true">
                      <use href="#box" />
                    </svg>
                    <span>Inventory</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    id="workflow-people"
                    aria-controls="workflow-panel"
                    aria-selected="false"
                    tabIndex={-1}
                    data-workflow="people"
                  >
                    <svg className="icon" aria-hidden="true">
                      <use href="#people" />
                    </svg>
                    <span>People</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    id="workflow-reports"
                    aria-controls="workflow-panel"
                    aria-selected="false"
                    tabIndex={-1}
                    data-workflow="reports"
                  >
                    <svg className="icon" aria-hidden="true">
                      <use href="#report" />
                    </svg>
                    <span>Reports</span>
                  </button>
                </div>
                <div className="app-main">
                  <RuntimeRegion
                    as="div"
                    id="workflow-panel"
                    role="tabpanel"
                    aria-labelledby="workflow-inventory"
                    tabIndex={0}
                    html={overviewMarkup}
                  />
                  <p className="sample-caption">
                    Illustrative product view · Sample data
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
