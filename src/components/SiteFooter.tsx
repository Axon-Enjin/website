export default function SiteFooter() {
  return (
    <>
      <footer className="site-footer wrap">
        <div className="footer-main">
          <a className="brand" href="#home" aria-label="Axon Enjin home">
            <img src="/assets/axon-mark.svg" width="39" height="26" alt="" />
            <span>AXON ENJIN</span>
          </a>
          <p>Metro Manila, Philippines</p>
          <nav aria-label="Footer navigation">
            <a href="#modules">Modules</a>
            <a href="#company">Company</a>
            <a href="#how-we-work">How we work</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>
            © <span id="year">2026</span> Axon Enjin
          </span>
          <span>People, connected.</span>
          <button type="button" data-dialog="ventures-dialog">
            Ventures{" "}
            <svg className="icon">
              <use href="#diagonal" />
            </svg>
          </button>
        </div>
      </footer>
    </>
  );
}
