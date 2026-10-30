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
    </>
  );
}
