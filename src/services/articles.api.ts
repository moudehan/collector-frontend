import { API_URL } from "../config";

export async function fetchPublicArticles() {
  try {
    const res = await fetch(`${API_URL}/articles/public`);

    if (!res.ok) {
      throw new Error("Erreur lors de la récupération des articles");
    }

    return await res.json();
  } catch (err) {
    console.error("API ERROR:", err);
    throw err;
  }
}

export async function fetchPrivateArticles() {
  try {
    const token = localStorage.getItem("UserToken");

    const res = await fetch(`${API_URL}/articles`, {
      headers: { Authorization: `Bearer ${token}` },
    });

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

export async function getArticleById(id: string) {
  const token = localStorage.getItem("UserToken");

  const res = await fetch(`${API_URL}/articles/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Impossible de charger l'article");

  return res.json();
}

export async function deleteArticle(id: string) {
  const token = localStorage.getItem("UserToken");

  const res = await fetch(`${API_URL}/articles/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Suppression impossible");

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

export async function createArticle(formData: FormData) {
  const token = localStorage.getItem("UserToken");

  const res = await fetch(`${API_URL}/articles`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Erreur lors de la création de l’article");

  return res.json();
}

export async function updateArticle(id: string, formData: FormData) {
  const token = localStorage.getItem("UserToken");

  const res = await fetch(`${API_URL}/articles/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la modification");
  }

  return res.json();
}

export async function followArticle(id: string | number) {
  const token = localStorage.getItem("UserToken");

  const res = await fetch(`${API_URL}/articles/${id}/follow`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Erreur lors du follow de l’article");
  }

  return res.json();
}

export async function unfollowArticle(id: string | number) {
  const token = localStorage.getItem("UserToken");

  const res = await fetch(`${API_URL}/articles/${id}/follow`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Erreur lors du unfollow de l’article");
  }

  return res.json();
}
