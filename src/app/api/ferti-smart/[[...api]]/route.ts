import axios from "@/services/axios";

function getRequestUrl(urlStr: string) {
  const url = new URL(urlStr);
  const requestUrl = `${url.pathname}?${url.searchParams.toString()}`
    .split("/")
    .filter((seg) => {
      return seg !== "api" && seg !== "ferti-smart";
    })
    .join("/");
  return requestUrl;
}

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
    const res = await axios.post(getRequestUrl(request.url), request.body);
    return Response.json(res.data);
  } catch (e) {
    console.log("--- post ferti smart error", e);
    return Response.error();
  }
}
