"use client";
import axios from "axios";
import { FC, PropsWithChildren } from "react";
import { SWRConfig } from "swr";

const instance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use((config) => {
  return config;
});

const SWRProvider: FC<PropsWithChildren & { fallback?: { [key: string]: unknown } }> = ({ children, fallback }) => {
  return (
    <SWRConfig
      value={{
        fallback: fallback,
        fetcher: (resource, init) => instance.get(resource, init).then((res) => res.data),
      }}
    >
      {children}
    </SWRConfig>
  );
};

export default SWRProvider;
