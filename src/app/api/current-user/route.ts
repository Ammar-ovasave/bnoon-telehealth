import { getCurrentUser } from "./_services";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    return Response.json(currentUser);
  } catch (error) {
    console.log("--- get current user error ", error);
    return Response.error();
  }
}
