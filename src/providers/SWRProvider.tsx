"use client";
import axios from "axios";
import { FC, PropsWithChildren } from "react";
import { SWRConfig } from "swr";

const instance = axios.create({
  headers: { "Content-Type": "application/json", "x-api-key": "7g9ictK-GragXQD70hL1LBYRLPY33O4paVyyQxUQ" },
});

const SWRProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <SWRConfig
      value={{
        fetcher: (resource, init) => instance.get(resource, init).then((res) => res.data),
      }}
    >
      {children}
    </SWRConfig>
  );
};

export default SWRProvider;
