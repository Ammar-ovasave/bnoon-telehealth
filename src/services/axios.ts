import axios from "axios";

const instance = axios.create({
  baseURL: process.env.BASE_URL,
  headers: { "Content-Type": "application/json", "x-api-key": "7g9ictK-GragXQD70hL1LBYRLPY33O4paVyyQxUQ" },
});

export default instance;
