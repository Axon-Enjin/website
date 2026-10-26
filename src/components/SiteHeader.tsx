export default function SiteHeader() {
  return (
    <>
      <header className="site-header" id="site-header">
        <div className="header-container">
          <a className="brand" href="#home" aria-label="Axon Enjin home">
            <img src="/assets/axon-mark.svg" width="39" height="26" alt="" />
            <span>AXON ENJIN</span>
          </a>
          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="#purpose">About</a>
            <a href="#articles">Articles</a>
          </nav>
          <a className="button header-cta" href="#contact">
            Collaborate{" "}
            <svg className="icon">
              <use href="#diagonal" />
            </svg>
          </a>
          <button
            className="menu-toggle"
            type="button"
            aria-expanded="false"
            aria-controls="mobile-nav"
            aria-label="Open navigation"
          >
            <span></span>
            <span></span>
          </button>
        </div>
        <nav
          className="mobile-nav"
          id="mobile-nav"
          aria-label="Mobile navigation"
          hidden
        >
          <a href="#purpose">About</a>
          <a href="#business-model">How we build</a>
          <a href="#articles">Articles</a>
          <a href="#company">Team</a>
          <a href="#contact">Collaborate</a>
        </nav>
      </header>
    </>
  );
}
