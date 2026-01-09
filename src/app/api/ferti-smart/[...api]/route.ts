import { getRequestUrl } from "@/lib/getRequestUrl";
import { cookies } from "next/headers";
import axios from "@/services/axios";
import { AxiosError } from "axios";

export async function GET(request: Request) {
  try {
    const cookiesStore = await cookies();
    const branchAPIURL = cookiesStore.get("branchAPIURL")?.value;
    console.log("--- ferti-smart GET branchAPIURL:", branchAPIURL ? "set" : "NOT SET");
    if (!branchAPIURL) {
      console.log("--- ferti-smart GET: No branch cookie found");
      return Response.json({ error: "No branch selected" }, { status: 400 });
    }
    const requestUrl = getRequestUrl({ urlStr: request.url });
    console.log("--- ferti-smart GET:", `${branchAPIURL}${requestUrl}`);
    const res = await axios.get(`${branchAPIURL}${requestUrl}`);
    return Response.json(res.data);
  } catch (e) {
    const axiosError = e as AxiosError;
    console.log("--- get ferti smart error", request.url, axiosError.response?.status, axiosError.message);
    // Return the actual status code from FertiSmart API
    const status = axiosError.response?.status || 500;
    return Response.json(
      { error: axiosError.message || "FertiSmart API error" },
      { status }
    );
  }
}

export async function POST(request: Request) {
  try {
    const [cookiesStore, payload] = await Promise.all([cookies(), request.json()]);
    const branchAPIURL = cookiesStore.get("branchAPIURL")?.value;
    console.log("--- ferti-smart POST branchAPIURL:", branchAPIURL ? "set" : "NOT SET");
    if (!branchAPIURL) {
      return Response.json({ error: "No branch selected" }, { status: 400 });
    }
    const requestUrl = getRequestUrl({ urlStr: request.url });
    const res = await axios.post(`${branchAPIURL}${requestUrl}`, payload);
    return Response.json(res.data);
  } catch (e) {
    const axiosError = e as AxiosError;
    console.log("--- post ferti smart error", request.url, axiosError.response?.status, axiosError.message);
    const status = axiosError.response?.status || 500;
    return Response.json(
      { error: axiosError.message || "FertiSmart API error" },
      { status }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const [cookiesStore, payload] = await Promise.all([cookies(), request.json()]);
    const branchAPIURL = cookiesStore.get("branchAPIURL")?.value;
    console.log("--- ferti-smart PATCH branchAPIURL:", branchAPIURL ? "set" : "NOT SET");
    if (!branchAPIURL) {
      return Response.json({ error: "No branch selected" }, { status: 400 });
    }
    const requestUrl = getRequestUrl({ urlStr: request.url });
    const res = await axios.patch(`${branchAPIURL}${requestUrl}`, payload);
    return Response.json(res.data);
  } catch (e) {
    const axiosError = e as AxiosError;
    console.log("--- patch ferti smart error", request.url, axiosError.response?.status, axiosError.message);
    const status = axiosError.response?.status || 500;
    return Response.json(
      { error: axiosError.message || "FertiSmart API error" },
      { status }
    );
  }
}
