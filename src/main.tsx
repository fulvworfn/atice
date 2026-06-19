import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { startStarField } from "./lib/starField";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error('No se encontró el elemento #root en index.html');
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// El fondo de estrellas se dibuja en un <canvas> independiente
// fuera del árbol de React, igual que en el original, pero ahora
// vive en su propio módulo y se limpia correctamente si se
// recarga en caliente (HMR) durante el desarrollo.
const stopStarField = startStarField();
if (import.meta.hot) {
  import.meta.hot.dispose(() => stopStarField());
}
