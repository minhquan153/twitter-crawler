import { request } from "./httpClient";

export function getCryptoReport() {
  return request("/crypto-report");
}
