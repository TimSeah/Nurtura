import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";

/*

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
  */
import { ClerkProvider } from "@clerk/clerk-react"; // import clerk

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY; // get publishable key from .env file
console.log("CLERK KEY:", clerkPubKey);
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>
);
