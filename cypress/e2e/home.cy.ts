import { CyHttpMessages } from "cypress/types/net-stubbing";

type Category = {
  id: number;
  name: string;
};

type ImageRef =
  | { kind: "fixture"; path: string }
  | { kind: "url"; url: string };

type Article = {
  id: number;
  shopId: number;

  title: string;
  description?: string;

  price?: number;
  shippingPrice?: number;
  quantity?: number;

  category?: Category;

  period?: string;
  productionYear?: string;
  condition?: string;
  vintageDetails?: string;

  images: ImageRef[];
};

type Shop = {
  id: number;
  name: string;
  description?: string;
  articles: Article[];
};

type JsonRecord = Record<string, unknown>;
type IncomingRequest = CyHttpMessages.IncomingHttpRequest;

const isRecord = (v: unknown): v is JsonRecord =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const tryParseBodyAsRecord = (raw: unknown): JsonRecord | null => {
  if (isRecord(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed: unknown = JSON.parse(raw);
      return isRecord(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
  return null;
};

const readString = (r: JsonRecord, key: string): string | undefined => {
  const v = r[key];
  return typeof v === "string" ? v : undefined;
};

const readNumber = (r: JsonRecord, key: string): number | undefined => {
  const v = r[key];
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.replace(",", "."));
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
};

const readCategory = (r: JsonRecord, key: string): Category | undefined => {
  const v = r[key];
  if (!isRecord(v)) return undefined;
  const id = readNumber(v, "id");
  const name = readString(v, "name");
  return typeof id === "number" && typeof name === "string"
    ? { id, name }
    : undefined;
};

const fillInputByLabel = (label: RegExp, value: string) => {
  cy.contains("label", label)
    .invoke("attr", "for")
    .then((id) => {
      if (!id) throw new Error(`Label sans attribut "for" pour ${label}`);
      cy.get(`#${id}`).scrollIntoView().clear().type(value);
    });
};

const clickInputByLabel = (label: RegExp) => {
  cy.contains("label", label)
    .invoke("attr", "for")
    .then((id) => {
      if (!id) throw new Error(`Label sans attribut "for" pour ${label}`);
      cy.get(`#${id}`).scrollIntoView().click();
    });
};

const selectAutocompleteByLabel = (
  label: RegExp,
  search: string,
  pick: RegExp
) => {
  clickInputByLabel(label);
  cy.focused().type(search);
  cy.get('li[role="option"]', { timeout: 10000 }).contains(pick).click();
};

const clickSeConnecter = () => {
  cy.contains("button, a", /Se connecter/i, { timeout: 30000 })
    .should("be.visible")
    .scrollIntoView()
    .click();
};
const LoginKeycloak = (
  username: string,
  password: string,
  keycloakOrigin: string,
  appOrigin: string
) => {
  cy.wait("@kcAuth", { timeout: 30000 }).then((i) => {
    const u = new URL(i.request.url);
    u.searchParams.set("prompt", "login");
    cy.visit(u.toString());
  });

  cy.location("origin", { timeout: 30000 }).should("eq", keycloakOrigin);

  cy.origin(
    keycloakOrigin,
    { args: { username, password } },
    ({ username, password }) => {
      cy.get("#username, input[name='username']", { timeout: 30000 })
        .should("be.visible")
        .clear()
        .type(username, { log: false });

      cy.get("#password, input[name='password']", { timeout: 30000 })
        .should("be.visible")
        .clear()
        .type(password, { log: false });

      cy.get("#kc-login, input[type='submit']", { timeout: 30000 })
        .should("be.visible")
        .click();
    }
  );

  cy.location("origin", { timeout: 120000 }).should("eq", appOrigin);
};

let myShops: Shop[] = [];
let allArticles: Article[] = [];

let nextShopId = 123;
let nextArticleId = 999;

let currentArticleDraft: Partial<Omit<Article, "id">> = { images: [] };

const resetState = () => {
  myShops = [];
  allArticles = [];
  nextShopId = 123;
  nextArticleId = 999;
  currentArticleDraft = { images: [] };
};

const buildArticleFromDraftAndBody = (
  draft: Partial<Omit<Article, "id">>,
  body: JsonRecord | null,
  defaultShopId: number
): Article => {
  const bodyShopId = body ? readNumber(body, "shopId") : undefined;
  const shippingFromBody = body
    ? readNumber(body, "shippingPrice") ?? readNumber(body, "shippingFees")
    : undefined;

  const shopId = Number(draft.shopId ?? bodyShopId ?? defaultShopId);

  return {
    id: nextArticleId++,
    shopId,
    title:
      draft.title ??
      (body ? readString(body, "title") : undefined) ??
      "Article Cypress E2E",
    description:
      draft.description ??
      (body ? readString(body, "description") : undefined) ??
      "",
    price: draft.price ?? (body ? readNumber(body, "price") : undefined),
    shippingPrice: draft.shippingPrice ?? shippingFromBody,
    quantity:
      draft.quantity ?? (body ? readNumber(body, "quantity") : undefined),
    category:
      draft.category ?? (body ? readCategory(body, "category") : undefined),
    period: draft.period ?? (body ? readString(body, "period") : undefined),
    productionYear:
      draft.productionYear ??
      (body ? readString(body, "productionYear") : undefined),
    condition:
      draft.condition ?? (body ? readString(body, "condition") : undefined),
    vintageDetails:
      draft.vintageDetails ??
      (body ? readString(body, "vintageDetails") : undefined),
    images: draft.images ?? [],
  };
};

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
    (Cypress.env("KEYCLOAK_ORIGIN") as string) || "http://localhost:8080";

  const USERNAME = (Cypress.env("E2E_USER") as string) || "e2e";
  const PASSWORD = (Cypress.env("E2E_PASSWORD") as string) || "e2e";

  const OTHER_USERNAME = (Cypress.env("E2E_USER_2") as string) || "e2e2";
  const OTHER_PASSWORD = (Cypress.env("E2E_PASSWORD_2") as string) || "e2e2";

  const APP_ORIGIN = new URL(
    Cypress.config("baseUrl") || "http://localhost:5173"
  ).origin;
  let createdShopId = 123;

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();

    cy.on("uncaught:exception", (err) => {
      const msg = String(err);
      if (msg.includes("Failed to fetch")) return false;
      if (msg.includes("@stripe/stripe-js")) return false;
      if (msg.includes("initStripe")) return false;
      if (msg.includes("Cannot read properties of undefined")) return false;
      return true;
    });

    resetState();
    createdShopId = 123;

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

    cy.intercept("GET", "**/api/shops/my*", (req: IncomingRequest) => {
      req.reply({ statusCode: 200, body: myShops });
    }).as("getMyShops");

    cy.intercept("POST", "**/api/shops*", (req: IncomingRequest) => {
      const body = tryParseBodyAsRecord(req.body) ?? {};
      const created: Shop = {
        id: nextShopId++,
        name: readString(body, "name") ?? "Ma boutique E2E",
        description: readString(body, "description") ?? "",
        articles: [],
      };
      myShops = [created, ...myShops];
      req.reply({ statusCode: 201, body: created });
    }).as("postShops");

    cy.intercept("GET", /\/api\/shops\/\d+$/, (req: IncomingRequest) => {
      const url = new URL(req.url);
      const idStr = url.pathname.split("/").pop() ?? "0";
      const id = Number(idStr);

      const found = myShops.find((s) => s.id === id);
      const shop: Shop = found ?? {
        id,
        name: "Ma boutique E2E",
        description: "Description créée par Cypress (E2E).",
        articles: [],
      };

      req.reply({ statusCode: 200, body: shop });
    }).as("getShopDetail");

    cy.intercept("POST", "**/api/articles*", (req: IncomingRequest) => {
      const body = tryParseBodyAsRecord(req.body);
      const created = buildArticleFromDraftAndBody(
        currentArticleDraft,
        body,
        createdShopId
      );

      allArticles.push(created);

      const shop = myShops.find((s) => s.id === created.shopId) ?? myShops[0];
      if (shop) shop.articles.push(created);

      req.reply({ statusCode: 201, body: created });
    }).as("postArticle");

    cy.intercept("GET", "**/api/articles/public*", (req: IncomingRequest) => {
      req.reply({ statusCode: 200, body: allArticles });
    }).as("getArticlesPublic");

    cy.intercept("GET", "**/api/articles*", (req: IncomingRequest) => {
      req.reply({ statusCode: 200, body: allArticles });
    }).as("getArticlesAuth");

    cy.intercept("GET", "**/realms/**/protocol/openid-connect/auth*").as(
      "kcAuth"
    );
  });

  it("crée une boutique puis un article (FormData) et vérifie la persistance en mémoire", () => {
    cy.visit("/");
    cy.wait(["@getCategories", "@getArticlesPublic"], { timeout: 6000 });

    clickSeConnecter();
    LoginKeycloak(USERNAME, PASSWORD, KEYCLOAK_ORIGIN, APP_ORIGIN);

    cy.contains("button, a", /Créer une boutique/i, { timeout: 6000 })
      .should("be.visible")
      .scrollIntoView()
      .click();

    cy.wait("@getMyShops", { timeout: 2000 });

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
        fillInputByLabel(/Nom de la boutique/i, "Ma boutique E2E");
        fillInputByLabel(
          /Description/i,
          "Description créée par Cypress (E2E)."
        );

        cy.contains("button", /^Créer la boutique$/i)
          .should("be.visible")
          .and("be.enabled")
          .click();
      });

    cy.wait("@postShops", { timeout: 6000 }).then((interception) => {
      const body: unknown = interception.response?.body;
      if (isRecord(body) && typeof body.id === "number") {
        createdShopId = body.id;
      } else {
        createdShopId = 123;
      }
    });

    cy.contains(/Ma boutique E2E/i, { timeout: 6000 }).click({ force: true });

    cy.wait("@getShopDetail", { timeout: 6000 });

    cy.contains("button, a", /Ajouter un article/i, { timeout: 6000 }).click({
      force: true,
    });

    cy.url().should("match", /\/shop\/\d+\/article\/add$/);

    currentArticleDraft.shopId = createdShopId;

    const imagePath = "cypress/fixtures/images/img-article-test.jpg";
    currentArticleDraft.images = [
      { kind: "fixture", path: "img-article-test.jpg" },
    ];

    cy.get('input[type="file"]', { timeout: 10000 })
      .first()
      .selectFile(imagePath, { force: true });

    currentArticleDraft.title = "Article Cypress E2E";
    fillInputByLabel(/Nom de l.?article/i, "Article Cypress E2E");

    currentArticleDraft.price = 19.99;
    fillInputByLabel(/^Prix/i, "19.99");

    currentArticleDraft.shippingPrice = 4.9;
    fillInputByLabel(/Frais de livraison/i, "4.90");

    currentArticleDraft.quantity = 3;
    fillInputByLabel(/Quantit[eé] disponible/i, "3");

    currentArticleDraft.category = { id: 1, name: "Cartes" };
    selectAutocompleteByLabel(/Cat[ée]gorie/i, "Car", /Cartes|Figurines/i);

    currentArticleDraft.period = "Années 90";
    fillInputByLabel(/[ÉE]poque/i, "Années 90");

    currentArticleDraft.productionYear = "1998";
    fillInputByLabel(/Ann[ée]e de production/i, "1998");

    currentArticleDraft.condition = "Très bon état";
    fillInputByLabel(/[ÉE]tat/i, "Très bon état");

    currentArticleDraft.vintageDetails =
      "Super pièce vintage, histoire test E2E.";
    fillInputByLabel(
      /D[ée]tails vintage/i,
      "Super pièce vintage, histoire test E2E."
    );

    currentArticleDraft.description =
      "Description de l’article créée par Cypress (E2E).";
    fillInputByLabel(
      /Description/i,
      "Description de l’article créée par Cypress (E2E)."
    );

    cy.contains("button", /Cr[ée]er l.?article/i)
      .should("be.enabled")
      .click();

    cy.wait("@postArticle", { timeout: 6000 }).then((interception) => {
      expect(interception.response?.statusCode).to.eq(201);
    });

    cy.wait("@getShopDetail", { timeout: 6000 });

    cy.get("header")
      .find("button.MuiIconButton-root")
      .filter(":has(.MuiAvatar-root)")
      .should("be.visible")
      .click();

    cy.contains(".MuiListItemButton-root", /Se d[ée]connecter/i, {
      timeout: 10000,
    })
      .should("be.visible")
      .click();

    cy.clearCookies();
    cy.clearLocalStorage();

    cy.intercept("GET", "**/api/auth/me*", {
      statusCode: 200,
      body: { id: 2, username: OTHER_USERNAME, roles: ["USER"] },
    }).as("getMeOther");

    cy.wait(["@getCategories", "@getArticlesPublic"], { timeout: 6000 });

    clickSeConnecter();
    LoginKeycloak(OTHER_USERNAME, OTHER_PASSWORD, KEYCLOAK_ORIGIN, APP_ORIGIN);
    cy.wait("@getMeOther", { timeout: 2000 });

    cy.contains(/Article Cypress E2E/i, { timeout: 6000 }).should("be.visible");
  });
});
