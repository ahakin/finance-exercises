import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import IncomeStandalone from "./IncomeStandalone";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <IncomeStandalone />
  </StrictMode>
);
