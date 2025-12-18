import Keycloak from "keycloak-js";

const keycloak =
  import.meta.env.VITE_E2E === "true"
    ? {
        login: () => {},
        register: () => {},
        logout: () => {},
        authenticated: false,
      }
    : new Keycloak({
        url: "http://localhost:8081",
        realm: "collector",
        clientId: "collector-frontend",
      });

export default keycloak;
