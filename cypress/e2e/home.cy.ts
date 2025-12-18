describe("Home page E2E", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/articles/public", {
      fixture: "articles.json",
    }).as("getArticles");

    cy.intercept("GET", "**/categories", {
      fixture: "categories.json",
    }).as("getCategories");

    cy.intercept("GET", "**/articles/public?categoryId=*", {
      fixture: "category-articles.json",
    }).as("getArticlesByCategory");

    cy.visit("/");
  });

  it("displays hero section and signup button", () => {
    cy.contains("Achetez et vendez des objets de collection").should(
      "be.visible"
    );

    cy.contains("S'inscrire").should("be.visible");
  });

  it("loads and displays public articles", () => {
    cy.wait("@getArticles");

    cy.get('[data-testid="public-article-card"]').should(
      "have.length.at.least",
      1
    );
  });

  it("loads and displays categories", () => {
    cy.wait("@getCategories");

    cy.get('[data-testid="category-button"]').should("have.length.at.least", 1);
  });

  it("toggles show all categories", () => {
    cy.contains("Voir tout").click();
    cy.contains("Voir moins").should("be.visible");
  });

  it("filters articles by category", () => {
    cy.contains("Cartes").click();

    cy.contains("Articles : Cartes").should("be.visible");

    cy.get('[data-testid="public-article-card"]').should(
      "have.length.at.least",
      1
    );
  });
});
