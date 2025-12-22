const API_URL = import.meta.env.VITE_API_URL;

export async function fetchPublicCategories() {
  try {
    const res = await fetch(`${API_URL}/categories`);

    if (!res.ok) {
      throw new Error("Impossible de charger les catégories");
    }

    return await res.json();
  } catch (error) {
    console.error("Erreur API catégories :", error);
    throw error;
  }
}
