import axios from "axios";

/**
 * @deprecated - This axios instance is for legacy FertiSmart direct calls.
 * New code should use bnoon-api client instead.
 * TODO: Remove when all FertiSmart calls are migrated to bnoon-api.
 */
const instance = axios.create({
  baseURL: process.env.BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.FERTI_SMART_API_KEY,
  },
});

/**
 * @deprecated - API keys are now managed by bnoon-api via environment variables
 */
const mapAPIKeys: { [url: string]: string } = {
  "https://unvaunted-weedily-jannie.ngrok-free.dev": "AMpEg6pwR1VKgjnJQ4NUgJ2Sy3gVi77yBfjqL74q",
  "https://undeclarable-kolby-overgraciously.ngrok-free.dev": "-2VY--ga7Nm3RqxkKrj6IJUynVv0w1acifsgB9Cw",
  "https://overhaughty-branda-dowerless.ngrok-free.dev": "qG9SnfSGQsSG4YbvsmjS1QgPDTGgZwsmLxp1fZ3x",
};

export const branchURLs = Object.keys(mapAPIKeys);

function getAPIKey({ url }: { url: string }): string {
  try {
    const urlObj = new URL(url);
    return mapAPIKeys[urlObj.origin] ?? Object.values(mapAPIKeys)[0];
  } catch {
    return Object.values(mapAPIKeys)[0];
  }
}

instance.interceptors.request.use(async (config) => {
  const apiKey = getAPIKey({ url: config.url ?? "" });
  config.headers["x-api-key"] = apiKey;
  return config;
});

export default instance;
