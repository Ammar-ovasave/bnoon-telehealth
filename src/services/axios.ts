import axios from "axios";
import { getAPIKey as getAPIKeyFromDB } from "../firestore/api_keys";

const instance = axios.create({
  baseURL: process.env.BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.FERTI_SMART_API_KEY,
  },
});

const mapAPIKeys: { [url: string]: string } = {
  "https://unvaunted-weedily-jannie.ngrok-free.dev": "AMpEg6pwR1VKgjnJQ4NUgJ2Sy3gVi77yBfjqL74q",
  "https://undeclarable-kolby-overgraciously.ngrok-free.dev": "-2VY--ga7Nm3RqxkKrj6IJUynVv0w1acifsgB9Cw",
  "https://overhaughty-branda-dowerless.ngrok-free.dev": "qG9SnfSGQsSG4YbvsmjS1QgPDTGgZwsmLxp1fZ3x",
};

export const branchURLs = Object.keys(mapAPIKeys);

async function getAPIKey({ url }: { url: string }) {
  try {
    const urlObj = new URL(url);
    const apiKeyDoc = await getAPIKeyFromDB({ apiURL: urlObj.origin });
    return apiKeyDoc?.key ?? mapAPIKeys[urlObj.origin] ?? Object.values(mapAPIKeys)[0];
  } catch (e) {
    console.log("--- getAPIKey error", e);
    return Object.values(mapAPIKeys)[0];
  }
}

instance.interceptors.request.use(async (config) => {
  const apiKey = await getAPIKey({ url: config.url ?? "" });
  // console.log("--- server request", apiKey, config.url, config.baseURL);
  config.headers["x-api-key"] = apiKey;
  return config;
});

export default instance;
