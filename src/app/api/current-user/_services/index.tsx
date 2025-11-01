import { AUTH_TOKEN_NAME } from "@/constants";
import { verifyToken } from "@/lib/verifyToken";
import { cookies } from "next/headers";

export async function getCurrentUser() {
  try {
    const cookiesStore = await cookies();
    const authToken = cookiesStore.get(AUTH_TOKEN_NAME);
    const decodedToken = verifyToken({ secret: process.env.JWT_SECRET ?? "", token: authToken?.value ?? "" });
    if (!decodedToken) {
      return null;
    }
    return decodedToken;
  } catch (error) {
    console.log("--- get current user error ", error);
    return null;
  }
}
