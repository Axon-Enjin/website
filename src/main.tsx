import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "../assets/site.css";
import "../assets/fidelity.css";
import "../assets/hero.css";
import "../assets/assembly.css";
import "../assets/manifesto.css";
import "../assets/contact.css";

const root = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);
if (root.childElementCount > 0) hydrateRoot(root, app);
else createRoot(root).render(app);
