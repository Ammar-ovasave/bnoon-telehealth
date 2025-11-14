import { getRequestUrl } from "@/lib/getRequestUrl";
import { cookies } from "next/headers";
import axios from "@/services/axios";

export async function GET(request: Request) {
  try {
    const cookiesStore = await cookies();
    const branchAPIURL = cookiesStore.get("branchAPIURL")?.value;
    const res = await axios.get(
      branchAPIURL ? `${branchAPIURL}${getRequestUrl({ urlStr: request.url })}` : getRequestUrl({ urlStr: request.url })
    );
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
    const res = await axios.post(
      branchAPIURL ? `${branchAPIURL}${getRequestUrl({ urlStr: request.url })}` : getRequestUrl({ urlStr: request.url }),
      payload
    );
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
    const res = await axios.patch(
      branchAPIURL ? `${branchAPIURL}${getRequestUrl({ urlStr: request.url })}` : getRequestUrl({ urlStr: request.url }),
      payload
    );
    return Response.json(res.data);
  } catch (e) {
    console.log("--- post ferti smart error", e);
    return Response.error();
  }
}
