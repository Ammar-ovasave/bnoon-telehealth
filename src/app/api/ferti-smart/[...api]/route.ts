import { getRequestUrl } from "@/lib/getRequestUrl";
import { cookies } from "next/headers";
import axios from "@/services/axios";

export async function GET(request: Request) {
  try {
    const cookiesStore = await cookies();
    const branchAPIURL = cookiesStore.get("branchAPIURL")?.value;
    if (!branchAPIURL) {
      return Response.json({ error: "No branch selected" }, { status: 400 });
    }
    const res = await axios.get(`${branchAPIURL}${getRequestUrl({ urlStr: request.url })}`);
    return Response.json(res.data);
  } catch (e) {
    console.log("--- get ferti smart error", request.url, e);
    return Response.error();
  }
}

export async function POST(request: Request) {
  try {
    const [cookiesStore, payload] = await Promise.all([cookies(), request.json()]);
    const branchAPIURL = cookiesStore.get("branchAPIURL")?.value;
    if (!branchAPIURL) {
      return Response.json({ error: "No branch selected" }, { status: 400 });
    }
    const res = await axios.post(`${branchAPIURL}${getRequestUrl({ urlStr: request.url })}`, payload);
    return Response.json(res.data);
  } catch (e) {
    console.log("--- post ferti smart error", e);
    return Response.error();
  }
}

export async function PATCH(request: Request) {
  try {
    const [cookiesStore, payload] = await Promise.all([cookies(), request.json()]);
    const branchAPIURL = cookiesStore.get("branchAPIURL")?.value;
    if (!branchAPIURL) {
      return Response.json({ error: "No branch selected" }, { status: 400 });
    }
    const res = await axios.patch(`${branchAPIURL}${getRequestUrl({ urlStr: request.url })}`, payload);
    return Response.json(res.data);
  } catch (e) {
    console.log("--- patch ferti smart error", e);
    return Response.error();
  }
}
