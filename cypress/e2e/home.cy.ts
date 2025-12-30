let myShops: Array<{
  id: number;
  name: string;
  description?: string;
  articles: Array<{
    id: number;
    title: string;
    description?: string;
    price?: number;
  }>;
}> = [];

Cypress.on("uncaught:exception", (err) => {
  const msg = String(err);

  if (msg.includes("@stripe/stripe-js")) return false;
  if (msg.includes("initStripe")) return false;
  if (msg.includes("Cannot read properties of undefined (reading 'match')"))
    return false;
  if (msg.includes("Cannot read properties of undefined (reading 'slice')"))
    return false;

  return true;
});

describe("Créer une boutique puis un article", () => {
  const KEYCLOAK_ORIGIN =
    (Cypress.env("KEYCLOAK_ORIGIN") as string) || "http://localhost:8181";

  const USERNAME = (Cypress.env("E2E_USER") as string) || "e2e";
  const PASSWORD = (Cypress.env("E2E_PASSWORD") as string) || "e2e";

  const OTHER_USERNAME = (Cypress.env("E2E_USER_2") as string) || "e2e2";
  const OTHER_PASSWORD = (Cypress.env("E2E_PASSWORD_2") as string) || "e2e2";

  const APP_ORIGIN = new URL(
    Cypress.config("baseUrl") || "http://localhost:5173"
  ).origin;

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();

    cy.on("uncaught:exception", (err) => {
      if (String(err).includes("Failed to fetch")) return false;
      if (String(err).includes("@stripe/stripe-js")) return false;
      if (String(err).includes("initStripe")) return false;
      if (String(err).includes("Cannot read properties of undefined"))
        return false;
      return true;
    });

    cy.intercept("GET", "**/api/categories*", {
      fixture: "categories.json",
    }).as("getCategories");

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

    cy.intercept("GET", "**/api/auth/me*", {
      statusCode: 200,
      body: { id: 1, username: "e2e", roles: ["USER"] },
    }).as("getMe");

    // --------- état en mémoire des shops ---------
    myShops = [];

    cy.intercept("GET", "**/api/shops/my*", (req) => {
      req.reply({ statusCode: 200, body: myShops });
    }).as("getMyShops");

    cy.intercept("POST", "**/api/shops*", (req) => {
      const body = req.body || {};

      const created = {
        id: 123,
        name: body.name || "Ma boutique E2E",
        description: body.description || "",
        articles: [] as Array<{
          id: number;
          title: string;
          description?: string;
          price?: number;
        }>,
      };

      myShops = [created, ...myShops];

      req.reply({ statusCode: 201, body: created });
    }).as("postShops");

    cy.intercept("GET", /\/api\/shops\/\d+$/, (req) => {
      const url = new URL(req.url);
      const idStr = url.pathname.split("/").pop()!;
      const id = Number(idStr);

      const found = myShops.find((s) => s.id === id);

      const shop = found || {
        id,
        name: "Ma boutique E2E",
        description: "Description créée par Cypress (E2E).",
        articles: [],
      };

      if (!shop.articles) shop.articles = [];

      req.reply({ statusCode: 200, body: shop });
    }).as("getShopDetail");

    // --------- création d’article et stockage dans le shop ---------
    cy.intercept("POST", "**/api/articles*", (req) => {
      const body = req.body || {};

      const shopId = Number(body.shopId || body.shop?.id || 123);

      const createdArticle = {
        id: 999,
        title: body.title || "Article Cypress E2E",
        description: body.description || "",
        price: body.price ?? 10,
        shippingPrice: body.shippingPrice ?? body.shippingFees ?? 0,
        quantity: body.quantity ?? 1,
        category: body.category ?? null,
        period: body.period ?? body.epoch ?? "",
        productionYear: body.productionYear ?? "",
        condition: body.condition ?? "",
        vintageDetails: body.vintageDetails ?? "",
        images: body.images ?? [],
        shopId,
      };

      const shop =
        myShops.find((s) => String(s.id) === String(shopId)) ||
        myShops.find((s) => s.id === 123);

      if (shop) {
        if (!shop.articles) shop.articles = [];
        shop.articles.push(createdArticle);
      }

      req.reply({ statusCode: 201, body: createdArticle });
    }).as("postArticle");

    // --------- liste des articles (home + pages protégées) ---------
    cy.intercept("GET", "**/api/articles/public*", (req) => {
      const allArticles = myShops.flatMap((s) => s.articles || []);
      req.reply({ statusCode: 200, body: allArticles });
    }).as("getArticlesPublic");

    cy.intercept("GET", "**/api/articles*", (req) => {
      const allArticles = myShops.flatMap((s) => s.articles || []);
      req.reply({ statusCode: 200, body: allArticles });
    }).as("getArticlesAuth");

    cy.intercept("GET", "**/realms/**/protocol/openid-connect/auth*").as(
      "kcAuth"
    );
  });

  function forceInteractiveKeycloakLogin(
    username: string = USERNAME,
    password: string = PASSWORD
  ) {
    cy.contains("button, a", "Se connecter", { timeout: 6000 })
      .should("be.visible")
      .click();

    cy.wait("@kcAuth", { timeout: 6000 }).then((i) => {
      const raw = i.request.url;
      const u = new URL(raw);

      u.searchParams.set("prompt", "login");

      const loginUrl = u.toString();
      cy.log("FORCED Keycloak login URL => " + loginUrl);

      cy.visit(loginUrl);
    });

    cy.location("origin", { timeout: 6000 }).should("eq", KEYCLOAK_ORIGIN);

    cy.origin(
      KEYCLOAK_ORIGIN,
      { args: { username, password } },
      ({ username, password }) => {
        cy.get("#username, input[name='username']", { timeout: 6000 })
          .should("be.visible")
          .clear()
          .type(username, { log: false });

        cy.get("#password, input[name='password']", { timeout: 6000 })
          .should("be.visible")
          .clear()
          .type(password, { log: false });

        cy.get("#kc-login, input[type='submit']", { timeout: 6000 })
          .should("be.visible")
          .click();
      }
    );

    cy.location("origin", { timeout: 120000 }).should("eq", APP_ORIGIN);
  }

  it("se connecte si besoin puis crée une boutique puis un article", () => {
    cy.visit("/");
    cy.wait(["@getCategories", "@getArticlesPublic"], { timeout: 6000 });

    cy.get("body").then(($body) => {
      if ($body.text().includes("Se connecter")) {
        forceInteractiveKeycloakLogin(USERNAME, PASSWORD);
      }
    });

    cy.contains("button, a", /Créer une boutique/i, { timeout: 6000 })
      .should("be.visible")
      .scrollIntoView()
      .click();

    cy.wait("@getMyShops", { timeout: 6000 });

    cy.get("body").then(($b) => {
      const hasDialog = $b.find('[role="dialog"]').length > 0;
      if (!hasDialog) {
        cy.contains("button, a", /^Créer une boutique$/i, { timeout: 6000 })
          .should("be.visible")
          .scrollIntoView()
          .click();
      }
    });

    cy.get('[role="dialog"]', { timeout: 6000 })
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

    cy.wait("@postShops", { timeout: 6000 }).then((interception) => {
      expect(interception.request.method).to.eq("POST");
      expect(interception.request.url).to.match(/\/api\/shops/i);
      expect(interception.response?.statusCode).to.eq(201);
    });

    cy.contains(/Ma boutique E2E/i, { timeout: 6000 }).click({ force: true });

    cy.wait("@getShopDetail", { timeout: 6000 });

    cy.contains("button, a", /Ajouter un article/i, { timeout: 6000 }).click({
      force: true,
    });

    cy.url().should("match", /\/shop\/\d+\/article\/add$/);

    cy.contains(/Ajouter un nouvel article/i, { timeout: 6000 }).should(
      "be.visible"
    );

    const imagePath = "cypress/fixtures/images/img-article-test.jpg";

    cy.get('input[type="file"]', { timeout: 10000 })
      .first()
      .selectFile(imagePath, { force: true });

    cy.contains("label", /Nom de l.?article/i)
      .invoke("attr", "for")
      .then((id) => {
        cy.get(`#${id}`).scrollIntoView().clear().type("Article Cypress E2E");
      });

    cy.contains("label", /^Prix/i)
      .invoke("attr", "for")
      .then((id) => {
        cy.get(`#${id}`).scrollIntoView().clear().type("19.99");
      });

    cy.contains("label", /Frais de livraison/i)
      .invoke("attr", "for")
      .then((id) => {
        cy.get(`#${id}`).scrollIntoView().clear().type("4.90");
      });

    cy.contains("label", /Quantit[eé] disponible/i)
      .invoke("attr", "for")
      .then((id) => {
        cy.get(`#${id}`).scrollIntoView().clear().type("3");
      });

    cy.contains("label", /Cat[ée]gorie/i)
      .invoke("attr", "for")
      .then((id) => {
        cy.get(`#${id}`).scrollIntoView().click().type("Car");
      });

    cy.get('li[role="option"]', { timeout: 10000 })
      .contains(/Cartes|Figurines/i)
      .click();

    cy.contains("label", /[ÉE]poque/i)
      .invoke("attr", "for")
      .then((id) => {
        cy.get(`#${id}`).scrollIntoView().clear().type("Années 90");
      });

    cy.contains("label", /Ann[ée]e de production/i)
      .invoke("attr", "for")
      .then((id) => {
        cy.get(`#${id}`).scrollIntoView().clear().type("1998");
      });

    cy.contains("label", /[ÉE]tat/i)
      .invoke("attr", "for")
      .then((id) => {
        cy.get(`#${id}`).scrollIntoView().clear().type("Très bon état");
      });

    cy.contains("label", /D[ée]tails vintage/i)
      .invoke("attr", "for")
      .then((id) => {
        cy.get(`#${id}`)
          .scrollIntoView()
          .clear()
          .type("Super pièce vintage, histoire test E2E.");
      });

    cy.contains("label", /Description/i)
      .invoke("attr", "for")
      .then((id) => {
        cy.get(`#${id}`)
          .scrollIntoView()
          .clear()
          .type("Description de l’article créée par Cypress (E2E).");
      });

    cy.contains("button", /Cr[ée]er l.?article/i)
      .should("be.enabled")
      .click();

    cy.wait("@postArticle", { timeout: 6000 }).then((interception) => {
      expect(interception.request.method).to.eq("POST");
      expect(interception.request.url).to.match(/\/api\/articles/i);
      expect(interception.response?.statusCode).to.eq(201);
    });

    cy.get(".MuiAvatar-root").should("be.visible").click();

    cy.contains(".MuiListItemButton-root", /Se d[ée]connecter/i, {
      timeout: 6000,
    }).click({ force: true });

    cy.url({ timeout: 6000 }).should("match", /\/$/);

    cy.clearCookies();
    cy.clearLocalStorage();

    cy.intercept("GET", "**/api/auth/me*", {
      statusCode: 200,
      body: { id: 2, username: OTHER_USERNAME, roles: ["USER"] },
    }).as("getMeOther");

    cy.visit("/");

    cy.wait(["@getCategories", "@getArticlesPublic"], { timeout: 6000 });

    cy.get("body").then(($body) => {
      if ($body.text().includes("Se connecter")) {
        forceInteractiveKeycloakLogin(OTHER_USERNAME, OTHER_PASSWORD);
      }
    });

    cy.wait("@getMeOther", { timeout: 6000 });

    cy.visit("/shop/123");
    cy.wait("@getShopDetail", { timeout: 6000 });
    cy.contains(/Article Cypress E2E/i, { timeout: 6000 }).should("be.visible");
  });
});
