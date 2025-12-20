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

export async function saveAPIKey(params: { apiURL: string; key: string }) {
  try {
    const existing = await db.collection(API_KEYS_COLLECTION).where("api_url", "==", params.apiURL).get();
    if (existing.docs.length > 0) {
      const docId = existing.docs[0].id;
      await db.collection(API_KEYS_COLLECTION).doc(docId).update({
        key: params.key,
        updatedAt: new Date().toISOString(),
      });
      console.log(`--- Updated API key for ${params.apiURL}`);
    } else {
      await db.collection(API_KEYS_COLLECTION).add({
        api_url: params.apiURL,
        key: params.key,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log(`--- Created new API key for ${params.apiURL}`);
    }
    return true;
  } catch (error) {
    console.log("--- saveAPIKey error", error);
    return false;
  }
}
