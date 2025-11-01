import { getRequestUrl } from "@/lib/getRequestUrl";
import axios from "@/services/axios";

export async function GET(request: Request) {
  try {
    const res = await axios.get(getRequestUrl(request.url));
    return Response.json(res.data);
  } catch (e) {
    console.log("--- get ferti smart error", e);
    return Response.error();
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const res = await axios.post(getRequestUrl(request.url), payload);
    return Response.json(res.data);
  } catch (e) {
    console.log("--- post ferti smart error", e);
    return Response.error();
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = await request.json();
    const res = await axios.patch(getRequestUrl(request.url), payload);
    return Response.json(res.data);
  } catch (e) {
    console.log("--- post ferti smart error", e);
    return Response.error();
  }
}
