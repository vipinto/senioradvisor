import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// Prevent Google Maps IntersectionObserver errors from crashing the app
window.addEventListener('error', (e) => {
  if (e.message?.includes('IntersectionObserver')) {
    e.preventDefault();
  }
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
