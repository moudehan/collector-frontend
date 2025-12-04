import { API_URL } from "../config";

export async function fetchPublicArticles() {
  try {
    const res = await fetch(`${API_URL}/articles`);

    if (!res.ok) {
      throw new Error("Erreur lors de la récupération des articles");
    }

    return await res.json();
  } catch (err) {
    console.error("API ERROR:", err);
    throw err;
  }
}

export async function fetchArticlesByCategory(categoryId: string) {
  const res = await fetch(`${API_URL}/articles?categoryId=${categoryId}`);

  if (!res.ok) {
    throw new Error("Erreur lors du chargement des articles filtrés");
  }

  return res.json();
}

export async function getFollowingArticles() {
  const token = localStorage.getItem("UserToken");
  const res = await fetch(`${API_URL}/articles/following`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function getRecommendedArticles() {
  const token = localStorage.getItem("UserToken");
  const res = await fetch(`${API_URL}/articles/recommendations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
