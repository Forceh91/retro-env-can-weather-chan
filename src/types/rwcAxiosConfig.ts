import type { AxiosRequestConfig } from "axios";

export type RwcUpstreamMeta = { feed: string; key?: string };

/** Axios request config plus optional upstream logging metadata (no secrets). */
export type RwcAxiosRequestConfig<D = unknown> = AxiosRequestConfig<D> & {
  rwcUpstream?: RwcUpstreamMeta;
};
