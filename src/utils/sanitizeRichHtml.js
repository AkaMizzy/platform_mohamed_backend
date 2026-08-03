import sanitizeHtml from "sanitize-html";

export function sanitizeRichHtml(value) {
  return sanitizeHtml(value || "", {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "h1", "h2", "h3", "h4", "u", "s", "span", "mark", "img", "iframe",
      "table", "thead", "tbody", "tr", "th", "td",
    ],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["style", "class", "dir", "data-type"],
      a: ["href", "name", "target", "rel", "class"],
      img: ["src", "alt", "title", "width", "height", "class"],
      iframe: ["src", "title", "allow", "allowfullscreen", "frameborder", "class"],
      td: ["colspan", "rowspan", "style"],
      th: ["colspan", "rowspan", "style"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedIframeHostnames: [
      "www.youtube.com",
      "youtube.com",
      "www.youtube-nocookie.com",
      "player.vimeo.com",
    ],
    allowedStyles: {
      "*": {
        color: [/^#[0-9a-f]{3,8}$/i, /^rgb/i],
        "background-color": [/^#[0-9a-f]{3,8}$/i, /^rgb/i],
        "font-size": [/^\d+(?:\.\d+)?(?:px|rem|em|%)$/],
        "text-align": [/^(left|right|center|justify)$/],
      },
    },
  });
}

export function richTextToPlainText(value) {
  return sanitizeHtml(value || "", { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
}
