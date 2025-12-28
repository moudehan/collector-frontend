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

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();

    cy.on("uncaught:exception", (err) => {
      if (String(err).includes("Failed to fetch")) return false;
      return true;
    });

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
  });

  it("se connecte si besoin puis crée une boutique", () => {
    cy.visit("/");

    cy.wait(["@getCategories", "@getArticlesPublic"], { timeout: 20000 });

    cy.get("body").then(($body) => {
      const hasLogin = $body.text().includes("Se connecter");
      if (!hasLogin) return;

      cy.contains("button, a", "Se connecter", { timeout: 20000 })
        .should("be.visible")
        .click();

      cy.origin(KEYCLOAK_ORIGIN, () => {
        cy.get("#username, input[name='username']", { timeout: 20000 })
          .should("be.visible")
          .clear()
          .type("e2e");

        cy.get("#password, input[name='password']")
          .should("be.visible")
          .clear()
          .type("e2e");

        cy.get("#kc-login, input[type='submit']").should("be.visible").click();
      });

      cy.location("origin", { timeout: 60000 }).should(
        "contain",
        "http://localhost:5173"
      );
    });

    cy.visit("/Home");

    cy.contains("button, a", /créer une boutique/i, { timeout: 20000 })
      .should("be.visible")
      .click();

    cy.wait("@getMyShops", { timeout: 20000 });

    cy.contains("Créer une boutique", { timeout: 20000 })
      .should("be.visible")
      .click();

    cy.get('[role="dialog"]', { timeout: 20000 })
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

    cy.wait("@postShops", { timeout: 20000 }).then((interception) => {
      expect(interception.request.method).to.eq("POST");
      expect(interception.request.url).to.match(/\/api\/shops/i);
      expect(interception.response?.statusCode).to.eq(201);
    });
    cy.wait("@getMyShops", { timeout: 20000 });
  });
});
