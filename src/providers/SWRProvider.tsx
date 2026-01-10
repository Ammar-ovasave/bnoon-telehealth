"use client";
import axios, { AxiosError } from "axios";
import { FC, PropsWithChildren, useEffect } from "react";
import { SWRConfig, mutate } from "swr";

const LOCALE_STORAGE_KEY = "swr-locale";

const instance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

const SWRProvider: FC<PropsWithChildren & { fallback?: { [key: string]: unknown }; locale: string }> = ({ children, fallback, locale }) => {

  // Revalidate all SWR cache when locale changes
  // Use localStorage to persist previous locale across component remounts
  useEffect(() => {
    const previousLocale = localStorage.getItem(LOCALE_STORAGE_KEY);

    if (previousLocale && previousLocale !== locale) {
      // Locale changed - revalidate all cached data to refetch with new language
      mutate(() => true);
    }

    // Always update stored locale
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  return (
    <SWRConfig
      value={{
        fallback: fallback,
        fetcher: (resource, init) =>
          instance
            .get(resource, {
              ...init,
              headers: {
                ...init?.headers,
                "Accept-Language": locale,
              },
            })
            .then((res) => res.data),
        shouldRetryOnError: (error: AxiosError) => {
          const status = error?.response?.status;
          // Only retry on 5xx server errors, not 4xx client errors
          if (status && status >= 400 && status < 500) return false;
          return true;
        },
      }}
    >
      {children}
    </SWRConfig>
  );
};

export default SWRProvider;
