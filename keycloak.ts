import Keycloak from "keycloak-js";

const isCypress =
  typeof window !== "undefined" && typeof window.Cypress !== "undefined";

const E2E_KEYCLOAK = {
  url: "http://localhost:8181",
  realm: "collector-e2e",
  clientId: "collector-frontend",
};

const DEFAULT_KEYCLOAK = {
  url: "http://localhost:8081",
  realm: "collector",
  clientId: "collector-frontend",
};

const cfg = isCypress ? E2E_KEYCLOAK : DEFAULT_KEYCLOAK;

export default new Keycloak(cfg);
