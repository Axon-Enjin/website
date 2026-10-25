import inventoryMarkup from "../content/inventory-example.html?raw";
import RuntimeRegion from "./RuntimeRegion";

export default function Modules() {
  return (
    <>
      <section
        className="modules section wrap"
        id="modules"
        aria-labelledby="modules-title"
      >
        <div className="section-meta">
          <span className="chapter-label">
            <span className="small-star" aria-hidden="true">
              ✳
            </span>{" "}
            The modules
          </span>
          <span className="breadcrumb">AXON / 04</span>
        </div>
        <div className="module-layout">
          <svg
            className="module-signal"
            viewBox="0 0 280 140"
            aria-hidden="true"
          >
            <path d="M0 8C65 8 70 112 167 112H280" />
            <circle cx="167" cy="112" r="3" />
          </svg>
          <div className="app-window module-window">
            <div className="window-toolbar">
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
              <span className="module-app-label" id="module-app-label">
                Inventory
              </span>
            </div>
            <div
              className="module-workflows"
              role="group"
              aria-label="Example module shortcuts"
            >
              <button
                type="button"
                data-module-shortcut="inventory"
                aria-pressed="true"
              >
                Inventory
              </button>
              <button
                type="button"
                data-module-shortcut="hr"
                aria-pressed="false"
              >
                People
              </button>
              <button
                type="button"
                data-module-shortcut="reporting"
                aria-pressed="false"
              >
                Reports
              </button>
            </div>
            <RuntimeRegion
              as="div"
              id="module-panel"
              role="tabpanel"
              aria-labelledby="module-inventory"
              tabIndex={0}
              html={inventoryMarkup}
            />
            <p className="sample-caption">
              Illustrative product view · Sample data
            </p>
          </div>
          <div className="module-copy">
            <h2 id="modules-title">
              The tools you need.
              <br />
              Still one system.
            </h2>
            <p>Start with Core. Each module adds a tab.</p>
            <div
              className="module-list"
              role="tablist"
              aria-label="Explore modules"
              aria-orientation="vertical"
            >
              <button
                type="button"
                role="tab"
                data-module="core"
                id="module-core"
                aria-controls="module-panel"
                aria-selected="false"
                tabIndex={-1}
              >
                <span>01</span>Core<small>Required</small>
              </button>
              <button
                type="button"
                role="tab"
                data-module="hr"
                id="module-hr"
                aria-controls="module-panel"
                aria-selected="false"
                tabIndex={-1}
              >
                <span>02</span>HR
              </button>
              <button
                type="button"
                role="tab"
                data-module="inventory"
                id="module-inventory"
                aria-controls="module-panel"
                aria-selected="true"
              >
                <span>03</span>Inventory<i></i>
              </button>
              <button
                type="button"
                role="tab"
                data-module="crm"
                id="module-crm"
                aria-controls="module-panel"
                aria-selected="false"
                tabIndex={-1}
              >
                <span>04</span>CRM
              </button>
              <button
                type="button"
                role="tab"
                data-module="reporting"
                id="module-reporting"
                aria-controls="module-panel"
                aria-selected="false"
                tabIndex={-1}
              >
                <span>05</span>Reporting
              </button>
              <button
                type="button"
                role="tab"
                data-module="accounting"
                id="module-accounting"
                aria-controls="module-panel"
                aria-selected="false"
                tabIndex={-1}
              >
                <span>06</span>Accounting
              </button>
              <button
                type="button"
                role="tab"
                data-module="scheduling"
                id="module-scheduling"
                aria-controls="module-panel"
                aria-selected="false"
                tabIndex={-1}
              >
                <span>07</span>Scheduling
              </button>
            </div>
            <RuntimeRegion
              as="a"
              className="text-link"
              id="module-inquiry"
              href="#contact"
              html={
                'Ask about Inventory <svg class="icon"><use href="#diagonal"></use></svg>'
              }
            />
          </div>
        </div>
      </section>
    </>
  );
}
