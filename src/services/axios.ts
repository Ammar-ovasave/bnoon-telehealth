import axios from "axios";

const instance = axios.create({
  baseURL: process.env.BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.FERTI_SMART_API_KEY,
  },
});

instance.interceptors.request.use((config) => {
  // console.log("--- server request", config.url);
  return config;
});

export default instance;
