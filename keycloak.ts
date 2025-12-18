import Keycloak from "keycloak-js";

const isE2E = import.meta.env.VITE_E2E === "true";

const keycloak = isE2E
  ? ({
      login: () => Promise.resolve(),
      register: () => Promise.resolve(),
      logout: () => Promise.resolve(),
      authenticated: false,
      token: null,
    } as unknown as Keycloak)
  : new Keycloak({
      url: "http://localhost:8081",
      realm: "collector",
      clientId: "collector-frontend",
    });

export default keycloak;
