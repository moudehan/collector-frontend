/// <reference types="cypress" />

let myShops: Array<{ id: number; name: string; description?: string }> = [];

Cypress.on("uncaught:exception", (err) => {
  const msg = String(err);

  if (msg.includes("@stripe/stripe-js")) return false;
  if (msg.includes("initStripe")) return false;
  if (msg.includes("Cannot read properties of undefined (reading 'match')"))
    return false;

  return true;
});

describe("Créer une boutique", () => {
  const KEYCLOAK_ORIGIN =
    (Cypress.env("KEYCLOAK_ORIGIN") as string) || "http://localhost:8181";

  const USERNAME = (Cypress.env("E2E_USER") as string) || "e2e";
  const PASSWORD = (Cypress.env("E2E_PASSWORD") as string) || "e2e";

  const APP_ORIGIN = new URL(
    Cypress.config("baseUrl") || "http://localhost:5173"
  ).origin;

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();

    cy.on("uncaught:exception", (err) => {
      if (String(err).includes("Failed to fetch")) return false;
      return true;
    });

    // ---------- API mocks ----------
    cy.intercept("GET", "**/api/categories*", {
      fixture: "categories.json",
    }).as("getCategories");

    cy.intercept("GET", "**/api/articles/public*", {
      fixture: "articles.json",
    }).as("getArticlesPublic");

    cy.intercept("GET", "**/api/auth/me*", {
      statusCode: 200,
      body: { id: 1, username: "e2e", roles: ["USER"] },
    }).as("getMe");

    cy.intercept("GET", "**/api/cart*", {
      statusCode: 200,
      body: { items: [], total: 0 },
    }).as("getCart");

    cy.intercept("GET", "**/api/conversations*", {
      statusCode: 200,
      body: [],
    }).as("getConversations");

    cy.intercept("GET", "**/api/notifications/my*", {
      statusCode: 200,
      body: [],
    }).as("getNotifications");

    cy.intercept("GET", "**/api/articles*", { fixture: "articles.json" }).as(
      "getArticlesAuth"
    );

    // ---------- Shops mocks ----------
    myShops = [];

    cy.intercept("GET", "**/api/shops/my*", (req) => {
      req.reply({ statusCode: 200, body: myShops });
    }).as("getMyShops");

    cy.intercept("POST", "**/api/shops*", (req) => {
      const body = req.body as { name?: string; description?: string };

      const created = {
        id: 123,
        name: body?.name ?? "Ma boutique E2E",
        description: body?.description ?? "",
      };

      myShops = [created, ...myShops];
      req.reply({ statusCode: 201, body: created });
    }).as("postShops");

    // ---------- Keycloak intercept (IMPORTANT) ----------
    // On track la requête auth Keycloak pour savoir si le clic lance bien le login
    cy.intercept("GET", "**/realms/**/protocol/openid-connect/auth*").as(
      "kcAuth"
    );
  });

  it("se connecte si besoin puis crée une boutique", () => {
    cy.visit("/");

    cy.wait(["@getCategories", "@getArticlesPublic"], { timeout: 60000 });

    // Si "Se connecter" existe, on fait le flow Keycloak
    cy.get("body").then(($body) => {
      const hasLogin = $body.text().includes("Se connecter");
      if (!hasLogin) return;

      // Force même onglet si l’app ouvre un popup (window.open)
      cy.window().then((win) => {
        cy.stub(win, "open").callsFake((url) => {
          win.location.href = String(url);
          return null;
        });
      });

      cy.contains("button, a", "Se connecter", { timeout: 60000 })
        .should("be.visible")
        .then(($el) => {
          // Force même onglet si c’est un lien target=_blank
          if ($el.is("a")) cy.wrap($el).invoke("removeAttr", "target");
        })
        .click();

      // 1) On attend que l’app appelle Keycloak (sinon: ton bouton ne lance pas Keycloak)
      cy.wait("@kcAuth", { timeout: 60000 }).then((i) => {
        cy.log("Keycloak auth url => " + i.request.url);
      });

      // 2) On attend d’être réellement sur l’origin Keycloak
      cy.location("origin", { timeout: 60000 }).should("eq", KEYCLOAK_ORIGIN);

      // 3) On remplit le formulaire Keycloak sur son origin
      cy.origin(
        KEYCLOAK_ORIGIN,
        { args: { username: USERNAME, password: PASSWORD } },
        ({ username, password }) => {
          cy.get("#username, input[name='username']", { timeout: 60000 })
            .should("be.visible")
            .clear()
            .type(username, { log: false });

          cy.get("#password, input[name='password']", { timeout: 60000 })
            .should("be.visible")
            .clear()
            .type(password, { log: false });

          cy.get("#kc-login, input[type='submit']", { timeout: 60000 })
            .should("be.visible")
            .click();
        }
      );

      // 4) Retour app
      cy.location("origin", { timeout: 120000 }).should("eq", APP_ORIGIN);
    });

    // ---------- Create shop ----------
    cy.get("body", { timeout: 60000 }).then(($b) => {
      const hasCreate = /créer une boutique/i.test($b.text());
      if (!hasCreate) {
        cy.visit("/ShopManagement");
      }
    });

    cy.contains("button, a", /Créer une boutique/i, { timeout: 60000 })
      .should("be.visible")
      .scrollIntoView()
      .click();

    cy.wait("@getMyShops", { timeout: 60000 });

    cy.get("body").then(($b) => {
      const hasDialog = $b.find('[role="dialog"]').length > 0;
      if (!hasDialog) {
        cy.contains("button, a", /^Créer une boutique$/i, { timeout: 60000 })
          .should("be.visible")
          .scrollIntoView()
          .click();
      }
    });

    cy.get('[role="dialog"]', { timeout: 60000 })
      .should("be.visible")
      .within(() => {
        cy.contains("label", "Nom de la boutique")
          .invoke("attr", "for")
          .then((id) => cy.get(`#${id}`).clear().type("Ma boutique E2E"));

        cy.contains("label", "Description")
          .invoke("attr", "for")
          .then((id) =>
            cy
              .get(`#${id}`)
              .clear()
              .type("Description créée par Cypress (E2E).")
          );

        cy.contains("button", /^Créer la boutique$/i)
          .should("be.visible")
          .and("be.enabled")
          .click();
      });

    cy.wait("@postShops", { timeout: 60000 }).then((interception) => {
      expect(interception.request.method).to.eq("POST");
      expect(interception.request.url).to.match(/\/api\/shops/i);
      expect(interception.response?.statusCode).to.eq(201);
    });

    cy.wait("@getMyShops", { timeout: 60000 });
  });
});
