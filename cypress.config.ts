import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    experimentalStudio: true,
    baseUrl: 'http://[::1]:5173',
    chromeWebSecurity: false,
    env: {
      apiUrl: "http://localhost:5000"
    },
    setupNodeEvents(on, config) {
      // you can hook into node events here if needed
      return config
    },
  },
});
