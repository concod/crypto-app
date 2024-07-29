// src/setupTests.ts
import { createRoot } from "react-dom/client";
import { render as rtlRender } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";

function render(ui, { ...options } = {}) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  return {
    ...rtlRender(ui, {
      container,
      ...options,
      wrapper: ({ children }) => <Router>{children}</Router>,
    }),
    container,
    root,
  };
}

// Re-export everything from @testing-library/react
export * from "@testing-library/react";
// Override the render method
export { render };
