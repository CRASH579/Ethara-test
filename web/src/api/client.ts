import axios from "axios";

export const api = axios.create({
  baseURL: "https://api.ethara.geonotes.in/api",
  headers: {
    "Content-Type": "application/json",
  },
});
