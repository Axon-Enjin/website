import PageProgress from "./components/PageProgress";
import IconDefinitions from "./components/IconDefinitions";
import SiteHeader from "./components/SiteHeader";
import Hero from "./components/Hero";
import Assembly from "./components/Assembly";
import Manifesto from "./components/Manifesto";
import Modules from "./components/Modules";
import Offers from "./components/Offers";
import Delivery from "./components/Delivery";
import Company from "./components/Company";
import Contact from "./components/Contact";
import SiteFooter from "./components/SiteFooter";
import MotionToggle from "./components/MotionToggle";
import Dialogs from "./components/Dialogs";
import { useLayoutEffect } from "react";
import { initializeSite } from "./runtime/site.js";

export default function App() {
  useLayoutEffect(() => {
    const cleanup = initializeSite();
    // Development has no pre-rendered anchors until React mounts.
    if (location.hash && scrollY < 1) {
      let id = location.hash.slice(1);
      try {
        id = decodeURIComponent(id);
      } catch {
        /* Ignore malformed URL escapes. */
      }
      const target = document.getElementById(id);
      target?.scrollIntoView({ behavior: "instant", block: "start" });
    }
    return cleanup;
  }, []);
  return (
    <>
      <PageProgress />
      <IconDefinitions />
      <SiteHeader />
      <main id="main">
        <Hero />
        <Assembly />
        <Manifesto />
        <Modules />
        <Offers />
        <Delivery />
        <Company />
        <Contact />
      </main>
      <SiteFooter />
      <MotionToggle />
      <Dialogs />
    </>
  );
}
