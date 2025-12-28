cy.on("uncaught:exception", (err) => {
  if (String(err).includes("stripe")) return false;
  if (String(err).includes("Failed to fetch")) return false;
  return true;
});
