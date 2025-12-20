import { db } from ".";

const API_KEYS_COLLECTION = "api_keys";

export type APIKeyDocumentType = { api_url: string; key: string };

export async function getAPIKey(params: { apiURL: string }) {
  try {
    const res = await db.collection(API_KEYS_COLLECTION).where("api_url", "==", params.apiURL).get();
    const doc = res.docs[0].data();
    return doc as APIKeyDocumentType;
  } catch (error) {
    console.log("--- getAPIKey error", error);
    return null;
  }
}
