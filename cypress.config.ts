import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_baseUrl || "http://frontend-e2e:5173",
    supportFile: false,
    video: false,
    chromeWebSecurity: false,
    defaultCommandTimeout: 20000,
    pageLoadTimeout: 60000,
  },
});
