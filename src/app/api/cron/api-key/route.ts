import { createNewAPIKey } from "@/services/appointment-services";
import { saveAPIKey } from "@/firestore/api_keys";
import { branchURLs } from "@/services/axios";

export async function GET() {
  await Promise.all(
    branchURLs.map((url) => {
      return updateClinicBranchAPIKey({ baseAPIURL: url });
    })
  );
  return Response.json({});
}

async function updateClinicBranchAPIKey({ baseAPIURL }: { baseAPIURL: string }) {
  try {
    if (!baseAPIURL) {
      console.log("--- API key cron error: BASE_URL environment variable is not set");
      return Response.json({ error: "BASE_URL not configured" }, { status: 500 });
    }
    console.log(`--- Starting API key rotation for ${baseAPIURL}`);
    // Create new API key
    const result = await createNewAPIKey({ baseAPIURL });
    if (!result?.apiKey) {
      console.log("--- API key cron error: Failed to create new API key", result);
      return Response.json({ error: "Failed to create API key" }, { status: 500 });
    }
    // Save the new API key to Firestore
    const saved = await saveAPIKey({
      apiURL: baseAPIURL,
      key: result.apiKey,
    });
    if (!saved) {
      console.log("--- API key cron error: Failed to save API key to database");
      return Response.json({ error: "Failed to save API key" }, { status: 500 });
    }
    console.log(`--- Successfully rotated API key for ${baseAPIURL}`);
    return Response.json({
      success: true,
      message: "API key rotated successfully",
      apiURL: baseAPIURL,
    });
  } catch (error) {
    console.log("--- API key cron error", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
