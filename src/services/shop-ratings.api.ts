import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export function rateShop(shopId: string, value: number) {
  return axios
    .post(
      `${API_URL}/shop-ratings/${shopId}`,
      { value },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("UserToken")}`,
        },
      }
    )
    .then((r) => r.data);
}
