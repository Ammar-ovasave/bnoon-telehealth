import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { cookies } from "next/headers";

export default getRequestConfig(async ({ requestLocale }) => {
  const [requested, cookiesStore] = await Promise.all([
    requestLocale,
    cookies()
  ]);
  const localeCookie = cookiesStore.get("NEXT_LOCALE")?.value;
  const validLocale = hasLocale(routing.locales, localeCookie) ? localeCookie : routing.defaultLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : validLocale;
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
