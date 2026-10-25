export default function Dialogs() {
  return (
    <>
      <dialog
        className="site-dialog"
        id="command-dialog"
        aria-labelledby="command-title"
      >
        <div className="dialog-heading">
          <h2 id="command-title">Where would you like to go?</h2>
          <button
            className="dialog-close"
            type="button"
            aria-label="Close navigation"
          >
            ×
          </button>
        </div>
        <nav aria-label="Quick navigation">
          <a href="#home">
            Home <span>01</span>
          </a>
          <a href="#product">
            Product <span>02</span>
          </a>
          <a href="#modules">
            Modules <span>04</span>
          </a>
          <a href="#offers">
            Ways to work <span>05</span>
          </a>
          <a href="#how-we-work">
            How we work <span>06</span>
          </a>
          <a href="#company">
            Company <span>07</span>
          </a>
          <a href="#contact">
            Contact <span>08</span>
          </a>
        </nav>
        <p>Use Tab to browse · Escape to close</p>
      </dialog>
      <dialog
        className="site-dialog"
        id="inquiry-dialog"
        aria-labelledby="inquiry-title"
      >
        <div className="dialog-heading">
          <h2 id="inquiry-title">Your inquiry, ready to copy.</h2>
          <button
            className="dialog-close"
            type="button"
            aria-label="Close inquiry"
          >
            ×
          </button>
        </div>
        <p>This has not been sent. Copy or download it to keep a record.</p>
        <textarea
          id="inquiry-preview"
          readOnly
          rows={10}
          aria-label="Prepared inquiry"
        ></textarea>
        <div className="dialog-actions">
          <button type="button" className="text-link" id="download-inquiry">
            Download .txt{" "}
            <svg className="icon">
              <use href="#diagonal" />
            </svg>
          </button>
          <button type="button" className="button" id="copy-inquiry">
            Copy inquiry{" "}
            <svg className="icon">
              <use href="#check" />
            </svg>
          </button>
        </div>
        <p id="copy-status" role="status"></p>
      </dialog>
      <dialog
        className="site-dialog"
        id="buying-dialog"
        aria-labelledby="buying-title"
      >
        <div className="dialog-heading">
          <h2 id="buying-title">
            A clear scope.
            <br />A quote for your setup.
          </h2>
          <button
            className="dialog-close"
            type="button"
            aria-label="Close buying information"
          >
            ×
          </button>
        </div>
        <p>
          Start with a conversation about your branches, current tools and the
          work you need to do.
        </p>
        <ol>
          <li>Choose Core and the modules you need.</li>
          <li>
            Agree any customization, setup and support in a written scope.
          </li>
          <li>Review your quotation before work begins.</li>
        </ol>
        <p>
          Custom software includes build + 12 months of maintenance by default.
          Your proposal sets the scope, renewal terms and ownership details.
        </p>
        <a className="button" href="#contact">
          Talk about your setup{" "}
          <svg className="icon">
            <use href="#diagonal" />
          </svg>
        </a>
      </dialog>
      <dialog
        className="site-dialog"
        id="ventures-dialog"
        aria-labelledby="ventures-title"
      >
        <div className="dialog-heading">
          <h2 id="ventures-title">Sometimes, we co-build.</h2>
          <button
            className="dialog-close"
            type="button"
            aria-label="Close ventures information"
          >
            ×
          </button>
        </div>
        <p>
          Alongside our software work, we sometimes collaborate on startups.
          Collaboration is paid; optional equity may be part of selected
          arrangements.
        </p>
        <p>Tell us what you are working on through the inquiry form.</p>
        <a
          className="text-link"
          href="#contact"
          data-inquiry="Venture collaboration"
        >
          Start a conversation{" "}
          <svg className="icon">
            <use href="#diagonal" />
          </svg>
        </a>
      </dialog>
    </>
  );
}
