describe("Home page E2E", () => {
  it("affiche le hero, les articles, les catégories et le filtrage par catégorie", () => {
    cy.intercept("GET", "**/articles/public", (req) => {
      if (req.url.includes("categoryId=")) {
        req.reply({ fixture: "category-articles.json" });
      } else {
        req.reply({ fixture: "articles.json" });
      }
    }).as("getArticles");

    cy.intercept("GET", "**/categories", {
      fixture: "categories.json",
    }).as("getCategories");

    cy.visit("/Home");

    cy.contains("Achetez et vendez").should("be.visible");
    cy.contains("S'inscrire").should("be.visible");

    cy.get('[data-testid="public-article-card"]')
      .should("exist")
      .and("have.length.at.least", 1);

    cy.contains("Parcourir par catégorie").should("be.visible");

    cy.contains("Voir tout").click();
    cy.contains("Voir moins").should("be.visible");

    cy.contains("Cartes").click();
    cy.contains("Articles : Cartes").should("be.visible");

    cy.get('[data-testid="public-article-card"]')
      .should("exist")
      .and("have.length.at.least", 1);
  });
});
