import PageProgress from "./components/PageProgress";
import IconDefinitions from "./components/IconDefinitions";
import SiteHeader from "./components/SiteHeader";
import Hero from "./components/Hero";
import Manifesto from "./components/Manifesto";
import {
  BusinessModel,
  Ventures,
  Proof,
  Articles,
} from "./components/CompanySections";
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
        <Manifesto />
        <BusinessModel />
        <Ventures />
        <Proof />
        <Articles />
        <Company />
        <Contact />
      </main>
      <SiteFooter />
      <MotionToggle />
      <Dialogs />
    </>
  );
}
