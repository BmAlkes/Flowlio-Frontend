import { describe, expect, it } from "vitest";
import { urlBase64ToUint8Array, VAPID_PUBLIC_KEY } from "./webPush";

describe("urlBase64ToUint8Array", () => {
  it("decodes a base64url string into the matching bytes", () => {
    // "AAA-_w" is base64url for bytes [0x00, 0x00, 0x3e, 0xff]
    const result = urlBase64ToUint8Array("AAA-_w");
    expect(Array.from(result)).toEqual([0x00, 0x00, 0x3e, 0xff]);
  });

  it("handles strings that need padding", () => {
    // "-w" (2 chars) needs 2 padding chars to reach a multiple of 4
    const result = urlBase64ToUint8Array("-w");
    expect(result.length).toBeGreaterThan(0);
  });

  it("decodes the real VAPID public key into a 65-byte uncompressed EC point", () => {
    const result = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    expect(result.length).toBe(65);
    expect(result[0]).toBe(0x04); // uncompressed point marker
  });
});
