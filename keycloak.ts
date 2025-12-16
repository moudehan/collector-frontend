import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8080",
  realm: "collector",
  clientId: "collector-frontend",
});

export default keycloak;
