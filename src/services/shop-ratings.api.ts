import axios from "axios";
import { API_URL } from "../config";

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
