import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    experimentalStudio: true,
    baseUrl: "http://localhost:5173/",
    setupNodeEvents(on, config) {
      // you can hook into node events here if needed
      return config
    },
  },
});
