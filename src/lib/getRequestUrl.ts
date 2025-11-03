export function getRequestUrl({ urlStr }: { urlStr: string }) {
  const url = new URL(urlStr);
  const requestUrl = `${url.pathname}?${url.searchParams.toString()}`
    .split("/")
    .filter((seg) => {
      return seg !== "api" && seg !== "ferti-smart";
    })
    .join("/");
  return requestUrl;
}
