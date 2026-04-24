import DOMPurify from "dompurify";

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * Allows common formatting tags and images.
 */
export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "hr",
      "strong", "em", "u", "s", "span",
      "ul", "ol", "li",
      "a", "img",
      "div", "blockquote", "pre", "code"
    ],
    ALLOWED_ATTR: [
      "href", "name", "target", "src", "alt", "title", "style", "class",
      "width", "height"
    ],
    // Ensure links are safe
    ADD_ATTR: ["target"],
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed"],
    FORBID_ATTR: ["onerror", "onclick", "onload"],
  });
};
