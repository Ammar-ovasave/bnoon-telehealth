import { AUTH_TOKEN_NAME } from "@/constants";
import { verifyToken } from "@/lib/verifyToken";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookiesStore = await cookies();
    const authToken = cookiesStore.get(AUTH_TOKEN_NAME);
    const decodedToken = verifyToken({ secret: process.env.JWT_SECRET ?? "", token: authToken?.value ?? "" });
    if (!decodedToken) {
      return Response.error();
    }
    return Response.json(decodedToken);
  } catch (error) {
    console.log("--- get current user error ", error);
    return Response.error();
  }
}
