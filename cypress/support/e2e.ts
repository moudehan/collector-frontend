Cypress.on("uncaught:exception", (err) => {
  if (String(err).includes("@stripe/stripe-js")) return false;
  if (String(err).includes("initStripe")) return false;
  return true;
});

Cypress.on("window:before:load", (win) => {
  if (!win.crypto) {
    // @ts-expect-error patch
    win.crypto = {};
  }

  if (!win.crypto.getRandomValues) {
    win.crypto.getRandomValues = <T extends ArrayBufferView>(array: T): T => {
      const view = new DataView(
        array.buffer,
        array.byteOffset,
        array.byteLength
      );

      for (let i = 0; i < view.byteLength; i++) {
        view.setUint8(i, Math.floor(Math.random() * 256));
      }

      return array;
    };
  }
});
