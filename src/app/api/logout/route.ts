import { AUTH_TOKEN_NAME } from "@/constants";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    // Clear auth token
    cookieStore.delete(AUTH_TOKEN_NAME);
    // Clear selected branch
    cookieStore.delete("branchId");
    return Response.json({});
  } catch (error) {
    console.log("--- logout error", error);
    return Response.error();
  }
}
