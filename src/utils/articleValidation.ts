export type ArticleValidationRules = {
  MAX_IMAGES: number;
  MIN_TITLE_LEN: number;
  MAX_TITLE_LEN: number;
  MIN_DESC_LEN: number;
  MAX_DESC_LEN: number;
  MAX_SHIPPING_COST: number;
  MAX_PRICE: number;
  MIN_YEAR: number;
  MAX_YEAR: number;
  REQUIRE_CATEGORY: boolean;
  REQUIRE_AT_LEAST_ONE_IMAGE: boolean;
};

export const DEFAULT_ARTICLE_RULES: ArticleValidationRules = {
  MAX_IMAGES: 10,
  MIN_TITLE_LEN: 5,
  MAX_TITLE_LEN: 120,
  MIN_DESC_LEN: 20,
  MAX_DESC_LEN: 2500,
  MAX_SHIPPING_COST: 200,
  MAX_PRICE: 100000,
  MIN_YEAR: 1900,
  MAX_YEAR: new Date().getFullYear() + 1,
  REQUIRE_CATEGORY: true,
  REQUIRE_AT_LEAST_ONE_IMAGE: true,
};

export type ArticleDraftInput = {
  title: string;
  description: string;
  price: number | "";
  shippingCost: number | "";
  quantity: number | "";
  imagesCount: number;
  categoryId?: string | null;
  productionYear?: number | "" | null;
};

function toNumberOrNaN(value: number | "" | null | undefined): number {
  if (value === "" || value === null || value === undefined) return NaN;
  return Number(value);
}

export function validateArticleDraft(
  input: ArticleDraftInput,
  rules: ArticleValidationRules = DEFAULT_ARTICLE_RULES
): string[] {
  const errors: string[] = [];

  const t = (input.title ?? "").trim();
  const d = (input.description ?? "").trim();

  const price = toNumberOrNaN(input.price);
  const shipping = toNumberOrNaN(input.shippingCost);

  const quantity = toNumberOrNaN(input.quantity);
  const imagesCount = Number(input.imagesCount ?? 0);

  if (!t) errors.push("Le titre est obligatoire.");
  if (!d) errors.push("La description est obligatoire.");

  if (rules.REQUIRE_CATEGORY && !input.categoryId) {
    errors.push("La catégorie est obligatoire.");
  }

  if (rules.REQUIRE_AT_LEAST_ONE_IMAGE && imagesCount <= 0) {
    errors.push("Ajoutez au moins 1 image.");
  }

  if (t && t.length < rules.MIN_TITLE_LEN)
    errors.push(`Titre trop court (min ${rules.MIN_TITLE_LEN} caractères).`);
  if (t && t.length > rules.MAX_TITLE_LEN)
    errors.push(`Titre trop long (max ${rules.MAX_TITLE_LEN} caractères).`);

  if (d && d.length < rules.MIN_DESC_LEN)
    errors.push(
      `Description trop courte (min ${rules.MIN_DESC_LEN} caractères).`
    );
  if (d && d.length > rules.MAX_DESC_LEN)
    errors.push(
      `Description trop longue (max ${rules.MAX_DESC_LEN} caractères).`
    );

  if (!Number.isFinite(price)) errors.push("Le prix est obligatoire.");
  else {
    if (price <= 0) errors.push("Prix invalide (doit être > 0).");
    if (price > rules.MAX_PRICE)
      errors.push(`Prix trop élevé (max ${rules.MAX_PRICE}).`);
  }

  if (!Number.isFinite(shipping)) errors.push("Frais de livraison invalides.");
  else {
    if (shipping < 0)
      errors.push("Frais de livraison invalides (doivent être ≥ 0).");
    if (shipping > rules.MAX_SHIPPING_COST)
      errors.push(
        `Frais de livraison trop élevés (max ${rules.MAX_SHIPPING_COST}).`
      );
    if (Number.isFinite(price) && price > 0 && shipping > price)
      errors.push("Frais de livraison incohérents (supérieurs au prix).");
  }

  if (!Number.isFinite(quantity)) errors.push("Quantité invalide.");
  else {
    if (!Number.isInteger(quantity))
      errors.push("Quantité invalide (doit être un entier).");
    if (quantity <= 0) errors.push("Quantité invalide (doit être > 0).");
    if (quantity > 999) errors.push("Quantité trop élevée (max 999).");
  }

  if (imagesCount > rules.MAX_IMAGES) {
    errors.push(`Trop d’images (max ${rules.MAX_IMAGES}).`);
  }

  const y = toNumberOrNaN(input.productionYear);

  if (!Number.isFinite(y) || !Number.isInteger(y)) {
    errors.push("Année de production invalide (entier attendu).");
  } else if (y < rules.MIN_YEAR || y > rules.MAX_YEAR) {
    errors.push(
      `Année de production invalide (${rules.MIN_YEAR} - ${rules.MAX_YEAR}).`
    );
  }

  return errors;
}
