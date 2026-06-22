import { Buffer } from "buffer";

export interface CachedSegment {
  body: Buffer;
  type: string;
}

export interface Cache {
  get(key: string): CachedSegment | null;
  set(key: string, value: CachedSegment): void;
}
