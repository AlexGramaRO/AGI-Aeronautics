import { isCloudflare } from "./runtime";

export function packEmbedding(values: number[]) {
  return isCloudflare() ? JSON.stringify(values) : values;
}

export function unpackEmbedding(value: number[] | string): number[] {
  if (typeof value === "string") return JSON.parse(value) as number[];
  return value;
}
