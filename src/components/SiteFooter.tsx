export default function SiteFooter() {
  return (
    <>
      <footer className="site-footer">
        <div className="footer-inner wrap">
          <div className="footer-main">
            <a className="brand" href="#home" aria-label="Axon Enjin home">
              <img src="/assets/axon-mark.svg" width="39" height="26" alt="" />
              <span>AXON ENJIN</span>
            </a>
            <p>Metro Manila, Philippines</p>
            <nav aria-label="Footer navigation">
              <a href="#company">Team</a>
              <a href="/articles/">Articles</a>
              <a href="#contact">Contact</a>
            </nav>
          </div>
          <div className="footer-bottom">
            <span>
              © <span id="year">2026</span> Axon Enjin
            </span>
            <span>The one who connects.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
