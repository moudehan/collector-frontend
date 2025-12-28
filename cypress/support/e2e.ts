Cypress.on("uncaught:exception", (err) => {
  if (String(err).includes("@stripe/stripe-js")) return false;
  if (String(err).includes("initStripe")) return false;
  return true;
});
