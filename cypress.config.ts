import { defineConfig } from "cypress";
import { FRONT_URL } from "./config";

export default defineConfig({
  e2e: {
    baseUrl: FRONT_URL,
    viewportWidth: 1280,
    viewportHeight: 800,
  },
});
