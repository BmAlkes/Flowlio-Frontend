import { pdf } from "@react-pdf/renderer";
import type React from "react";

/**
 * Generates a PDF blob from a react-pdf element.
 * Retries once on font-loading failures (fonts are fetched from CDN on first use).
 */
export async function generatePdfBlob(
  element: React.ReactElement,
  retries = 1
): Promise<Blob> {
  try {
    return await pdf(element).toBlob();
  } catch (err: any) {
    const isFontError =
      typeof err?.message === "string" &&
      (err.message.includes("font") || err.message.includes("Font"));

    if (isFontError && retries > 0) {
      // Font CDN download in progress — wait briefly and retry.
      await new Promise((r) => setTimeout(r, 1500));
      return generatePdfBlob(element, retries - 1);
    }

    throw err;
  }
}
