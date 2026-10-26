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
          <a href="#home">Home</a>
          <a href="#purpose">About</a>
          <a href="#business-model">How we build</a>
          <a href="#ventures">Ventures</a>
          <a href="#proof">Public work</a>
          <a href="#articles">Articles</a>
          <a href="#company">Team</a>
          <a href="#contact">Collaborate</a>
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
    </>
  );
}
