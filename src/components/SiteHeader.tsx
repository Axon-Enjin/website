export default function SiteHeader() {
  return (
    <>
      <header className="site-header" id="site-header">
        <a className="brand" href="#home" aria-label="Axon Enjin home">
          <img src="/assets/axon-mark.svg" width="39" height="26" alt="" />
          <span>AXON ENJIN</span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#product">Product</a>
          <a href="#modules">Modules</a>
          <a href="#company">Company</a>
        </nav>
        <a className="button header-cta" href="#contact">
          Talk to us{" "}
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
        <nav
          className="mobile-nav"
          id="mobile-nav"
          aria-label="Mobile navigation"
          hidden
        >
          <a href="#product">Product</a>
          <a href="#modules">Modules</a>
          <a href="#offers">Ways to work</a>
          <a href="#company">Company</a>
          <a href="#contact">Talk to us</a>
        </nav>
      </header>
    </>
  );
}
