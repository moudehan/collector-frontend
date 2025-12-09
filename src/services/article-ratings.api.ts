import axios from "axios";

const API_URL = "http://localhost:4000";

export async function rateArticle(articleId: string, value: number) {
  const res = await axios.post(
    `${API_URL}/article-ratings/${articleId}`,
    { value },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("UserToken")}`,
      },
    }
  );

  return res.data;
}

export async function getArticleRating(articleId: string) {
  const res = await axios.get(`${API_URL}/article-ratings/${articleId}`);
  return res.data as {
    avgRating: number;
    ratingsCount: number;
  };
}
